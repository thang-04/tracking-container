export type UserDirectoryRole =
  | "admin"
  | "seaport_staff"
  | "dryport_staff"
  | "customer"

export type UserDirectoryFilterRole = UserDirectoryRole | "all"
export type UserDirectoryFilterStatus = "all" | "active" | "inactive"

export type UserDirectoryItem = {
  id: string
  fullName: string
  email: string
  phone: string | null
  role: UserDirectoryRole
  isActive: boolean
  scopeLabel: string
  lastLoginAtLabel: string
}

type UserRoleMeta = {
  label: string
  className: string
}

type UserStatusMeta = {
  label: string
  className: string
}

const USER_ROLE_META: Record<UserDirectoryRole, UserRoleMeta> = {
  admin: {
    label: "Quản trị viên",
    className: "bg-destructive/10 text-destructive",
  },
  seaport_staff: {
    label: "Nhân viên cảng biển",
    className: "bg-primary/10 text-primary",
  },
  dryport_staff: {
    label: "Nhân viên cảng cạn",
    className: "bg-accent/10 text-accent",
  },
  customer: {
    label: "Khách hàng",
    className: "bg-success/10 text-success",
  },
}

const USER_STATUS_META: Record<"active" | "inactive", UserStatusMeta> = {
  active: {
    label: "Hoạt động",
    className: "bg-success/10 text-success",
  },
  inactive: {
    label: "Không hoạt động",
    className: "bg-muted text-muted-foreground",
  },
}

export function getUserRoleMeta(role: UserDirectoryRole) {
  return USER_ROLE_META[role]
}

export function getUserStatusMeta(isActive: boolean) {
  return USER_STATUS_META[isActive ? "active" : "inactive"]
}

export function buildUserDirectoryStats(items: UserDirectoryItem[]) {
  return {
    total: items.length,
    active: items.filter((item) => item.isActive).length,
    admins: items.filter((item) => item.role === "admin").length,
    seaportStaff: items.filter((item) => item.role === "seaport_staff").length,
    dryportStaff: items.filter((item) => item.role === "dryport_staff").length,
    customers: items.filter((item) => item.role === "customer").length,
  }
}

export function filterUserDirectoryItems(
  items: UserDirectoryItem[],
  filters: {
    searchTerm: string
    role: UserDirectoryFilterRole
    status: UserDirectoryFilterStatus
  },
) {
  const searchTerm = filters.searchTerm.trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch =
      searchTerm.length === 0 ||
      item.fullName.toLowerCase().includes(searchTerm) ||
      item.email.toLowerCase().includes(searchTerm) ||
      item.scopeLabel.toLowerCase().includes(searchTerm)

    const matchesRole = filters.role === "all" || item.role === filters.role
    const matchesStatus =
      filters.status === "all" ||
      (filters.status === "active" ? item.isActive : !item.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })
}
