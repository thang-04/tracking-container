"use server"

import { revalidatePath } from "next/cache"

import prisma from "@/lib/prisma"
import { getCurrentAuthContext } from "@/lib/auth/server"

function assertInternalUser() {
  return getCurrentAuthContext().then((auth) => {
    if (!auth?.profile || !auth.profile.isActive || auth.profile.role === "customer") {
      throw new Error("Unauthorized")
    }

    return auth
  })
}

export async function acknowledgeAlertAction(alertId: string) {
  const auth = await assertInternalUser()

  await prisma.alert.updateMany({
    where: {
      id: alertId,
      status: "open",
    },
    data: {
      status: "acknowledged",
      acknowledgedBy: auth.userId,
      acknowledgedAt: new Date(),
    },
  })

  revalidatePath("/alerts")
}

export async function resolveAlertAction(alertId: string) {
  const auth = await assertInternalUser()

  await prisma.alert.updateMany({
    where: {
      id: alertId,
      status: {
        in: ["open", "acknowledged"],
      },
    },
    data: {
      status: "resolved",
      resolvedBy: auth.userId,
      resolvedAt: new Date(),
      acknowledgedBy: auth.userId,
      acknowledgedAt: new Date(),
    },
  })

  revalidatePath("/alerts")
}
