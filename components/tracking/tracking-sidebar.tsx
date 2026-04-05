"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Navigation, Package, Search } from "lucide-react"

type TrackingVehicle = {
  id: string
  code?: string
  name?: string
  status?: string
  routeName?: string | null
  voyageStatus?: string | null
  manifestCount?: number | null
  speed?: string | number | null
}

type StatusOption = { value: string; label: string }

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

export function TrackingSidebar({
  vehicles,
  allVehicles,
  filter,
  searchTerm,
  statusOptions,
  onFilterChange,
  onSearchTermChange,
  selectedVehicleId,
  onSelectVehicle,
}: {
  vehicles: TrackingVehicle[]
  allVehicles: TrackingVehicle[]
  filter: string
  searchTerm: string
  statusOptions: StatusOption[]
  onFilterChange: (value: string) => void
  onSearchTermChange: (value: string) => void
  selectedVehicleId: string | null
  onSelectVehicle: (vehicleId: string) => void
}) {
  return (
    <>
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm phương tiện..."
                className="bg-secondary pl-9"
                value={searchTerm}
                onChange={(event) => onSearchTermChange(event.target.value)}
              />
            </div>
            <Select value={filter} onValueChange={onFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Phương tiện đang hoạt động ({vehicles.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 p-4 pt-0">
              {vehicles.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Không có phương tiện phù hợp với bộ lọc hiện tại.
                </div>
              ) : (
                vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    onClick={() => onSelectVehicle(vehicle.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedVehicleId === vehicle.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-lg p-1.5 ${getStatusClass(vehicle.status)}`}>
                          <Navigation className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-medium">{vehicle.code ?? vehicle.name ?? vehicle.id}</p>
                          <p className="text-xs text-muted-foreground">{vehicle.name ?? "Phương tiện"}</p>
                        </div>
                      </div>
                      <Badge className={getStatusClass(vehicle.status)}>{getStatusLabel(vehicle.status)}</Badge>
                    </div>
                    {vehicle.routeName && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Package className="h-3 w-3" />
                        {vehicle.routeName}
                        {vehicle.speed !== undefined && vehicle.speed !== null ? ` • ${vehicle.speed}` : ""}
                      </div>
                    )}
                    {typeof vehicle.manifestCount === "number" && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {vehicle.manifestCount} container trên manifest
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {allVehicles.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-foreground">{allVehicles.length}</p>
              <p className="text-sm text-muted-foreground">Tổng phương tiện</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-foreground">{vehicles.length}</p>
              <p className="text-sm text-muted-foreground">Đang hiển thị</p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
