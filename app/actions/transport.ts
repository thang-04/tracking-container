"use server"

import { revalidatePath } from "next/cache"
import { requireInternalAccess } from "@/lib/auth/server"
import { getOptionalPrismaClient } from "@/lib/prisma"

export type CreateVehicleActionState = {
  status: "idle" | "success" | "error"
  message?: string
}

export const initialCreateVehicleActionState: CreateVehicleActionState = {
  status: "idle",
}

export async function createVehicleAction(
  _previousState: CreateVehicleActionState,
  formData: FormData,
): Promise<CreateVehicleActionState> {
  await requireInternalAccess()

  const prisma = getOptionalPrismaClient()
  if (!prisma) {
    return { status: "error", message: "Hệ thống chưa kết nối cơ sở dữ liệu." }
  }

  const code = formData.get("code")?.toString().trim() ?? ""
  const name = formData.get("name")?.toString().trim() ?? ""
  const registrationNo = formData.get("registrationNo")?.toString().trim() || null
  const capacityTeu = formData.get("capacityTeu")?.toString().trim()
  const capacityWeightKg = formData.get("capacityWeightKg")?.toString().trim()
  const note = formData.get("note")?.toString().trim() || null

  // ── Validation ──
  const errors: string[] = []
  if (!code) errors.push("Mã sà lan không được để trống.")
  if (!name) errors.push("Tên sà lan không được để trống.")

  if (errors.length > 0) {
    return { status: "error", message: errors.join(" ") }
  }

  // Check unique code
  const existing = await prisma.vehicle.findUnique({ where: { code } })
  if (existing) {
    return { status: "error", message: `Mã "${code}" đã tồn tại trong hệ thống.` }
  }

  // Check unique registration number
  if (registrationNo) {
    const existingReg = await prisma.vehicle.findUnique({
      where: { registrationNo },
    })
    if (existingReg) {
      return {
        status: "error",
        message: `Số đăng ký "${registrationNo}" đã tồn tại trong hệ thống.`,
      }
    }
  }

  try {
    await prisma.vehicle.create({
      data: {
        code,
        name,
        vehicleType: "barge",
        registrationNo,
        capacityTeu: capacityTeu ? parseInt(capacityTeu, 10) || null : null,
        capacityWeightKg: capacityWeightKg ? parseFloat(capacityWeightKg) || null : null,
        status: "available",
        note,
      },
    })

    revalidatePath("/transport")
    return { status: "success", message: `Sà lan "${name}" đã được tạo thành công.` }
  } catch (error) {
    console.error("[createVehicleAction] Error:", error)
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Lỗi không xác định khi tạo sà lan.",
    }
  }
}
