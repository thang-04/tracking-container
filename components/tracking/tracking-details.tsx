"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Navigation, MapPin } from "lucide-react"

type TrackingLocation = {
  id: string
  name?: string
  type?: string
  kind?: string
  portType?: string
  lat?: number | string | null
  lng?: number | string | null
  containerCount?: number | null
  isActive?: boolean | null
}

type TrackingVehicle = {
  id: string
  code?: string
  name?: string
  status?: string
  routeName?: string | null
  voyageStatus?: string | null
  speed?: string | number | null
  eta?: string | Date | null
  recordedAt?: string | Date | null
  manifestCount?: number | null
  containers?: Array<{
    containerNo?: string
    container_no?: string
    status?: string | null
    loadStatus?: string | null
  }>
}

function getStatusLabel(status?: string | null) {
  switch (status) {
    case "in_use":
    case "departed":
    case "moving":
      return "Đang chạy"
    case "loading":
      return "Đang xếp hàng"
    case "planned":
      return "Đang chờ"
    case "available":
      return "Sẵn sàng"
    case "maintenance":
      return "Bảo dưỡng"
    case "arrived":
      return "Đã đến"
    case "stopped":
      return "Dừng"
    default:
      return status ? status.replaceAll("_", " ") : "Không rõ"
  }
}

function getStatusClass(status?: string | null) {
  switch (status) {
    case "in_use":
    case "departed":
    case "moving":
      return "bg-success/10 text-success"
    case "loading":
      return "bg-warning/10 text-warning"
    case "maintenance":
      return "bg-destructive/10 text-destructive"
    case "available":
      return "bg-primary/10 text-primary"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getLocationLabel(type?: string | null) {
  switch (type) {
    case "dryport":
      return "Cảng cạn"
    case "port":
      return "Cảng biển"
    default:
      return type ? type.replaceAll("_", " ") : "Cảng"
  }
}

function formatDate(value?: string | Date | null) {
  if (!value) return "Chưa cập nhật"
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật"
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

function formatContainerLabel(container: { containerNo?: string; container_no?: string }) {
  return container.containerNo ?? container.container_no ?? "Container"
}

function formatLoadStatus(status?: string | null) {
  switch (status) {
    case "loaded":
      return "Đã xếp"
    case "planned":
      return "Chờ xếp"
    case "unloaded":
      return "Đã dỡ"
    default:
      return "Đang theo dõi"
  }
}

function formatSpeed(value?: string | number | null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value.toFixed(1)} km/h`
  }

  return value ?? "Chưa có"
}

export function TrackingDetails({
  vehicle,
  location,
  onClear,
}: {
  vehicle?: TrackingVehicle | null
  location?: TrackingLocation | null
  onClear?: () => void
}) {
  return (
    <Card className="border-border/50 bg-card shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-medium">
              {vehicle ? "Chi tiết phương tiện" : "Chi tiết vị trí"}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {vehicle ? "Thông tin vận hành và danh sách container hiện tại" : "Thông tin cảng và số container đang ghi nhận"}
            </p>
          </div>
          {onClear && (
            <Button variant="ghost" size="icon" onClick={onClear} className="h-8 w-8" type="button" aria-label="Đóng chi tiết">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {vehicle ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-success/10 p-2">
                  <Navigation className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="font-mono font-medium">{vehicle.code ?? vehicle.name ?? vehicle.id}</p>
                  <p className="text-sm text-muted-foreground">{vehicle.name ?? "Phương tiện"}</p>
                </div>
              </div>
              <Badge className={getStatusClass(vehicle.status)}>{getStatusLabel(vehicle.status)}</Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Tuyến</p>
                <p className="text-sm font-medium">{vehicle.routeName ?? "Chưa có tuyến"}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Chuyến</p>
                <p className="text-sm font-medium">{getStatusLabel(vehicle.voyageStatus)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Dự kiến đến</p>
                <p className="text-sm font-medium">{formatDate(vehicle.eta)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Tốc độ</p>
                <p className="text-sm font-medium">{formatSpeed(vehicle.speed)}</p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Danh sách container</p>
                <Badge variant="outline">{vehicle.manifestCount ?? vehicle.containers?.length ?? 0} container</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {(vehicle.containers ?? []).slice(0, 3).map((container, index) => (
                  <div key={`${formatContainerLabel(container)}-${index}`} className="flex items-center justify-between text-sm">
                    <span className="font-mono">{formatContainerLabel(container)}</span>
                    <span className="text-muted-foreground">{formatLoadStatus(container.loadStatus ?? container.status)}</span>
                  </div>
                ))}
                {(vehicle.containers?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground">Chưa có container trong danh sách hiện tại.</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Cập nhật lúc</span>
              <span>{formatDate(vehicle.recordedAt)}</span>
            </div>
          </>
        ) : location ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{location.name ?? "Vị trí"}</p>
                  <p className="text-sm text-muted-foreground">
                    {getLocationLabel(location.type ?? location.kind ?? location.portType)}
                  </p>
                </div>
              </div>
              <Badge className={location.isActive === false ? "bg-muted text-muted-foreground" : "bg-success/10 text-success"}>
                {location.isActive === false ? "Ngừng dùng" : "Hoạt động"}
              </Badge>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Container</p>
                <p className="text-lg font-bold">{location.containerCount ?? 0}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Loại cảng</p>
                <p className="text-sm font-medium">
                  {getLocationLabel(location.type ?? location.kind ?? location.portType)}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Tọa độ</p>
              <p className="text-sm font-medium">
                {location.lat ?? "?"}, {location.lng ?? "?"}
              </p>
            </div>
          </>
        ) : (
          <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground">
            Chọn một phương tiện hoặc cảng để xem chi tiết.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
