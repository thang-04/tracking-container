import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { getSupabaseEnv } from "@/lib/supabase/env"

type PendingCookie = {
  name: string
  value: string
  options?: CookieOptions
}

export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv()

  let response = NextResponse.next({
    request,
  })

  const pendingCookies: PendingCookie[] = []

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        pendingCookies.splice(0, pendingCookies.length, ...cookiesToSet)

        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        response = NextResponse.next({
          request,
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { data, error } = await supabase.auth.getClaims()

  return {
    response,
    pendingCookies,
    userId:
      !error && typeof data?.claims?.sub === "string" ? data.claims.sub : null,
  }
}

export function applyPendingCookies(
  response: NextResponse,
  pendingCookies: PendingCookie[],
) {
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })

  return response
}
