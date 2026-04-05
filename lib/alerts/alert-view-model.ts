export type AlertDirectoryType =
  | "delay"
  | "hold"
  | "route_deviation"
  | "congestion"
  | "maintenance"
  | "weather"

export type AlertDirectorySeverity = "info" | "warning" | "critical"
export type AlertDirectoryStatus = "open" | "acknowledged" | "resolved"

export type AlertDirectoryItem = {
  id: string
  title: string
  message: string
  type: AlertDirectoryType
  severity: AlertDirectorySeverity
  status: AlertDirectoryStatus
  triggeredAtLabel: string
  locationLabel: string | null
  vehicleLabel: string | null
  containerLabel: string | null
  voyageLabel: string | null
  acknowledgedByLabel: string | null
  resolvedByLabel: string | null
}

const ALERT_TYPE_META: Record<AlertDirectoryType, { label: string }> = {
  delay: { label: "Trễ hành trình" },
  hold: { label: "Giữ kiểm tra" },
  route_deviation: { label: "Lệch tuyến" },
  congestion: { label: "Ùn tắc" },
  maintenance: { label: "Bảo dưỡng" },
  weather: { label: "Thời tiết" },
}

const ALERT_SEVERITY_META: Record<
  AlertDirectorySeverity,
  { label: string; className: string }
> = {
  critical: {
    label: "Nghiêm trọng",
    className: "bg-destructive text-destructive-foreground",
  },
  warning: {
    label: "Cảnh báo",
    className: "bg-warning text-warning-foreground",
  },
  info: {
    label: "Thông tin",
    className: "bg-primary text-primary-foreground",
  },
}

const ALERT_STATUS_META: Record<
  AlertDirectoryStatus,
  { label: string; className: string }
> = {
  open: {
    label: "Đang mở",
    className: "bg-destructive/10 text-destructive",
  },
  acknowledged: {
    label: "Đã xác nhận",
    className: "bg-warning/10 text-warning",
  },
  resolved: {
    label: "Đã giải quyết",
    className: "bg-success/10 text-success",
  },
}

export function getAlertTypeMeta(type: AlertDirectoryType) {
  return ALERT_TYPE_META[type]
}

export function getAlertSeverityMeta(severity: AlertDirectorySeverity) {
  return ALERT_SEVERITY_META[severity]
}

export function getAlertStatusMeta(status: AlertDirectoryStatus) {
  return ALERT_STATUS_META[status]
}

export function buildAlertSummary(items: AlertDirectoryItem[]) {
  return {
    total: items.length,
    open: items.filter((item) => item.status === "open").length,
    acknowledged: items.filter((item) => item.status === "acknowledged").length,
    resolved: items.filter((item) => item.status === "resolved").length,
    criticalOpen: items.filter(
      (item) => item.status === "open" && item.severity === "critical",
    ).length,
  }
}

export function filterAlertDirectoryItems(
  items: AlertDirectoryItem[],
  filters: {
    searchTerm: string
    severity: AlertDirectorySeverity | "all"
    status: AlertDirectoryStatus | "all"
  },
) {
  const searchTerm = filters.searchTerm.trim().toLowerCase()

  return items.filter((item) => {
    const haystack = [
      item.title,
      item.message,
      item.locationLabel ?? "",
      item.vehicleLabel ?? "",
      item.containerLabel ?? "",
      item.voyageLabel ?? "",
    ]
      .join(" ")
      .toLowerCase()

    const matchesSearch = searchTerm.length === 0 || haystack.includes(searchTerm)
    const matchesSeverity =
      filters.severity === "all" || item.severity === filters.severity
    const matchesStatus = filters.status === "all" || item.status === filters.status

    return matchesSearch && matchesSeverity && matchesStatus
  })
}
