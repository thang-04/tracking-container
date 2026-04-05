import { getOptionalPrismaClient } from "@/lib/prisma"

export type YardSlotInfo = {
  id: string
  code: string
}

export type YardBlockInfo = {
  id: string
  code: string
  name: string
  slots: YardSlotInfo[]
}

export type YardInfo = {
  id: string
  name: string
  code: string
  blocks: YardBlockInfo[]
}

export async function getYards(): Promise<YardInfo[]> {
  const prisma = getOptionalPrismaClient()
  if (!prisma) return []

  const yards = await prisma.yard.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      blocks: {
        where: { isActive: true },
        include: {
          slots: {
            where: { isActive: true },
            orderBy: { code: "asc" },
          },
        },
        orderBy: { name: "asc" },
      },
    }
  })

  return yards.map(yard => ({
    id: yard.id,
    name: yard.name,
    code: yard.code,
    blocks: yard.blocks.map(block => ({
      id: block.id,
      code: block.code,
      name: block.name,
      slots: block.slots.map(slot => ({
        id: slot.id,
        code: slot.code
      }))
    }))
  }))
}
