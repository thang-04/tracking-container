"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrackingMap } from "@/components/tracking/tracking-map"
import type { TrackingOverview } from "@/lib/tracking/types"
import { ArrowRight, MapPin, Route, Ship } from "lucide-react"
import Link from "next/link"

function formatStatus(status?: string | null) {
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
    default:
      return status ? status.replaceAll("_", " ") : "Không rõ"
  }
}

export function LiveTrackingPreview({ overview }: { overview: TrackingOverview }) {
  const hasData = overview.hasData && (overview.locations.length > 0 || overview.routes.length > 0 || overview.vehicles.length > 0)

  return (
    <Card className="border-border/50">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">Theo dõi trực tiếp</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Tóm tắt vị trí cảng, tuyến và phương tiện đang hoạt động.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={hasData ? "default" : "secondary"}>{hasData ? "Có dữ liệu" : "Chưa có dữ liệu"}</Badge>
            <Link href="/map">
              <Button variant="ghost" size="sm" className="gap-1">
                Xem bản đồ <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Điểm cảng
            </div>
            <p className="mt-1 text-lg font-semibold">{overview.locations.length}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Route className="h-3.5 w-3.5" />
              Tuyến
            </div>
            <p className="mt-1 text-lg font-semibold">{overview.routes.length}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Ship className="h-3.5 w-3.5" />
              Phương tiện
            </div>
            <p className="mt-1 text-lg font-semibold">{overview.vehicles.length}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-border/60">
          <div className="h-[360px]">
            <TrackingMap
              locations={overview.locations}
              routes={overview.routes}
              vehicles={overview.vehicles}
              selectedVehicleId={null}
              selectedLocationId={null}
              onSelectVehicle={() => {}}
              onSelectLocation={() => {}}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Phương tiện nổi bật</p>
            <div className="mt-2 space-y-2">
              {overview.vehicles.slice(0, 3).map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-mono">{vehicle.code}</span>
                  <span className="text-muted-foreground">{formatStatus(vehicle.status)}</span>
                </div>
              ))}
              {overview.vehicles.length === 0 && <p className="text-sm text-muted-foreground">Chưa có phương tiện theo dõi.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Tuyến đang hiển thị</p>
            <div className="mt-2 space-y-2">
              {overview.routes.slice(0, 2).map((route) => (
                <div key={route.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{route.name}</span>
                  <span className="text-muted-foreground">{route.points.length} điểm</span>
                </div>
              ))}
              {overview.routes.length === 0 && <p className="text-sm text-muted-foreground">Chưa có tuyến nào được ghép dữ liệu.</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
