import { getOptionalPrismaClient } from "@/lib/prisma"
import type {
  AlertDirectoryItem,
  AlertDirectorySeverity,
  AlertDirectoryStatus,
  AlertDirectoryType,
} from "@/lib/alerts/alert-view-model"

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function getLocationLabel(input: {
  voyageRouteName: string | null
  containerPortName: string | null
}) {
  return input.voyageRouteName ?? input.containerPortName ?? null
}

export async function getAlertDirectory(): Promise<AlertDirectoryItem[]> {
  const prisma = getOptionalPrismaClient()

  if (!prisma) {
    return []
  }

  const alerts = await prisma.alert.findMany({
    orderBy: [{ triggeredAt: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      alertType: true,
      severity: true,
      status: true,
      title: true,
      message: true,
      triggeredAt: true,
      container: {
        select: {
          containerNo: true,
          currentPort: {
            select: {
              name: true,
            },
          },
        },
      },
      voyage: {
        select: {
          code: true,
          route: {
            select: {
              name: true,
            },
          },
        },
      },
      vehicle: {
        select: {
          code: true,
          name: true,
        },
      },
      ackUser: {
        select: {
          fullName: true,
        },
      },
      resolveUser: {
        select: {
          fullName: true,
        },
      },
    },
  })

  return alerts.map((alert) => ({
    id: alert.id,
    title: alert.title,
    message: alert.message,
    type: alert.alertType as AlertDirectoryType,
    severity: alert.severity as AlertDirectorySeverity,
    status: alert.status as AlertDirectoryStatus,
    triggeredAtLabel: formatDateTime(alert.triggeredAt),
    locationLabel: getLocationLabel({
      voyageRouteName: alert.voyage?.route.name ?? null,
      containerPortName: alert.container?.currentPort?.name ?? null,
    }),
    vehicleLabel: alert.vehicle
      ? `${alert.vehicle.code} · ${alert.vehicle.name}`
      : null,
    containerLabel: alert.container?.containerNo ?? null,
    voyageLabel: alert.voyage?.code ?? null,
    acknowledgedByLabel: alert.ackUser?.fullName ?? null,
    resolvedByLabel: alert.resolveUser?.fullName ?? null,
  }))
}
