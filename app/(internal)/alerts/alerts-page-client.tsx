"use client"

import { useMemo, useState, useTransition } from "react"
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ShieldAlert,
  Ship,
  Waves,
} from "lucide-react"

import { acknowledgeAlertAction, resolveAlertAction } from "@/app/actions/alerts"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  buildAlertSummary,
  filterAlertDirectoryItems,
  getAlertSeverityMeta,
  getAlertStatusMeta,
  getAlertTypeMeta,
  type AlertDirectoryItem,
  type AlertDirectorySeverity,
  type AlertDirectoryStatus,
  type AlertDirectoryType,
} from "@/lib/alerts/alert-view-model"

const ALERT_TYPE_ICONS: Record<AlertDirectoryType, typeof AlertTriangle> = {
  delay: Clock,
  hold: ShieldAlert,
  route_deviation: MapPin,
  congestion: Waves,
  maintenance: Ship,
  weather: AlertTriangle,
}

function StatCard(props: {
  icon: typeof Bell
  title: string
  value: number
}) {
  const Icon = props.icon

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-muted p-2">
            <Icon className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{props.value}</p>
            <p className="text-sm text-muted-foreground">{props.title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function AlertsPageClient({ alerts }: { alerts: AlertDirectoryItem[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [severityFilter, setSeverityFilter] =
    useState<AlertDirectorySeverity | "all">("all")
  const [statusFilter, setStatusFilter] =
    useState<AlertDirectoryStatus | "all">("all")
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const summary = useMemo(() => buildAlertSummary(alerts), [alerts])
  const filteredAlerts = useMemo(
    () =>
      filterAlertDirectoryItems(alerts, {
        searchTerm,
        severity: severityFilter,
        status: statusFilter,
      }),
    [alerts, searchTerm, severityFilter, statusFilter],
  )

  function runAlertAction(alertId: string, action: (id: string) => Promise<void>) {
    setActionError(null)
    setPendingActionId(alertId)

    startTransition(async () => {
      try {
        await action(alertId)
      } catch {
        setActionError("Không thể cập nhật cảnh báo. Vui lòng thử lại.")
      } finally {
        setPendingActionId(null)
      }
    })
  }

  return (
    <DashboardLayout
      title="Cảnh báo"
      description="Theo dõi, xác nhận và xử lý cảnh báo phát sinh từ dữ liệu thật"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard icon={Bell} title="Tổng cảnh báo" value={summary.total} />
          <StatCard icon={ShieldAlert} title="Nghiêm trọng đang mở" value={summary.criticalOpen} />
          <StatCard icon={AlertTriangle} title="Đang mở" value={summary.open} />
          <StatCard icon={CheckCircle2} title="Đã giải quyết" value={summary.resolved} />
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">Danh sách cảnh báo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Xác nhận và giải quyết sẽ cập nhật trực tiếp vào bảng `alerts`.
                </p>
                {actionError ? (
                  <p className="text-sm text-destructive">{actionError}</p>
                ) : null}
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="w-full bg-secondary pl-9 md:w-72"
                    placeholder="Tìm theo tiêu đề, nội dung, container..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
                <Select
                  value={severityFilter}
                  onValueChange={(value) =>
                    setSeverityFilter(value as AlertDirectorySeverity | "all")
                  }
                >
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Mức độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả mức độ</SelectItem>
                    <SelectItem value="critical">Nghiêm trọng</SelectItem>
                    <SelectItem value="warning">Cảnh báo</SelectItem>
                    <SelectItem value="info">Thông tin</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as AlertDirectoryStatus | "all")
                  }
                >
                  <SelectTrigger className="w-full md:w-44">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="open">Đang mở</SelectItem>
                    <SelectItem value="acknowledged">Đã xác nhận</SelectItem>
                    <SelectItem value="resolved">Đã giải quyết</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <Empty className="border border-dashed border-border bg-muted/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Bell />
                  </EmptyMedia>
                  <EmptyTitle>Chưa có cảnh báo trong hệ thống</EmptyTitle>
                  <EmptyDescription>
                    Khi bảng `alerts` có record thật từ delay, hold, route deviation hoặc các nguồn khác, chúng sẽ hiển thị ở đây.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : filteredAlerts.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                Không có cảnh báo phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <ScrollArea className="h-[640px] pr-3">
                <div className="space-y-4">
                  {filteredAlerts.map((alert) => {
                    const typeMeta = getAlertTypeMeta(alert.type)
                    const severityMeta = getAlertSeverityMeta(alert.severity)
                    const statusMeta = getAlertStatusMeta(alert.status)
                    const TypeIcon = ALERT_TYPE_ICONS[alert.type]
                    const isRowPending = pendingActionId === alert.id && isPending

                    return (
                      <div
                        key={alert.id}
                        className={cn(
                          "rounded-lg border p-4 transition-colors",
                          alert.severity === "critical" && alert.status === "open"
                            ? "border-destructive/40 bg-destructive/5"
                            : "border-border bg-card",
                        )}
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="flex gap-4">
                            <div className="rounded-lg bg-muted p-2">
                              <TypeIcon className="size-5 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-medium text-foreground">{alert.title}</h3>
                                <Badge variant="outline">{typeMeta.label}</Badge>
                                <Badge className={severityMeta.className}>
                                  {severityMeta.label}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={cn("border-transparent", statusMeta.className)}
                                >
                                  {statusMeta.label}
                                </Badge>
                              </div>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                {alert.message}
                              </p>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                <span>{alert.triggeredAtLabel}</span>
                                {alert.locationLabel ? <span>{alert.locationLabel}</span> : null}
                                {alert.vehicleLabel ? <span>{alert.vehicleLabel}</span> : null}
                                {alert.containerLabel ? <span>{alert.containerLabel}</span> : null}
                                {alert.voyageLabel ? <span>Chuyến {alert.voyageLabel}</span> : null}
                              </div>
                              {(alert.acknowledgedByLabel || alert.resolvedByLabel) && (
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                  {alert.acknowledgedByLabel ? (
                                    <span>Đã xác nhận bởi {alert.acknowledgedByLabel}</span>
                                  ) : null}
                                  {alert.resolvedByLabel ? (
                                    <span>Đã giải quyết bởi {alert.resolvedByLabel}</span>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          </div>
                          {alert.status !== "resolved" ? (
                            <div className="flex shrink-0 gap-2">
                              {alert.status === "open" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isRowPending}
                                  onClick={() =>
                                    runAlertAction(alert.id, acknowledgeAlertAction)
                                  }
                                >
                                  Xác nhận
                                </Button>
                              ) : null}
                              <Button
                                size="sm"
                                disabled={isRowPending}
                                onClick={() => runAlertAction(alert.id, resolveAlertAction)}
                              >
                                {isRowPending ? "Đang cập nhật..." : "Giải quyết"}
                              </Button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
