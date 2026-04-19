import { getOptionalPrismaClient } from "@/lib/prisma"
import {
  getContainerStatusMeta,
  type ContainerDirectoryItem,
  type ContainerDirectoryStatus,
} from "@/lib/containers/container-view-model"

function formatDateTime(date: Date | null) {
  if (!date) {
    return "Chưa có ETA"
  }

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function formatWeightKg(weight: number | null) {
  if (weight === null) {
    return "Chưa có"
  }

  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(weight)} kg`
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function extractInboundActualVisit(rawData: unknown) {
  if (!rawData || typeof rawData !== "object" || Array.isArray(rawData)) {
    return null
  }

  const record = rawData as Record<string, unknown>
  const directValue =
    normalizeOptionalText(record["I/B Actual Visit"]) ??
    normalizeOptionalText(record.ibActualVisit) ??
    normalizeOptionalText(record.ib_actual_visit)

  if (directValue) {
    return directValue
  }

  const hasDischargeMarkers =
    normalizeOptionalText(record["Unit Nbr"]) !== null ||
    normalizeOptionalText(record["Type ISO"]) !== null ||
    normalizeOptionalText(record.POD) !== null ||
    normalizeOptionalText(record.obActualVisit) !== null

  if (!hasDischargeMarkers) {
    return null
  }

  return normalizeOptionalText(record.billNo) ?? normalizeOptionalText(record.bill_no)
}

function getLocationLabel(input: {
  portName: string | null
  yardName: string | null
  blockCode: string | null
  slotCode: string | null
  voyageCode: string | null
}) {
  if (input.yardName && input.blockCode && input.slotCode) {
    return `${input.yardName} / ${input.blockCode} / ${input.slotCode}`
  }

  if (input.yardName) {
    return input.yardName
  }

  if (input.voyageCode) {
    return `Chuyến ${input.voyageCode}`
  }

  if (input.portName) {
    return input.portName
  }

  return "Chưa cập nhật"
}

export async function getContainerDirectory(): Promise<ContainerDirectoryItem[]> {
  const prisma = getOptionalPrismaClient()

  if (!prisma) {
    return []
  }

  const containers = await prisma.container.findMany({
    orderBy: [{ lastEventAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      containerNo: true,
      currentStatus: true,
      eta: true,
      grossWeightKg: true,
      category: true,
      vState: true,
      tState: true,
      customsStatus: true,
      billNo: true,
      sealNo: true,
      ediBatchRows: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          rawData: true,
        },
      },
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
          name: true,
        },
      },
      currentYard: {
        select: {
          name: true,
        },
      },
      currentBlock: {
        select: {
          code: true,
        },
      },
      currentSlot: {
        select: {
          code: true,
        },
      },
      currentVoyage: {
        select: {
          code: true,
          vehicle: {
            select: { name: true }
          }
        },
      },
    },
  })

  return containers.map((container) => {
    const status = container.currentStatus as ContainerDirectoryStatus
    const inboundActualVisit = extractInboundActualVisit(container.ediBatchRows[0]?.rawData)
    const displayVoyageCode = container.currentVoyage?.code ?? inboundActualVisit ?? null
    const vesselName =
      normalizeOptionalText(container.currentVoyage?.vehicle?.name) ??
      normalizeOptionalText(container.shippingLine?.name)
    const getCustomsStatusLabel = (sts: string) => {
      switch (sts) {
        case "pending": return "Chờ xử lý"
        case "cleared": return "Đã thông quan"
        case "hold": return "Đang bị giữ"
        default: return sts
      }
    }

    return {
      id: container.id,
      containerNo: container.containerNo,
      typeLabel: container.containerType?.code || container.containerType?.name || "N/A",
      status,
      statusLabel: getContainerStatusMeta(status).label,
      locationLabel: getLocationLabel({
        portName: container.currentPort?.name ?? null,
        yardName: container.currentYard?.name ?? null,
        blockCode: container.currentBlock?.code ?? null,
        slotCode: container.currentSlot?.code ?? null,
        voyageCode: displayVoyageCode,
      }),
      destinationLabel:
        container.route?.destinationPort.name ??
        container.customer?.name ??
        "Chưa có đích đến",
      etaLabel: formatDateTime(container.eta),
      weightLabel: formatWeightKg(
        container.grossWeightKg === null ? null : Number(container.grossWeightKg),
      ),
      shippingLineLabel: container.shippingLine?.name ?? null,
      customerLabel: container.customer?.name ?? null,
      routeLabel: container.route?.name ?? null,
      categoryLabel: container.category ?? null,
      vStateLabel: container.vState === "Active" ? "Hoạt động" : (container.vState === "Inactive" ? "Ngừng HĐ" : container.vState),
      tStateLabel: container.tState === "Loaded" ? "Có hàng" : (container.tState === "Empty" ? "Rỗng" : container.tState),
      customsStatusLabel: getCustomsStatusLabel(container.customsStatus),
      billNo: container.billNo ?? null,
      sealNo: container.sealNo ?? null,
      ibActualVisit: inboundActualVisit,
      voyageCode: displayVoyageCode,
      vesselName,
    }
  })
}
