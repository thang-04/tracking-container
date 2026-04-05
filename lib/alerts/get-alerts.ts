import { getOptionalPrismaClient } from "@/lib/prisma"

export type AlertData = {
  id: string
  type: string
  severity: "critical" | "warning" | "info"
  title: string
  description: string
  location?: string
  vehicle?: string
  container?: string
  timestamp: string
  status: "active" | "acknowledged" | "resolved"
}

export async function getAlerts(): Promise<AlertData[]> {
  const prisma = getOptionalPrismaClient()
  if (!prisma) return []

  const alerts = await prisma.alert.findMany({
    include: {
      container: true,
      vehicle: true,
      voyage: {
        include: { vehicle: true }
      }
    },
    orderBy: { triggeredAt: 'desc' }
  })

  return alerts.map(a => {
    let uiStatus: AlertData["status"] = "active"
    if (a.status === "acknowledged") uiStatus = "acknowledged"
    else if (a.status === "resolved") uiStatus = "resolved"

    let uiSeverity: AlertData["severity"] = "info"
    if (a.severity === "warning") uiSeverity = "warning"
    else if (a.severity === "critical") uiSeverity = "critical"

    let uiType = "delay"
    if (a.alertType === "route_deviation") uiType = "deviation"
    else if (a.alertType === "maintenance") uiType = "maintenance"
    else if (a.alertType === "weather") uiType = "weather"
    else if (a.alertType === "congestion") uiType = "congestion"

    return {
      id: a.id,
      type: uiType,
      severity: uiSeverity,
      title: a.title,
      description: a.message,
      vehicle: a.vehicle ? a.vehicle.code : (a.voyage?.vehicle?.code || undefined),
      container: a.container ? a.container.containerNo : undefined,
      timestamp: new Date(a.triggeredAt).toLocaleString("vi-VN"), // Simple date format
      status: uiStatus,
    }
  })
}
