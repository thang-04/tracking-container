import { AlertSeverity, ContainerEventType, ContainerStatus, VehicleStatus, VoyageStatus } from "@/lib/generated/prisma/enums"
import { getOptionalPrismaClient } from "@/lib/prisma"

const ACTIVE_CONTAINER_STATUSES: ContainerStatus[] = [
  ContainerStatus.on_barge,
  ContainerStatus.in_transit,
]

const ACTIVE_VOYAGE_STATUSES: VoyageStatus[] = [
  VoyageStatus.planned,
  VoyageStatus.loading,
  VoyageStatus.departed,
]

const TARGET_ROUTE_EFFICIENCY = 85
const DASHBOARD_WINDOW_DAYS = 7
const RECENT_ACTIVITY_LIMIT = 5

export type DashboardKpi = {
  title: string
  value: string
  change: string
  changeType: "positive" | "negative" | "neutral"
}

export type DashboardOperationsPoint = {
  date: string
  containers: number
  shipments: number
}

export type DashboardRouteEfficiencyPoint = {
  route: string
  efficiency: number
  target: number
}

export type DashboardActivityItem = {
  id: string
  type: "container" | "truck" | "alert"
  message: string
  time: string
  status: "success" | "warning" | "info"
  sortAt: string
}

export type DashboardOverview = {
  kpis: {
    totalContainers: DashboardKpi
    activeShipments: DashboardKpi
    availableVehicles: DashboardKpi
    efficiency: DashboardKpi
  }
  operations: DashboardOperationsPoint[]
  routeEfficiency: DashboardRouteEfficiencyPoint[]
  recentActivities: DashboardActivityItem[]
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatDayLabel(date: Date) {
  const day = `${date.getDate()}`.padStart(2, "0")
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  return `${day}/${month}`
}

function toDayKey(date: Date) {
  return startOfLocalDay(date).toISOString()
}

function formatRelativeTime(date: Date, now: Date) {
  const diffMs = Math.max(0, now.getTime() - date.getTime())
  const minutes = Math.floor(diffMs / 60000)

  if (minutes < 1) {
    return "Vừa xong"
  }

  if (minutes < 60) {
    return `${minutes} phút trước`
  }

  const hours = Math.floor(minutes / 60)

  if (hours < 24) {
    return `${hours} giờ trước`
  }

  const days = Math.floor(hours / 24)
  return `${days} ngày trước`
}

function createEmptyOverview(): DashboardOverview {
  const today = startOfLocalDay(new Date())

  return {
    kpis: {
      totalContainers: {
        title: "Tổng container",
        value: "0",
        change: "Chưa có dữ liệu container",
        changeType: "neutral",
      },
      activeShipments: {
        title: "Lô hàng đang vận chuyển",
        value: "0",
        change: "Chưa có chuyến đang hoạt động",
        changeType: "neutral",
      },
      availableVehicles: {
        title: "Xe sẵn sàng",
        value: "0",
        change: "Chưa có phương tiện khả dụng",
        changeType: "neutral",
      },
      efficiency: {
        title: "Tỷ lệ hiệu quả",
        value: "0%",
        change: "Chưa đủ dữ liệu chuyến hoàn thành",
        changeType: "neutral",
      },
    },
    operations: Array.from({ length: DASHBOARD_WINDOW_DAYS }, (_, index) => {
      const day = addDays(today, index - (DASHBOARD_WINDOW_DAYS - 1))

      return {
        date: formatDayLabel(day),
        containers: 0,
        shipments: 0,
      }
    }),
    routeEfficiency: [],
    recentActivities: [],
  }
}

function buildOperationsSeries(params: {
  containerEvents: Array<{ eventTime: Date; containerId: string }>
  shipments: Array<{ id: string; atd: Date | null; createdAt: Date }>
}) {
  const today = startOfLocalDay(new Date())
  const start = addDays(today, -(DASHBOARD_WINDOW_DAYS - 1))
  const buckets = new Map<string, { date: string; containers: Set<string>; shipments: Set<string> }>()

  for (let index = 0; index < DASHBOARD_WINDOW_DAYS; index += 1) {
    const day = addDays(start, index)
    buckets.set(toDayKey(day), {
      date: formatDayLabel(day),
      containers: new Set<string>(),
      shipments: new Set<string>(),
    })
  }

  for (const event of params.containerEvents) {
    const bucket = buckets.get(toDayKey(event.eventTime))

    if (bucket) {
      bucket.containers.add(event.containerId)
    }
  }

  for (const shipment of params.shipments) {
    const referenceDate = shipment.atd ?? shipment.createdAt
    const bucket = buckets.get(toDayKey(referenceDate))

    if (bucket) {
      bucket.shipments.add(shipment.id)
    }
  }

  return [...buckets.values()].map((bucket) => ({
    date: bucket.date,
    containers: bucket.containers.size,
    shipments: bucket.shipments.size,
  }))
}

function buildRouteEfficiencySeries(
  voyages: Array<{
    route: { code: string; name: string }
    eta: Date | null
    ata: Date | null
  }>
) {
  const perRoute = new Map<string, { route: string; total: number; onTime: number }>()

  for (const voyage of voyages) {
    if (!voyage.eta || !voyage.ata) {
      continue
    }

    const current =
      perRoute.get(voyage.route.code) ?? {
        route: voyage.route.name,
        total: 0,
        onTime: 0,
      }

    current.total += 1

    if (voyage.ata.getTime() <= voyage.eta.getTime()) {
      current.onTime += 1
    }

    perRoute.set(voyage.route.code, current)
  }

  return [...perRoute.values()]
    .map((route) => ({
      route: route.route,
      efficiency: route.total === 0 ? 0 : Math.round((route.onTime / route.total) * 100),
      target: TARGET_ROUTE_EFFICIENCY,
      total: route.total,
    }))
    .sort((left, right) => right.efficiency - left.efficiency || right.total - left.total)
    .slice(0, 5)
    .map(({ route, efficiency, target }) => ({
      route,
      efficiency,
      target,
    }))
}

function buildContainerActivityMessage(event: {
  eventType: ContainerEventType
  container: { containerNo: string }
  voyage: { code: string } | null
  description: string | null
}) {
  if (event.description) {
    return event.description
  }

  const containerNo = event.container.containerNo
  const voyageCode = event.voyage?.code

  switch (event.eventType) {
    case ContainerEventType.created:
      return `Container ${containerNo} được tạo mới`
    case ContainerEventType.edi_imported:
      return `Container ${containerNo} được import từ EDI`
    case ContainerEventType.yard_in:
      return `Container ${containerNo} vào bãi`
    case ContainerEventType.yard_move:
      return `Container ${containerNo} chuyển vị trí trong bãi`
    case ContainerEventType.yard_out:
      return `Container ${containerNo} rời bãi`
    case ContainerEventType.voyage_assigned:
      return `Container ${containerNo} được gán vào chuyến ${voyageCode ?? "đang xử lý"}`
    case ContainerEventType.voyage_departed:
      return `Container ${containerNo} khởi hành cùng chuyến ${voyageCode ?? "đang xử lý"}`
    case ContainerEventType.voyage_arrived:
      return `Container ${containerNo} đã đến đích`
    case ContainerEventType.checkpoint_updated:
      return `Container ${containerNo} được cập nhật checkpoint`
    case ContainerEventType.customs_changed:
      return `Container ${containerNo} cập nhật trạng thái hải quan`
    case ContainerEventType.released:
      return `Container ${containerNo} đã được giải phóng`
    case ContainerEventType.alert_created:
      return `Container ${containerNo} phát sinh cảnh báo`
    default:
      return `Container ${containerNo} có cập nhật mới`
  }
}

function buildRecentActivities(params: {
  containerEvents: Array<{
    id: string
    eventType: ContainerEventType
    eventTime: Date
    description: string | null
    container: { containerNo: string }
    voyage: { code: string } | null
  }>
  alerts: Array<{
    id: string
    title: string
    triggeredAt: Date
    severity: AlertSeverity
  }>
}) {
  const now = new Date()
  const activities: DashboardActivityItem[] = [
    ...params.containerEvents.map<DashboardActivityItem>((event) => ({
      id: `event-${event.id}`,
      type: event.eventType === ContainerEventType.alert_created ? "alert" : "container",
      message: buildContainerActivityMessage(event),
      time: formatRelativeTime(event.eventTime, now),
      status:
        event.eventType === ContainerEventType.alert_created
          ? "warning"
          : event.eventType === ContainerEventType.released || event.eventType === ContainerEventType.voyage_arrived
            ? "success"
            : "info",
      sortAt: event.eventTime.toISOString(),
    })),
    ...params.alerts.map<DashboardActivityItem>((alert) => ({
      id: `alert-${alert.id}`,
      type: "alert" as const,
      message: alert.title,
      time: formatRelativeTime(alert.triggeredAt, now),
      status: alert.severity === AlertSeverity.critical ? "warning" : "info",
      sortAt: alert.triggeredAt.toISOString(),
    })),
  ]

  return activities
    .sort((left, right) => right.sortAt.localeCompare(left.sortAt))
    .slice(0, RECENT_ACTIVITY_LIMIT)
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const prisma = getOptionalPrismaClient()

  if (!prisma) {
    return createEmptyOverview()
  }

  const today = startOfLocalDay(new Date())
  const windowStart = addDays(today, -(DASHBOARD_WINDOW_DAYS - 1))

  const [
    totalContainers,
    activeShipments,
    availableVehicles,
    maintenanceVehicles,
    activeVoyages,
    completedVoyages,
    containerEvents,
    shipments,
    routeVoyages,
    recentContainerEvents,
    recentAlerts,
  ] = await Promise.all([
    prisma.container.count(),
    prisma.container.count({
      where: {
        currentStatus: {
          in: ACTIVE_CONTAINER_STATUSES,
        },
      },
    }),
    prisma.vehicle.count({
      where: {
        status: VehicleStatus.available,
      },
    }),
    prisma.vehicle.count({
      where: {
        status: VehicleStatus.maintenance,
      },
    }),
    prisma.voyage.count({
      where: {
        status: {
          in: ACTIVE_VOYAGE_STATUSES,
        },
      },
    }),
    prisma.voyage.findMany({
      where: {
        status: VoyageStatus.arrived,
        eta: { not: null },
        ata: { not: null },
      },
      select: {
        eta: true,
        ata: true,
      },
    }),
    prisma.containerEvent.findMany({
      where: {
        eventTime: { gte: windowStart },
      },
      select: {
        eventTime: true,
        containerId: true,
      },
    }),
    prisma.voyage.findMany({
      where: {
        OR: [
          { createdAt: { gte: windowStart } },
          { atd: { gte: windowStart } },
        ],
      },
      select: {
        id: true,
        createdAt: true,
        atd: true,
      },
    }),
    prisma.voyage.findMany({
      where: {
        status: VoyageStatus.arrived,
        eta: { not: null },
        ata: { not: null },
      },
      select: {
        eta: true,
        ata: true,
        route: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    }),
    prisma.containerEvent.findMany({
      orderBy: { eventTime: "desc" },
      take: 10,
      select: {
        id: true,
        eventType: true,
        eventTime: true,
        description: true,
        container: {
          select: {
            containerNo: true,
          },
        },
        voyage: {
          select: {
            code: true,
          },
        },
      },
    }),
    prisma.alert.findMany({
      orderBy: { triggeredAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        triggeredAt: true,
        severity: true,
      },
    }),
  ])

  const completedVoyageCount = completedVoyages.length
  const onTimeVoyageCount = completedVoyages.filter(
    (voyage) => voyage.ata && voyage.eta && voyage.ata.getTime() <= voyage.eta.getTime()
  ).length
  const efficiencyValue =
    completedVoyageCount === 0 ? 0 : Math.round((onTimeVoyageCount / completedVoyageCount) * 1000) / 10

  return {
    kpis: {
      totalContainers: {
        title: "Tổng container",
        value: totalContainers.toLocaleString("vi-VN"),
        change: `${activeShipments.toLocaleString("vi-VN")} đang vận chuyển`,
        changeType: activeShipments > 0 ? "positive" : "neutral",
      },
      activeShipments: {
        title: "Lô hàng đang vận chuyển",
        value: activeShipments.toLocaleString("vi-VN"),
        change: `${activeVoyages.toLocaleString("vi-VN")} chuyến đang hoạt động`,
        changeType: activeVoyages > 0 ? "positive" : "neutral",
      },
      availableVehicles: {
        title: "Xe sẵn sàng",
        value: availableVehicles.toLocaleString("vi-VN"),
        change:
          maintenanceVehicles > 0
            ? `${maintenanceVehicles.toLocaleString("vi-VN")} đang bảo dưỡng`
            : "Không có xe bảo dưỡng",
        changeType: maintenanceVehicles > 0 ? "neutral" : "positive",
      },
      efficiency: {
        title: "Tỷ lệ hiệu quả",
        value: `${efficiencyValue.toLocaleString("vi-VN")}%`,
        change:
          completedVoyageCount > 0
            ? `${completedVoyageCount.toLocaleString("vi-VN")} chuyến đã hoàn thành`
            : "Chưa có chuyến hoàn thành",
        changeType:
          completedVoyageCount > 0 && efficiencyValue >= TARGET_ROUTE_EFFICIENCY ? "positive" : "neutral",
      },
    },
    operations: buildOperationsSeries({ containerEvents, shipments }),
    routeEfficiency: buildRouteEfficiencySeries(routeVoyages),
    recentActivities: buildRecentActivities({
      containerEvents: recentContainerEvents,
      alerts: recentAlerts,
    }),
  }
}
