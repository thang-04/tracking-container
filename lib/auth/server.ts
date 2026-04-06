import "server-only"

import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import prisma from "@/lib/prisma"
import {
  APP_ROLES,
  getDefaultPathForRole,
  sanitizeReturnToPath,
  type AppRole,
} from "@/lib/auth/routing"
import {
  isLocalAuthMockEnabled,
  LOCAL_AUTH_MOCK_SESSION_COOKIE,
  readLocalAuthSessionFromCookieValue,
  type LocalAuthSession,
} from "@/lib/auth/mock-auth"
import { createClient } from "@/lib/supabase/server"

const VALID_ROLES = new Set<AppRole>(APP_ROLES)

export type AuthProfile = {
  id: string
  email: string
  fullName: string
  role: AppRole
  isActive: boolean
  customerId: string | null
  portId: string | null
}

export type AuthContext = {
  userId: string
  email: string | null
  profile: AuthProfile | null
}

export type ActiveAuthContext = {
  userId: string
  email: string | null
  profile: AuthProfile
}

function mapProfileRole(role: string): AppRole | null {
  return VALID_ROLES.has(role as AppRole) ? (role as AppRole) : null
}

function mapLocalAuthSessionToProfile(session: LocalAuthSession): AuthProfile {
  return {
    id: session.userId,
    email: session.email,
    fullName: session.fullName,
    role: session.role,
    isActive: session.isActive,
    customerId: session.customerId,
    portId: session.portId,
  }
}

export const getCurrentAuthContext = cache(async (): Promise<AuthContext | null> => {
  if (isLocalAuthMockEnabled()) {
    const cookieStore = await cookies()
    const session = readLocalAuthSessionFromCookieValue(
      cookieStore.get(LOCAL_AUTH_MOCK_SESSION_COOKIE)?.value,
    )

    if (!session) {
      return null
    }

    return {
      userId: session.userId,
      email: session.email,
      profile: mapLocalAuthSessionToProfile(session),
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  const userId = !error && typeof data?.claims?.sub === "string"
    ? data.claims.sub
    : null

  if (!userId) {
    return null
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
      customerId: true,
      portId: true,
    },
  })

  if (!profile) {
    return {
      userId,
      email: typeof data?.claims?.email === "string" ? data.claims.email : null,
      profile: null,
    }
  }

  const role = mapProfileRole(profile.role)

  if (!role) {
    return {
      userId,
      email: profile.email,
      profile: null,
    }
  }

  return {
    userId,
    email: profile.email,
    profile: {
      ...profile,
      role,
    },
  }
})

export async function redirectAuthenticatedUser(returnTo?: string | null) {
  const auth = await getCurrentAuthContext()

  if (!auth) {
    return
  }

  if (!auth.profile) {
    redirect("/unauthorized?reason=missing-profile")
  }

  if (!auth.profile.isActive) {
    redirect("/unauthorized?reason=inactive")
  }

  redirect(sanitizeReturnToPath(returnTo, auth.profile.role))
}

export async function requireInternalAccess() {
  const auth = await getCurrentAuthContext()

  if (!auth) {
    redirect("/login")
  }

  if (!auth.profile) {
    redirect("/unauthorized?reason=missing-profile")
  }

  if (!auth.profile.isActive) {
    redirect("/unauthorized?reason=inactive")
  }

  if (auth.profile.role === "customer") {
    redirect("/portal")
  }

  return auth as ActiveAuthContext
}

export async function requireCustomerAccess() {
  const auth = await getCurrentAuthContext()

  if (!auth) {
    redirect("/login")
  }

  if (!auth.profile) {
    redirect("/unauthorized?reason=missing-profile")
  }

  if (!auth.profile.isActive) {
    redirect("/unauthorized?reason=inactive")
  }

  if (auth.profile.role !== "customer") {
    redirect(getDefaultPathForRole(auth.profile.role))
  }

  return auth as ActiveAuthContext & {
    profile: AuthProfile & {
      role: "customer"
    }
  }
}