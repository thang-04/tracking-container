import { NextResponse, type NextRequest } from "next/server"

import { getRouteSurface } from "@/lib/auth/routing"
import { applyPendingCookies, updateSession } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { response, pendingCookies, userId } = await updateSession(request)
  const surface = getRouteSurface(request.nextUrl.pathname)

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
