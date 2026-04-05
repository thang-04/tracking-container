"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { TrackingMap } from "@/components/tracking/tracking-map"
import { TrackingSidebar } from "@/components/tracking/tracking-sidebar"
import { TrackingDetails } from "@/components/tracking/tracking-details"
import type { TrackingOverview } from "@/lib/tracking/types"

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
  containers?: Array<{ containerNo?: string; container_no?: string; status?: string | null }>
  x?: number
  y?: number
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

type TrackingPoint = {
  x?: number
  y?: number
  lat?: number | string | null
  lng?: number | string | null
  name?: string
}

type TrackingOverviewData = TrackingOverview & {
  locations?: TrackingLocation[]
  vehicles?: TrackingVehicle[]
  routes?: TrackingRoute[]
  generatedAt?: string | Date | null
}

function getStatusOptions(vehicles: TrackingVehicle[]) {
  const labels = new Map<string, string>()

  for (const vehicle of vehicles) {
    if (!vehicle.status) continue
    labels.set(vehicle.status, getStatusLabel(vehicle.status))
  }

  return [{ value: "all", label: "Tất cả" }, ...Array.from(labels.entries()).map(([value, label]) => ({ value, label }))]
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

export function TrackingScreen({ overview }: { overview: TrackingOverview }) {
  const data = overview as TrackingOverviewData
  const locations = data.locations ?? []
  const routes = data.routes ?? []
  const vehicles = data.vehicles ?? []

  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null)
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      [vehicle.code, vehicle.name, vehicle.routeName, vehicle.status, vehicle.voyageStatus]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    const matchesFilter = filter === "all" || vehicle.status === filter
    return matchesSearch && matchesFilter
  })

  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId) ?? null
  const selectedLocation = locations.find((location) => location.id === selectedLocationId) ?? null

  return (
    <DashboardLayout title="Bản đồ theo dõi" description="Theo dõi vị trí phương tiện, tuyến và container theo thời gian thực">
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-4 lg:col-span-1">
          <TrackingSidebar
            vehicles={filteredVehicles}
            allVehicles={vehicles}
            filter={filter}
            searchTerm={searchTerm}
            statusOptions={getStatusOptions(vehicles)}
            onFilterChange={setFilter}
            onSearchTermChange={setSearchTerm}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={(vehicleId) => {
              setSelectedVehicleId(vehicleId)
              setSelectedLocationId(null)
            }}
          />
        </div>

        <div className="lg:col-span-3">
          <Card className="border-border/50">
            <CardContent className="relative h-[600px] overflow-hidden rounded-lg p-0">
              <TrackingMap
                locations={locations}
                routes={routes}
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                selectedLocationId={selectedLocationId}
                onSelectVehicle={(vehicleId) => {
                  setSelectedVehicleId(vehicleId)
                  setSelectedLocationId(null)
                }}
                onSelectLocation={(locationId) => {
                  setSelectedLocationId(locationId)
                  setSelectedVehicleId(null)
                }}
              />

              {(selectedVehicle || selectedLocation) && (
                <div className="absolute bottom-4 right-4 z-10 w-80">
                  <TrackingDetails
                    vehicle={selectedVehicle}
                    location={selectedLocation}
                    onClear={() => {
                      setSelectedVehicleId(null)
                      setSelectedLocationId(null)
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
