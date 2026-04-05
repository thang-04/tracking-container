import { getOptionalPrismaClient } from "@/lib/prisma"
import type { UserDirectoryItem, UserDirectoryRole } from "@/lib/users/user-view-model"

function formatDateTime(date: Date | null) {
  if (!date) {
    return "Chưa đăng nhập"
  }

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function getScopeLabel(input: {
  role: UserDirectoryRole
  portName: string | null
  customerName: string | null
}) {
  if (input.role === "admin") {
    return "Toàn hệ thống"
  }

  if (input.role === "customer") {
    return input.customerName ?? "Chưa gán khách hàng"
  }

  return input.portName ?? "Chưa gán cảng"
}

export async function getUserDirectory(): Promise<UserDirectoryItem[]> {
  const prisma = getOptionalPrismaClient()

  if (!prisma) {
    return []
  }

  const profiles = await prisma.profile.findMany({
    orderBy: [{ fullName: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      port: {
        select: {
          name: true,
        },
      },
      customer: {
        select: {
          name: true,
        },
      },
    },
  })

  return profiles.map((profile) => ({
    id: profile.id,
    fullName: profile.fullName,
    email: profile.email,
    phone: profile.phone,
    role: profile.role as UserDirectoryRole,
    isActive: profile.isActive,
    scopeLabel: getScopeLabel({
      role: profile.role as UserDirectoryRole,
      portName: profile.port?.name ?? null,
      customerName: profile.customer?.name ?? null,
    }),
    lastLoginAtLabel: formatDateTime(profile.lastLoginAt),
  }))
}
