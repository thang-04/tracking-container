import test from "node:test"
import assert from "node:assert/strict"

import {
  canAccessSurface,
  getDefaultPathForRole,
  getRouteSurface,
  sanitizeReturnToPath,
  type AppRole,
} from "../../lib/auth/routing.ts"

test("classifies auth routes correctly", () => {
  assert.equal(getRouteSurface("/login"), "auth")
  assert.equal(getRouteSurface("/forgot-password"), "auth")
  assert.equal(getRouteSurface("/reset-password"), "auth")
  assert.equal(getRouteSurface("/unauthorized"), "auth")
})

test("classifies portal and internal routes correctly", () => {
  assert.equal(getRouteSurface("/"), "internal")
  assert.equal(getRouteSurface("/containers"), "internal")
  assert.equal(getRouteSurface("/map"), "internal")
  assert.equal(getRouteSurface("/portal"), "portal")
  assert.equal(getRouteSurface("/portal/history"), "portal")
})

test("returns the correct default destination for each role", () => {
  const internalRoles: AppRole[] = ["admin", "seaport_staff", "dryport_staff"]

  for (const role of internalRoles) {
    assert.equal(getDefaultPathForRole(role), "/")
  }

  assert.equal(getDefaultPathForRole("customer"), "/portal")
})

test("allows only the right route surfaces per role", () => {
  assert.equal(canAccessSurface("admin", "internal"), true)
  assert.equal(canAccessSurface("admin", "portal"), false)
  assert.equal(canAccessSurface("customer", "portal"), true)
  assert.equal(canAccessSurface("customer", "internal"), false)
  assert.equal(canAccessSurface("customer", "auth"), true)
})

test("keeps a safe return path when the role can access it", () => {
  assert.equal(sanitizeReturnToPath("/containers", "admin"), "/containers")
  assert.equal(sanitizeReturnToPath("/portal", "customer"), "/portal")
  assert.equal(sanitizeReturnToPath("/portal/history?container=MSCU1", "customer"), "/portal/history?container=MSCU1")
})

test("falls back to the role home when return path is unsafe or forbidden", () => {
  assert.equal(sanitizeReturnToPath("https://evil.example/login", "admin"), "/")
  assert.equal(sanitizeReturnToPath("//evil.example", "customer"), "/portal")
  assert.equal(sanitizeReturnToPath("/containers", "customer"), "/portal")
  assert.equal(sanitizeReturnToPath("/login", "admin"), "/")
  assert.equal(sanitizeReturnToPath("", "customer"), "/portal")
  assert.equal(sanitizeReturnToPath(null, "admin"), "/")
})
