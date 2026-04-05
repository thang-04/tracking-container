import { getOptionalPrismaClient } from "@/lib/prisma"

export type ShippingLineRecord = {
  id: string
  code: string
  name: string
}

export async function getShippingLines(): Promise<ShippingLineRecord[]> {
  const prisma = getOptionalPrismaClient()
  if (!prisma) return []

  const lines = await prisma.shippingLine.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, code: true, name: true }
  })

  return lines
}
