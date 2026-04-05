import { getOptionalPrismaClient } from "@/lib/prisma"
import {
  getContainerStatusMeta,
  type ContainerDirectoryStatus,
} from "@/lib/containers/container-view-model"
import {
  getVehicleStatusMeta,
  getVoyageStatusMeta,
  type TransportPendingContainerItem,
  type TransportVehicleItem,
  type TransportVehicleStatus,
  type TransportVoyageItem,
  type TransportVoyageStatus,
} from "@/lib/transport/transport-view-model"

function formatDateTime(date: Date | null) {
  if (!date) {
    return "Chưa cập nhật"
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

function formatCapacity(teu: number | null, weightKg: number | null) {
  const parts = [
    teu === null ? null : `${teu.toLocaleString("vi-VN")} TEU`,
    weightKg === null
      ? null
      : `${new Intl.NumberFormat("vi-VN", {
          maximumFractionDigits: 0,
        }).format(weightKg)} kg`,
  ].filter(Boolean)

  return parts.join(" / ") || "Chưa khai báo"
}

function formatVehicleLocation(input: { lat: number | null; lng: number | null }) {
  if (input.lat === null || input.lng === null) {
    return "Chưa cập nhật vị trí"
  }

  return `${input.lat.toFixed(4)}, ${input.lng.toFixed(4)}`
}

export async function getTransportOverview(): Promise<{
  vehicles: TransportVehicleItem[]
  voyages: TransportVoyageItem[]
  pendingContainers: TransportPendingContainerItem[]
}> {
  const prisma = getOptionalPrismaClient()

  if (!prisma) {
    return {
      vehicles: [],
      voyages: [],
      pendingContainers: [],
    }
  }

  const [vehicles, voyages, pendingContainers] = await Promise.all([
    prisma.vehicle.findMany({
      orderBy: [{ name: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        status: true,
        capacityTeu: true,
        capacityWeightKg: true,
        currentLat: true,
        currentLng: true,
        updatedAt: true,
      },
    }),
    prisma.voyage.findMany({
      where: {
        status: {
          in: ["draft", "planned", "loading", "departed", "arrived"],
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: 12,
      select: {
        id: true,
        code: true,
        status: true,
        eta: true,
        etd: true,
        currentCheckpoint: {
          select: {
            name: true,
          },
        },
        route: {
          select: {
            originPort: {
              select: {
                name: true,
              },
            },
            destinationPort: {
              select: {
                name: true,
              },
            },
          },
        },
        vehicle: {
          select: {
            code: true,
          },
        },
        voyageContainers: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.container.findMany({
      where: {
        currentVoyageId: null,
        currentStatus: {
          in: ["new", "at_seaport_yard"],
        },
      },
      orderBy: [{ eta: "asc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        containerNo: true,
        currentStatus: true,
        grossWeightKg: true,
        currentPort: {
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
    }),
  ])

  return {
    vehicles: vehicles.map((vehicle) => {
      const status = vehicle.status as TransportVehicleStatus

      return {
        id: vehicle.id,
        code: vehicle.code,
        name: vehicle.name,
        status,
        statusLabel: getVehicleStatusMeta(status).label,
        capacityLabel: formatCapacity(
          vehicle.capacityTeu,
          vehicle.capacityWeightKg === null ? null : Number(vehicle.capacityWeightKg),
        ),
        locationLabel: formatVehicleLocation({
          lat: vehicle.currentLat === null ? null : Number(vehicle.currentLat),
          lng: vehicle.currentLng === null ? null : Number(vehicle.currentLng),
        }),
        updatedAtLabel: formatDateTime(vehicle.updatedAt),
      }
    }),
    voyages: voyages.map((voyage) => {
      const status = voyage.status as TransportVoyageStatus

      return {
        id: voyage.id,
        code: voyage.code,
        status,
        statusLabel: getVoyageStatusMeta(status).label,
        routeLabel: `${voyage.route.originPort.name} -> ${voyage.route.destinationPort.name}`,
        vehicleLabel: voyage.vehicle.code,
        etaLabel: formatDateTime(voyage.eta),
        etdLabel: formatDateTime(voyage.etd),
        checkpointLabel: voyage.currentCheckpoint?.name ?? null,
        manifestCount: voyage.voyageContainers.length,
      }
    }),
    pendingContainers: pendingContainers.map((container) => ({
      id: container.id,
      containerNo: container.containerNo,
      originLabel: container.currentPort?.name ?? "Chưa có cảng đi",
      destinationLabel:
        container.route?.destinationPort.name ?? "Chưa có cảng đến",
      weightLabel: formatWeightKg(
        container.grossWeightKg === null ? null : Number(container.grossWeightKg),
      ),
      statusLabel: getContainerStatusMeta(
        container.currentStatus as ContainerDirectoryStatus,
      ).label,
    })),
  }
}
