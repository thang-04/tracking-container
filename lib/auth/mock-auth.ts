import { APP_ROLES, type AppRole } from "@/lib/auth/routing"

export const LOCAL_AUTH_MOCK_ACCOUNT = {
  email: "admin.demo@tracking.local",
  password: "Demo@123456",
  fullName: "Admin Demo",
  role: "admin" as const,
}

export const LOCAL_AUTH_MOCK_SESSION_COOKIE = "tracking-local-auth-session"
export const LOCAL_AUTH_MOCK_USER_ID = "local-auth-mock-admin"

const LOCAL_AUTH_MOCK_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const LOCAL_AUTH_MOCK_VERSION = 1
const VALID_ROLES = new Set<AppRole>(APP_ROLES)

type CookieWriter = {
  set(
    name: string,
    value: string,
    options?: {
      path?: string
      httpOnly?: boolean
      sameSite?: "lax" | "strict" | "none"
      secure?: boolean
      maxAge?: number
    },
  ): void
}

type CookieReader = {
  get(name: string): { value: string } | undefined
}

export type LocalAuthSession = {
  userId: string
  email: string
  fullName: string
  role: AppRole
  isActive: boolean
  customerId: string | null
  portId: string | null
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && VALID_ROLES.has(value as AppRole)
}

function safeDecodeURIComponent(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function getCookieValue(cookieString: string | null | undefined, cookieName: string) {
  if (!cookieString) {
    return null
  }

  const cookiePrefix = `${cookieName}=`

  for (const chunk of cookieString.split(";")) {
    const trimmedChunk = chunk.trim()

    if (trimmedChunk.startsWith(cookiePrefix)) {
      return trimmedChunk.slice(cookiePrefix.length)
    }
  }

  return null
}

function isLocalAuthSession(value: unknown): value is LocalAuthSession {
  if (!value || typeof value !== "object") {
    return false
  }

  const session = value as Partial<LocalAuthSession>

  return (
    typeof session.userId === "string" &&
    typeof session.email === "string" &&
    typeof session.fullName === "string" &&
    isAppRole(session.role) &&
    typeof session.isActive === "boolean" &&
    (session.customerId === null || typeof session.customerId === "string") &&
    (session.portId === null || typeof session.portId === "string")
  )
}

export function isLocalAuthMockEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_LOCAL_AUTH_MOCK === "true"
}

export function isLocalAuthMockCredentials(email: string, password: string) {
  return (
    normalizeEmail(email) === LOCAL_AUTH_MOCK_ACCOUNT.email &&
    password === LOCAL_AUTH_MOCK_ACCOUNT.password
  )
}

export function createLocalAuthSession(): LocalAuthSession {
  return {
    userId: LOCAL_AUTH_MOCK_USER_ID,
    email: LOCAL_AUTH_MOCK_ACCOUNT.email,
    fullName: LOCAL_AUTH_MOCK_ACCOUNT.fullName,
    role: LOCAL_AUTH_MOCK_ACCOUNT.role,
    isActive: true,
    customerId: null,
    portId: null,
  }
}

export function encodeLocalAuthSession(session: LocalAuthSession) {
  return encodeURIComponent(
    JSON.stringify({
      version: LOCAL_AUTH_MOCK_VERSION,
      session,
    }),
  )
}

export function decodeLocalAuthSession(value: string | null | undefined) {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(safeDecodeURIComponent(value)) as {
      version?: number
      session?: unknown
    }

    if (parsed.version !== LOCAL_AUTH_MOCK_VERSION || !isLocalAuthSession(parsed.session)) {
      return null
    }

    return parsed.session
  } catch {
    return null
  }
}

export function readLocalAuthSessionFromCookieValue(value: string | null | undefined) {
  return decodeLocalAuthSession(value)
}

export function readLocalAuthSessionFromCookieHeader(cookieHeader: string | null | undefined) {
  const value = getCookieValue(cookieHeader, LOCAL_AUTH_MOCK_SESSION_COOKIE)
  return decodeLocalAuthSession(value)
}

export function setLocalAuthSessionCookie(cookieStore: CookieWriter, session = createLocalAuthSession()) {
  cookieStore.set(LOCAL_AUTH_MOCK_SESSION_COOKIE, encodeLocalAuthSession(session), {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: LOCAL_AUTH_MOCK_COOKIE_MAX_AGE_SECONDS,
  })
}

export function clearLocalAuthSessionCookie(cookieStore: CookieWriter) {
  cookieStore.set(LOCAL_AUTH_MOCK_SESSION_COOKIE, "", {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  })
}