import { getOptionalPrismaClient } from "@/lib/prisma"
import { getContainerStatusMeta, type ContainerDirectoryStatus } from "@/lib/containers/container-view-model"

const HIGH_OCCUPANCY_THRESHOLD = 80

function formatDateTime(value: Date | null) {
  if (!value) {
    return "Chưa có"
  }

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value)
}

function formatWeightKg(weight: number | null) {
  if (weight === null) {
    return "Chưa có"
  }

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(weight)} kg`
}

function formatCustomsStatus(status: "pending" | "cleared" | "hold") {
  switch (status) {
    case "cleared":
      return "Đã thông quan"
    case "hold":
      return "Đang giữ"
    case "pending":
    default:
      return "Chờ xử lý"
  }
}

function buildLocationLabel(input: {
  portName: string | null
  yardName: string | null
  blockCode: string | null
  slotCode: string | null
}) {
  const parts = [input.portName, input.yardName, input.blockCode, input.slotCode].filter(
    (part): part is string => Boolean(part && part.trim()),
  )

  return parts.length > 0 ? parts.join(" / ") : "Chưa gán vị trí"
}

function toStatus(value: string): ContainerDirectoryStatus {
  return value as ContainerDirectoryStatus
}

export type YardOverview = {
  summary: {
    totalYards: number
    totalBlocks: number
    totalSlots: number
    occupiedSlots: number
    availableSlots: number
    atSeaportYardContainers: number
    atDryportYardContainers: number
    holdContainers: number
    highOccupancyBlocks: number
  }
  yards: Array<{
    id: string
    code: string
    name: string
    portId: string
    portCode: string
    portName: string
    portType: "seaport" | "dryport"
    totalSlots: number
    occupiedSlots: number
    availableSlots: number
    occupancyPercent: number
    blocks: Array<{
      id: string
      code: string
      name: string
      yardId: string
      yardCode: string
      yardName: string
      portCode: string
      portName: string
      portType: "seaport" | "dryport"
      totalSlots: number
      occupiedSlots: number
      availableSlots: number
      occupancyPercent: number
      positionedSlots: number
      unpositionedSlots: number
      rows: number
      bays: number
      tiers: number
      slots: Array<{
        id: string
        code: string
        rowNo: number | null
        bayNo: number | null
        tierNo: number | null
        isOccupied: boolean
        container: null | {
          id: string
          containerNo: string
          status: ContainerDirectoryStatus
          statusLabel: string
          statusClassName: string
          customsStatus: "pending" | "cleared" | "hold"
          customsStatusLabel: string
          typeLabel: string
          shippingLineLabel: string | null
          customerLabel: string | null
          destinationLabel: string
          etaLabel: string
          lastEventLabel: string
        }
      }>
    }>
  }>
  containers: Array<{
    id: string
    containerNo: string
    status: ContainerDirectoryStatus
    statusLabel: string
    statusClassName: string
    customsStatus: "pending" | "cleared" | "hold"
    customsStatusLabel: string
    typeLabel: string
    shippingLineLabel: string | null
    customerLabel: string | null
    routeLabel: string | null
    destinationLabel: string
    etaLabel: string
    weightLabel: string
    yardId: string | null
    yardCode: string | null
    yardName: string | null
    blockId: string | null
    blockCode: string | null
    slotId: string | null
    slotCode: string | null
    portCode: string | null
    portName: string | null
    locationLabel: string
    lastEventLabel: string
  }>
}

export async function getYardOverview(): Promise<YardOverview> {
  const prisma = getOptionalPrismaClient()

  if (!prisma) {
    return {
      summary: {
        totalYards: 0,
        totalBlocks: 0,
        totalSlots: 0,
        occupiedSlots: 0,
        availableSlots: 0,
        atSeaportYardContainers: 0,
        atDryportYardContainers: 0,
        holdContainers: 0,
        highOccupancyBlocks: 0,
      },
      yards: [],
      containers: [],
    }
  }

  const [yards, containers] = await Promise.all([
    prisma.yard.findMany({
      where: { isActive: true, port: { isActive: true } },
      orderBy: [{ port: { code: "asc" } }, { code: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        portId: true,
        port: {
          select: {
            code: true,
            name: true,
            portType: true,
          },
        },
        blocks: {
          where: { isActive: true },
          orderBy: [{ code: "asc" }],
          select: {
            id: true,
            code: true,
            name: true,
            slots: {
              where: { isActive: true },
              orderBy: [
                { rowNo: "asc" },
                { bayNo: "asc" },
                { tierNo: "asc" },
                { code: "asc" },
              ],
              select: {
                id: true,
                code: true,
                rowNo: true,
                bayNo: true,
                tierNo: true,
                containersAsCurrent: {
                  take: 1,
                  select: {
                    id: true,
                    containerNo: true,
                    currentStatus: true,
                    customsStatus: true,
                    eta: true,
                    lastEventAt: true,
                    containerType: {
                      select: {
                        code: true,
                        name: true,
                      },
                    },
                    shippingLine: {
                      select: {
                        name: true,
                      },
                    },
                    customer: {
                      select: {
                        name: true,
                      },
                    },
                    route: {
                      select: {
                        destinationPort: {
                          select: {
                            name: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.container.findMany({
      where: {
        OR: [
          { currentYardId: { not: null } },
          { currentBlockId: { not: null } },
          { currentSlotId: { not: null } },
        ],
      },
      orderBy: [{ lastEventAt: "desc" }, { containerNo: "asc" }],
      select: {
        id: true,
        containerNo: true,
        currentStatus: true,
        customsStatus: true,
        eta: true,
        grossWeightKg: true,
        lastEventAt: true,
        containerType: {
          select: {
            code: true,
            name: true,
          },
        },
        shippingLine: {
          select: {
            name: true,
          },
        },
        customer: {
          select: {
            name: true,
          },
        },
        route: {
          select: {
            name: true,
            destinationPort: {
              select: {
                name: true,
              },
            },
          },
        },
        currentPort: {
          select: {
            code: true,
            name: true,
          },
        },
        currentYard: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        currentBlock: {
          select: {
            id: true,
            code: true,
          },
        },
        currentSlot: {
          select: {
            id: true,
            code: true,
          },
        },
      },
    }),
  ])

  const yardItems = yards.map((yard) => {
    const blockItems = yard.blocks.map((block) => {
      const occupiedSlots = block.slots.filter((slot) => slot.containersAsCurrent.length > 0).length
      const totalSlots = block.slots.length
      const availableSlots = Math.max(0, totalSlots - occupiedSlots)
      const occupancyPercent = totalSlots === 0 ? 0 : Math.round((occupiedSlots / totalSlots) * 100)
      const positionedSlots = block.slots.filter(
        (slot) => slot.rowNo !== null && slot.bayNo !== null,
      ).length

      return {
        id: block.id,
        code: block.code,
        name: block.name,
        yardId: yard.id,
        yardCode: yard.code,
        yardName: yard.name,
        portCode: yard.port.code,
        portName: yard.port.name,
        portType: yard.port.portType as "seaport" | "dryport",
        totalSlots,
        occupiedSlots,
        availableSlots,
        occupancyPercent,
        positionedSlots,
        unpositionedSlots: totalSlots - positionedSlots,
        rows: block.slots.reduce((max, slot) => Math.max(max, slot.rowNo ?? 0), 0),
        bays: block.slots.reduce((max, slot) => Math.max(max, slot.bayNo ?? 0), 0),
        tiers: block.slots.reduce((max, slot) => Math.max(max, slot.tierNo ?? 0), 0),
        slots: block.slots.map((slot) => {
          const currentContainer = slot.containersAsCurrent[0] ?? null

          if (!currentContainer) {
            return {
              id: slot.id,
              code: slot.code,
              rowNo: slot.rowNo,
              bayNo: slot.bayNo,
              tierNo: slot.tierNo,
              isOccupied: false,
              container: null,
            }
          }

          const status = toStatus(currentContainer.currentStatus)
          const statusMeta = getContainerStatusMeta(status)

          return {
            id: slot.id,
            code: slot.code,
            rowNo: slot.rowNo,
            bayNo: slot.bayNo,
            tierNo: slot.tierNo,
            isOccupied: true,
            container: {
              id: currentContainer.id,
              containerNo: currentContainer.containerNo,
              status,
              statusLabel: statusMeta.label,
              statusClassName: statusMeta.className,
              customsStatus: currentContainer.customsStatus,
              customsStatusLabel: formatCustomsStatus(currentContainer.customsStatus),
              typeLabel:
                currentContainer.containerType?.code ??
                currentContainer.containerType?.name ??
                "Chưa có loại",
              shippingLineLabel: currentContainer.shippingLine?.name ?? null,
              customerLabel: currentContainer.customer?.name ?? null,
              destinationLabel:
                currentContainer.route?.destinationPort.name ?? "Chưa có đích đến",
              etaLabel: formatDateTime(currentContainer.eta),
              lastEventLabel: formatDateTime(currentContainer.lastEventAt),
            },
          }
        }),
      }
    })

    const totalSlots = blockItems.reduce((sum, block) => sum + block.totalSlots, 0)
    const occupiedSlots = blockItems.reduce((sum, block) => sum + block.occupiedSlots, 0)

    return {
      id: yard.id,
      code: yard.code,
      name: yard.name,
      portId: yard.portId,
      portCode: yard.port.code,
      portName: yard.port.name,
      portType: yard.port.portType as "seaport" | "dryport",
      totalSlots,
      occupiedSlots,
      availableSlots: Math.max(0, totalSlots - occupiedSlots),
      occupancyPercent: totalSlots === 0 ? 0 : Math.round((occupiedSlots / totalSlots) * 100),
      blocks: blockItems,
    }
  })

  const containerItems = containers.map((container) => {
    const status = toStatus(container.currentStatus)
    const statusMeta = getContainerStatusMeta(status)

    return {
      id: container.id,
      containerNo: container.containerNo,
      status,
      statusLabel: statusMeta.label,
      statusClassName: statusMeta.className,
      customsStatus: container.customsStatus,
      customsStatusLabel: formatCustomsStatus(container.customsStatus),
      typeLabel:
        container.containerType?.code ?? container.containerType?.name ?? "Chưa có loại",
      shippingLineLabel: container.shippingLine?.name ?? null,
      customerLabel: container.customer?.name ?? null,
      routeLabel: container.route?.name ?? null,
      destinationLabel:
        container.route?.destinationPort.name ??
        container.customer?.name ??
        "Chưa có đích đến",
      etaLabel: formatDateTime(container.eta),
      weightLabel: formatWeightKg(
        container.grossWeightKg === null ? null : Number(container.grossWeightKg),
      ),
      yardId: container.currentYard?.id ?? null,
      yardCode: container.currentYard?.code ?? null,
      yardName: container.currentYard?.name ?? null,
      blockId: container.currentBlock?.id ?? null,
      blockCode: container.currentBlock?.code ?? null,
      slotId: container.currentSlot?.id ?? null,
      slotCode: container.currentSlot?.code ?? null,
      portCode: container.currentPort?.code ?? null,
      portName: container.currentPort?.name ?? null,
      locationLabel: buildLocationLabel({
        portName: container.currentPort?.name ?? null,
        yardName: container.currentYard?.name ?? null,
        blockCode: container.currentBlock?.code ?? null,
        slotCode: container.currentSlot?.code ?? null,
      }),
      lastEventLabel: formatDateTime(container.lastEventAt),
    }
  })

  const allBlocks = yardItems.flatMap((yard) => yard.blocks)
  const totalSlots = yardItems.reduce((sum, yard) => sum + yard.totalSlots, 0)
  const occupiedSlots = yardItems.reduce((sum, yard) => sum + yard.occupiedSlots, 0)

  return {
    summary: {
      totalYards: yardItems.length,
      totalBlocks: allBlocks.length,
      totalSlots,
      occupiedSlots,
      availableSlots: Math.max(0, totalSlots - occupiedSlots),
      atSeaportYardContainers: containerItems.filter(
        (item) => item.status === "at_seaport_yard",
      ).length,
      atDryportYardContainers: containerItems.filter(
        (item) => item.status === "at_dryport_yard",
      ).length,
      holdContainers: containerItems.filter((item) => item.status === "hold").length,
      highOccupancyBlocks: allBlocks.filter(
        (block) => block.occupancyPercent >= HIGH_OCCUPANCY_THRESHOLD,
      ).length,
    },
    yards: yardItems,
    containers: containerItems,
  }
}
