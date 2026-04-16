export const APP_ROLES = ["admin", "seaport_staff", "dryport_staff", "customer"] as const

export type AppRole = (typeof APP_ROLES)[number]
export type RouteSurface = "auth" | "internal" | "portal" | "public"

const AUTH_PATHS = ["/login", "/forgot-password", "/reset-password", "/unauthorized"] as const
const INTERNAL_PREFIXES = ["/containers", "/customs", "/settings", "/transport", "/users", "/ahp", "/simulation"] as const

function normalizePathname(pathname: string) {
  if (!pathname) {
    return "/"
  }

  const [path] = pathname.split("?")
  return path.startsWith("/") ? path : `/${path}`
}

function hasPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function getRouteSurface(pathname: string): RouteSurface {
  const normalizedPathname = normalizePathname(pathname)

  if (AUTH_PATHS.some((path) => hasPrefix(normalizedPathname, path))) {
    return "auth"
  }

  if (hasPrefix(normalizedPathname, "/portal")) {
    return "portal"
  }

  if (
    normalizedPathname === "/" ||
    INTERNAL_PREFIXES.some((prefix) => hasPrefix(normalizedPathname, prefix))
  ) {
    return "internal"
  }

  return "public"
}

export function getDefaultPathForRole(role: AppRole) {
  return role === "customer" ? "/portal" : "/"
}

export function canAccessSurface(role: AppRole, surface: RouteSurface) {
  if (surface === "auth" || surface === "public") {
    return true
  }

  if (surface === "portal") {
    return role === "customer"
  }

  return role !== "customer"
}

function isSafeLocalPath(pathname: string) {
  return pathname.startsWith("/") && !pathname.startsWith("//")
}

export function sanitizeReturnToPath(returnTo: string | null | undefined, role: AppRole) {
  const fallback = getDefaultPathForRole(role)

  if (!returnTo) {
    return fallback
  }

  const trimmed = returnTo.trim()

  if (!trimmed || !isSafeLocalPath(trimmed)) {
    return fallback
  }

  const surface = getRouteSurface(trimmed)

  if (surface === "auth" || !canAccessSurface(role, surface)) {
    return fallback
  }

  return trimmed
}
