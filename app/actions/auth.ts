"use server"

import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import type { AuthActionState } from "@/lib/auth/action-state"
import prisma from "@/lib/prisma"
import { APP_ROLES, sanitizeReturnToPath, type AppRole } from "@/lib/auth/routing"
import {
  clearLocalAuthSessionCookie,
  createLocalAuthSession,
  isLocalAuthMockCredentials,
  isLocalAuthMockEnabled,
  LOCAL_AUTH_MOCK_ACCOUNT,
  setLocalAuthSessionCookie,
} from "@/lib/auth/mock-auth"
import { createClient } from "@/lib/supabase/server"

const VALID_ROLES = new Set<AppRole>(APP_ROLES)

const loginSchema = z.object({
  email: z.string().trim().email("Vui lòng nhập email hợp lệ."),
  password: z.string().min(1, "Vui lòng nhập mật khẩu."),
  returnTo: z.string().optional().nullable(),
})

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Vui lòng nhập email hợp lệ."),
})

function mapProfileRole(role: string): AppRole | null {
  return VALID_ROLES.has(role as AppRole) ? (role as AppRole) : null
}

async function getRequestBaseUrl() {
  const requestHeaders = await headers()
  const origin = requestHeaders.get("origin")

  if (origin) {
    return origin
  }

  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http"
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")

  if (!host) {
    throw new Error("Không thể xác định host yêu cầu để chuyển hướng xác thực.")
  }

  return `${protocol}://${host}`
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    returnTo: formData.get("returnTo"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Dữ liệu đăng nhập không hợp lệ.",
    }
  }

  if (isLocalAuthMockEnabled()) {
    if (!isLocalAuthMockCredentials(parsed.data.email, parsed.data.password)) {
      return {
        status: "error",
        message: `Chỉ hỗ trợ tài khoản demo ${LOCAL_AUTH_MOCK_ACCOUNT.email} trong chế độ local mock.`,
      }
    }

    const cookieStore = await cookies()
    const session = createLocalAuthSession()

    setLocalAuthSessionCookie(cookieStore, session)
    redirect(sanitizeReturnToPath(parsed.data.returnTo, session.role))
  }

  const supabase = await createClient()

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (signInError) {
    return {
      status: "error",
      message: "Email hoặc mật khẩu không đúng.",
    }
  }

  const { data, error: claimsError } = await supabase.auth.getClaims()
  const userId =
    !claimsError && typeof data?.claims?.sub === "string" ? data.claims.sub : null

  if (!userId) {
    await supabase.auth.signOut()
    redirect("/unauthorized?reason=session")
  }

  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
      isActive: true,
    },
  })

  const role = profile ? mapProfileRole(profile.role) : null

  if (!profile || !role) {
    await supabase.auth.signOut()
    redirect("/unauthorized?reason=missing-profile")
  }

  if (!profile.isActive) {
    await supabase.auth.signOut()
    redirect("/unauthorized?reason=inactive")
  }

  await prisma.profile.update({
    where: { id: userId },
    data: {
      lastLoginAt: new Date(),
    },
  })

  redirect(sanitizeReturnToPath(parsed.data.returnTo, role))
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  })

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    }
  }

  if (isLocalAuthMockEnabled()) {
    return {
      status: "success",
      message:
        `Chế độ mock local không gửi email đặt lại mật khẩu. Hãy dùng tài khoản demo ${LOCAL_AUTH_MOCK_ACCOUNT.email} trên màn đăng nhập.`,
    }
  }

  const supabase = await createClient()
  const baseUrl = await getRequestBaseUrl()

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${baseUrl}/reset-password`,
  })

  if (error) {
    return {
      status: "error",
      message: "Chưa thể gửi liên kết đặt lại mật khẩu. Vui lòng thử lại.",
    }
  }

  return {
    status: "success",
    message:
      "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi liên kết đặt lại mật khẩu.",
  }
}

export async function signOutAction() {
  if (isLocalAuthMockEnabled()) {
    const cookieStore = await cookies()
    clearLocalAuthSessionCookie(cookieStore)
    redirect("/login")
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}