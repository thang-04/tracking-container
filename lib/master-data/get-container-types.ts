import { getOptionalPrismaClient } from "@/lib/prisma"

export type ContainerTypeRecord = {
  id: string
  code: string
  name: string
  lengthFt: number | null
}

export async function getContainerTypes(): Promise<ContainerTypeRecord[]> {
  const prisma = getOptionalPrismaClient()
  if (!prisma) return []

  const types = await prisma.containerType.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, code: true, name: true, lengthFt: true }
  })

  return types
}
