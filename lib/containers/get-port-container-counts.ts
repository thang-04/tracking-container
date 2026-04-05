import { ContainerStatus } from "@/lib/generated/prisma/enums"
import { getOptionalPrismaClient } from "@/lib/prisma"

type PortContainerCount = {
  portId: string
  count: number
}

export async function getPortContainerCounts(): Promise<PortContainerCount[]> {
  const prisma = getOptionalPrismaClient()

  if (!prisma) {
    return []
  }

  const counts = await prisma.container.groupBy({
    by: ["currentPortId"],
    where: {
      currentPortId: { not: null },
      currentStatus: {
        notIn: [ContainerStatus.released],
      },
    },
    _count: {
      _all: true,
    },
  })

  return counts
    .filter((item): item is typeof item & { currentPortId: string } => item.currentPortId !== null)
    .map((item) => ({
      portId: item.currentPortId,
      count: item._count._all,
    }))
}
