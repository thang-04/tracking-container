import test from "node:test"
import assert from "node:assert/strict"

import {
  buildUserDirectoryStats,
  filterUserDirectoryItems,
  getUserRoleMeta,
  getUserStatusMeta,
  type UserDirectoryItem,
} from "../../lib/users/user-view-model.ts"

const users: UserDirectoryItem[] = [
  {
    id: "u1",
    fullName: "Nguyen Van Admin",
    email: "admin@example.com",
    phone: "0901",
    role: "admin",
    isActive: true,
    scopeLabel: "Toan he thong",
    lastLoginAtLabel: "2026-04-05 08:00",
  },
  {
    id: "u2",
    fullName: "Tran Thi Seaport",
    email: "seaport@example.com",
    phone: null,
    role: "seaport_staff",
    isActive: true,
    scopeLabel: "Cang Hai Phong",
    lastLoginAtLabel: "Chua dang nhap",
  },
  {
    id: "u3",
    fullName: "Pham Customer",
    email: "customer@example.com",
    phone: null,
    role: "customer",
    isActive: false,
    scopeLabel: "Cong ty ABC",
    lastLoginAtLabel: "2026-04-04 17:20",
  },
]

test("maps user roles and statuses to Vietnamese UI labels", () => {
  assert.equal(getUserRoleMeta("admin").label, "Quản trị viên")
  assert.equal(getUserRoleMeta("seaport_staff").label, "Nhân viên cảng biển")
  assert.equal(getUserRoleMeta("dryport_staff").label, "Nhân viên cảng cạn")
  assert.equal(getUserRoleMeta("customer").label, "Khách hàng")

  assert.equal(getUserStatusMeta(true).label, "Hoạt động")
  assert.equal(getUserStatusMeta(false).label, "Không hoạt động")
})

test("builds zero-safe user statistics", () => {
  assert.deepEqual(buildUserDirectoryStats([]), {
    total: 0,
    active: 0,
    admins: 0,
    seaportStaff: 0,
    dryportStaff: 0,
    customers: 0,
  })

  assert.deepEqual(buildUserDirectoryStats(users), {
    total: 3,
    active: 2,
    admins: 1,
    seaportStaff: 1,
    dryportStaff: 0,
    customers: 1,
  })
})

test("filters users by search, role, and status without mock-only states", () => {
  assert.equal(
    filterUserDirectoryItems(users, {
      searchTerm: "abc",
      role: "all",
      status: "all",
    }).length,
    1,
  )

  assert.equal(
    filterUserDirectoryItems(users, {
      searchTerm: "",
      role: "seaport_staff",
      status: "active",
    }).length,
    1,
  )

  assert.equal(
    filterUserDirectoryItems(users, {
      searchTerm: "",
      role: "all",
      status: "inactive",
    })[0]?.id,
    "u3",
  )
})
