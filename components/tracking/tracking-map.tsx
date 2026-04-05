"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Layers, Locate, MapPin, Navigation, Package, ZoomIn, ZoomOut, Ship } from "lucide-react"

type TrackingLocation = {
  id: string
  name?: string
  type?: string
  kind?: string
  portType?: string
  lat?: number | string | null
  lng?: number | string | null
  x?: number
  y?: number
  containerCount?: number | null
}

type TrackingRoute = {
  id: string
  name?: string
  code?: string
  from?: TrackingPoint
  to?: TrackingPoint
  points?: TrackingPoint[]
  checkpoints?: TrackingPoint[]
}

type TrackingVehicle = {
  id: string
  code?: string
  name?: string
  status?: string
  lat?: number | string | null
  lng?: number | string | null
  x?: number
  y?: number
}

type TrackingPoint = {
  x?: number
  y?: number
  lat?: number | string | null
  lng?: number | string | null
  name?: string
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function projectPoint(point?: TrackingPoint | null) {
  if (!point) return null

  if (typeof point.x === "number" && typeof point.y === "number") {
    return { x: point.x, y: point.y }
  }

  const lat = toNumber(point.lat)
  const lng = toNumber(point.lng)

  if (lat === null || lng === null) return null

  const x = clamp(18 + ((lng - 102) / 9) * 68, 8, 92)
  const y = clamp(16 + (1 - (lat - 8) / 14) * 70, 8, 92)

  return { x, y }
}

function getLocationTone(type?: string) {
  switch (type) {
    case "dryport":
      return {
        wrapper: "bg-accent text-accent-foreground",
        ring: "ring-accent/40",
        icon: MapPin,
        label: "Cảng cạn",
      }
    default:
      return {
        wrapper: "bg-primary text-primary-foreground",
        ring: "ring-primary/40",
        icon: Ship,
        label: "Cảng biển",
      }
  }
}

function getVehicleTone(status?: string) {
  switch (status) {
    case "loading":
      return { wrapper: "bg-warning", label: "Đang xếp hàng", text: "text-warning-foreground" }
    case "maintenance":
      return { wrapper: "bg-destructive", label: "Bảo dưỡng", text: "text-destructive-foreground" }
    case "available":
      return { wrapper: "bg-muted", label: "Sẵn sàng", text: "text-muted-foreground" }
    default:
      return { wrapper: "bg-success", label: "Đang chạy", text: "text-white" }
  }
}

function getRoutePoints(route: TrackingRoute) {
  const candidates = route.points?.length ? route.points : route.checkpoints?.length ? route.checkpoints : [route.from, route.to]
  return candidates.filter(Boolean).map((point) => projectPoint(point as TrackingPoint)).filter(Boolean) as Array<{ x: number; y: number }>
}

export function TrackingMap({
  locations,
  routes,
  vehicles,
  selectedVehicleId,
  selectedLocationId,
  onSelectVehicle,
  onSelectLocation,
}: {
  locations: TrackingLocation[]
  routes: TrackingRoute[]
  vehicles: TrackingVehicle[]
  selectedVehicleId: string | null
  selectedLocationId: string | null
  onSelectVehicle: (vehicleId: string) => void
  onSelectLocation: (locationId: string) => void
}) {
  const hasContent = locations.length > 0 || routes.length > 0 || vehicles.length > 0

  return (
    <div className="relative h-full w-full bg-secondary/30">
      <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
        <Button variant="secondary" size="icon" className="h-8 w-8" type="button" aria-label="Phóng to">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8" type="button" aria-label="Thu nhỏ">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8" type="button" aria-label="Định vị">
          <Locate className="h-4 w-4" />
        </Button>
        <Button variant="secondary" size="icon" className="h-8 w-8" type="button" aria-label="Lớp bản đồ">
          <Layers className="h-4 w-4" />
        </Button>
      </div>

      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        style={{ opacity: 0.14 }}
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M55,2 L75,8 L82,22 L78,35 L72,48 L75,58 L70,72 L72,82 L65,95 L55,98 L58,85 L62,72 L58,62 L60,52 L56,42 L62,32 L56,22 L55,2"
          fill="hsl(var(--primary))"
          stroke="hsl(var(--primary))"
          strokeWidth="0.5"
        />
      </svg>

      <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
        {routes.map((route) => {
          const points = getRoutePoints(route)
          if (points.length < 2) return null
          const polyline = points.map((point) => `${point.x},${point.y}`).join(" ")
          return (
            <g key={route.id}>
              <polyline
                points={polyline}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeDasharray="6 4"
                opacity="0.45"
              />
            </g>
          )
        })}
      </svg>

      {locations.map((location) => {
        const point = projectPoint(location)
        if (!point) return null
        const tone = getLocationTone(location.type ?? location.kind ?? location.portType)
        const isSelected = selectedLocationId === location.id
        const LocationIcon = tone.icon

        return (
          <button
            key={location.id}
            type="button"
            onClick={() => onSelectLocation(location.id)}
            aria-label={`Chọn ${tone.label.toLowerCase()} ${location.name ?? ""}`.trim()}
            className="absolute flex flex-col items-center transition-transform hover:scale-110"
            style={{ left: `${point.x}%`, top: `${point.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg ${tone.wrapper} ${
                isSelected ? `ring-2 ring-offset-2 ${tone.ring}` : ""
              }`}
            >
              <LocationIcon className="h-5 w-5" />
            </div>
            <span className="mt-1 whitespace-nowrap rounded bg-background/90 px-2 py-0.5 text-xs font-medium shadow">
              {location.name}
            </span>
          </button>
        )
      })}

      {vehicles.map((vehicle) => {
        const point = projectPoint(vehicle)
        if (!point) return null
        const tone = getVehicleTone(vehicle.status)
        const isSelected = selectedVehicleId === vehicle.id

        return (
          <button
            key={vehicle.id}
            type="button"
            onClick={() => onSelectVehicle(vehicle.id)}
            aria-label={`Chọn phương tiện ${vehicle.code ?? vehicle.name ?? vehicle.id}`}
            className={`absolute transition-transform hover:scale-110 ${vehicle.status === "in_use" || vehicle.status === "departed" || vehicle.status === "moving" ? "animate-pulse" : ""}`}
            style={{ left: `${point.x}%`, top: `${point.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg ${tone.wrapper} ${
                isSelected ? "ring-2 ring-ring ring-offset-2" : ""
              }`}
            >
              <Navigation className={`h-4 w-4 ${tone.text}`} />
            </div>
          </button>
        )
      })}

      {!hasContent && (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <Card className="max-w-md border-border/70 bg-card/95 px-6 py-5 text-center shadow-lg">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold">Chưa có dữ liệu theo dõi</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Hệ thống sẽ hiển thị cảng, tuyến và phương tiện khi có dữ liệu từ database.
            </p>
          </Card>
        </div>
      )}

      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-card/90 px-4 py-2 text-sm shadow">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Cảng biển</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-accent" />
          <span className="text-muted-foreground">Cảng cạn</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-success" />
          <span className="text-muted-foreground">Đang chạy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-warning" />
          <span className="text-muted-foreground">Đang xếp hàng</span>
        </div>
      </div>
    </div>
  )
}
