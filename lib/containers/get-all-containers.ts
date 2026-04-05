import { getOptionalPrismaClient } from "@/lib/prisma"

export type ContainerListItem = {
  id: string
  containerId: string
  type: string
  status: string
  location: string
  destination: string
  eta: string
  weight: string
}

export async function getAllContainers(): Promise<ContainerListItem[]> {
  const prisma = getOptionalPrismaClient()
  if (!prisma) return []

  const containers = await prisma.container.findMany({
    include: {
      containerType: true,
      currentPort: true,
      currentYard: true,
      currentBlock: true,
      currentSlot: true,
      route: {
        include: {
          destinationPort: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return containers.map((c) => {
    // Determine location string
    let locationParts: string[] = []
    
    if (c.currentYard) locationParts.push(c.currentYard.name)
    if (c.currentBlock) locationParts.push(c.currentBlock.name || c.currentBlock.code)
    if (c.currentSlot) locationParts.push(c.currentSlot.code)

    let location = locationParts.length > 0 ? locationParts.join(" > ") : "Chưa rõ"

    if (location === "Chưa rõ") {
      if (c.currentPort) {
        location = c.currentPort.name
      } else if (c.currentStatus === 'in_transit' || c.currentStatus === 'on_barge') {
        location = "Đang vận chuyển"
      }
    }

    // Determine ETA string
    let etaStr = "Chưa có"
    if (c.eta) {
      const etaDate = new Date(c.eta)
      etaStr = `${etaDate.getFullYear()}-${String(etaDate.getMonth() + 1).padStart(2, '0')}-${String(etaDate.getDate()).padStart(2, '0')} ${String(etaDate.getHours()).padStart(2, '0')}:${String(etaDate.getMinutes()).padStart(2, '0')}`
    }

    // Determine weight string
    let weightStr = "-"
    if (c.grossWeightKg) {
      weightStr = `${c.grossWeightKg.toString()} kg`
    }

    return {
      id: c.id,
      containerId: c.containerNo,
      type: c.containerType?.name || "Unknown",
      status: c.currentStatus,
      location,
      destination: c.route?.destinationPort?.name || "Chưa xác định",
      eta: etaStr,
      weight: weightStr,
    }
  })
}
