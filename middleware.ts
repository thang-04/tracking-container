import { NextResponse, type NextRequest } from "next/server"

import { getRouteSurface } from "@/lib/auth/routing"
import {
  isLocalAuthMockEnabled,
  LOCAL_AUTH_MOCK_SESSION_COOKIE,
  readLocalAuthSessionFromCookieValue,
} from "@/lib/auth/mock-auth"
import { applyPendingCookies, updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const surface = getRouteSurface(request.nextUrl.pathname)

  if (isLocalAuthMockEnabled()) {
    const session = readLocalAuthSessionFromCookieValue(
      request.cookies.get(LOCAL_AUTH_MOCK_SESSION_COOKIE)?.value,
    )

    if ((surface === "internal" || surface === "portal") && !session) {
      const loginUrl = new URL("/login", request.url)
      const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`

      loginUrl.searchParams.set("next", returnTo || "/")

      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  }

  const { response, pendingCookies, userId } = await updateSession(request)

  if ((surface === "internal" || surface === "portal") && !userId) {
    const loginUrl = new URL("/login", request.url)
    const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`

    loginUrl.searchParams.set("next", returnTo || "/")

    return applyPendingCookies(NextResponse.redirect(loginUrl), pendingCookies)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}