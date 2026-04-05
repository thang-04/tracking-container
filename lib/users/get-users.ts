import { getOptionalPrismaClient } from "@/lib/prisma"

export type UserData = {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "operator" | "transporter" | "customer"
  status: "active" | "inactive" | "pending"
  department: string
  lastActive: string
  avatar?: string
}

export async function getUsers(): Promise<UserData[]> {
  const prisma = getOptionalPrismaClient()
  if (!prisma) return []

  const profiles = await prisma.profile.findMany({
    include: {
      port: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return profiles.map(p => {
    let role: UserData["role"] = "operator"
    if (p.role === "admin") role = "admin"
    else if (p.role === "customer") role = "customer"
    else if (p.role === "seaport_staff" || p.role === "dryport_staff") role = "operator"

    return {
      id: p.id,
      name: p.fullName || "Chưa cập nhật",
      email: p.email,
      phone: p.phone || "Chưa cập nhật",
      role,
      status: p.isActive ? "active" : "inactive",
      department: p.port ? p.port.name : (p.jobTitle || "Chưa cập nhật"),
      lastActive: p.lastLoginAt ? new Date(p.lastLoginAt).toLocaleString("vi-VN") : "Chưa đăng nhập",
    }
  })
}
