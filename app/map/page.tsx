"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Truck, Package, MapPin, Navigation, Search, Layers, ZoomIn, ZoomOut, Locate } from "lucide-react"

interface Location {
  id: string
  name: string
  type: "port" | "dryport" | "depot"
  lat: number
  lng: number
  containers: number
  x: number
  y: number
}

interface Vehicle {
  id: string
  plateNumber: string
  driver: string
  status: "moving" | "stopped" | "loading"
  currentContainer?: string
  route?: string
  speed?: string
  x: number
  y: number
}

const locations: Location[] = [
  { id: "1", name: "Cảng Hải Phòng", type: "port", lat: 20.8449, lng: 106.6881, containers: 145, x: 78, y: 22 },
  { id: "2", name: "Cảng cạn Hà Nội", type: "dryport", lat: 21.0285, lng: 105.8542, containers: 89, x: 58, y: 18 },
  { id: "3", name: "Cảng Đà Nẵng", type: "port", lat: 16.0544, lng: 108.2022, containers: 67, x: 72, y: 52 },
  { id: "4", name: "Cảng cạn TP.HCM", type: "dryport", lat: 10.8231, lng: 106.6297, containers: 203, x: 62, y: 88 },
  { id: "5", name: "Cảng Vũng Tàu", type: "port", lat: 10.4114, lng: 107.1362, containers: 56, x: 72, y: 92 },
  { id: "6", name: "Cảng Quy Nhơn", type: "port", lat: 13.7829, lng: 109.2196, containers: 34, x: 76, y: 65 },
]

const vehicles: Vehicle[] = [
  { id: "1", plateNumber: "29H-12345", driver: "Nguyễn Văn A", status: "moving", currentContainer: "MSKU-2847561", route: "HP → HN", speed: "65 km/h", x: 68, y: 20 },
  { id: "2", plateNumber: "30A-54321", driver: "Trần Văn B", status: "loading", currentContainer: "TCLU-9876543", x: 78, y: 22 },
  { id: "3", plateNumber: "51F-11111", driver: "Phạm Văn D", status: "moving", currentContainer: "TEMU-3456789", route: "ĐN → HCM", speed: "72 km/h", x: 68, y: 70 },
  { id: "4", plateNumber: "43A-22222", driver: "Hoàng Văn E", status: "stopped", x: 62, y: 88 },
  { id: "5", plateNumber: "29C-98765", driver: "Lê Văn C", status: "moving", currentContainer: "HLXU-5678901", route: "HP → HN", speed: "58 km/h", x: 63, y: 19 },
]

const routes = [
  { from: { x: 78, y: 22 }, to: { x: 58, y: 18 }, name: "HP-HN" },
  { from: { x: 72, y: 52 }, to: { x: 62, y: 88 }, name: "DN-HCM" },
  { from: { x: 76, y: 65 }, to: { x: 62, y: 88 }, name: "QN-HCM" },
]

const statusConfig = {
  moving: { label: "Đang chạy", className: "bg-success/10 text-success" },
  stopped: { label: "Dừng", className: "bg-muted text-muted-foreground" },
  loading: { label: "Đang xếp hàng", className: "bg-warning/10 text-warning" },
}

const locationTypeConfig = {
  port: { label: "Cảng biển", className: "bg-primary text-primary-foreground" },
  dryport: { label: "Cảng cạn", className: "bg-accent text-accent-foreground" },
  depot: { label: "Bãi xe", className: "bg-muted text-muted-foreground" },
}

export default function MapPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch = v.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === "all" || v.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <DashboardLayout
      title="Bản đồ theo dõi"
      description="Theo dõi thời gian thực xe và container"
    >
      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar Panel */}
        <div className="space-y-4 lg:col-span-1">
          {/* Search and Filter */}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm xe..."
                    className="bg-secondary pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả xe</SelectItem>
                    <SelectItem value="moving">Đang chạy</SelectItem>
                    <SelectItem value="stopped">Dừng</SelectItem>
                    <SelectItem value="loading">Đang xếp hàng</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Vehicle List */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Xe đang hoạt động ({filteredVehicles.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-1 p-4 pt-0">
                  {filteredVehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => {
                        setSelectedVehicle(vehicle)
                        setSelectedLocation(null)
                      }}
                      className={`w-full rounded-lg border p-3 text-left transition-colors ${
                        selectedVehicle?.id === vehicle.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`rounded-lg p-1.5 ${
                            vehicle.status === "moving" ? "bg-success/10" : 
                            vehicle.status === "loading" ? "bg-warning/10" : "bg-muted"
                          }`}>
                            <Truck className={`h-4 w-4 ${
                              vehicle.status === "moving" ? "text-success" : 
                              vehicle.status === "loading" ? "text-warning" : "text-muted-foreground"
                            }`} />
                          </div>
                          <div>
                            <p className="font-mono text-sm font-medium">{vehicle.plateNumber}</p>
                            <p className="text-xs text-muted-foreground">{vehicle.driver}</p>
                          </div>
                        </div>
                        <Badge className={statusConfig[vehicle.status].className}>
                          {statusConfig[vehicle.status].label}
                        </Badge>
                      </div>
                      {vehicle.currentContainer && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Package className="h-3 w-3" />
                          {vehicle.currentContainer}
                        </div>
                      )}
                      {vehicle.route && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Navigation className="h-3 w-3" />
                          {vehicle.route} • {vehicle.speed}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Map Area */}
        <Card className="border-border/50 lg:col-span-3">
          <CardContent className="relative h-[600px] p-0 overflow-hidden rounded-lg">
            {/* Map Controls */}
            <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <Locate className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon" className="h-8 w-8">
                <Layers className="h-4 w-4" />
              </Button>
            </div>

            {/* Map Background */}
            <div className="relative h-full w-full bg-secondary/30">
              {/* Vietnam Map Shape */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 h-full w-full"
                style={{ opacity: 0.15 }}
                preserveAspectRatio="xMidYMid meet"
              >
                <path
                  d="M55,2 L75,8 L82,22 L78,35 L72,48 L75,58 L70,72 L72,82 L65,95 L55,98 L58,85 L62,72 L58,62 L60,52 L56,42 L62,32 L56,22 L55,2"
                  fill="hsl(var(--primary))"
                  stroke="hsl(var(--primary))"
                  strokeWidth="0.5"
                />
              </svg>

              {/* Route Lines */}
              <svg className="absolute inset-0 h-full w-full" style={{ pointerEvents: "none" }}>
                {routes.map((route, i) => (
                  <g key={i}>
                    <line
                      x1={`${route.from.x}%`}
                      y1={`${route.from.y}%`}
                      x2={`${route.to.x}%`}
                      y2={`${route.to.y}%`}
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeDasharray="6 4"
                      opacity="0.4"
                    />
                  </g>
                ))}
              </svg>

              {/* Location Markers */}
              {locations.map((loc) => (
                <button
                  key={loc.id}
                  className="absolute flex flex-col items-center transition-transform hover:scale-110"
                  style={{ left: `${loc.x}%`, top: `${loc.y}%`, transform: "translate(-50%, -50%)" }}
                  onClick={() => {
                    setSelectedLocation(loc)
                    setSelectedVehicle(null)
                  }}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg ${
                      locationTypeConfig[loc.type].className
                    } ${selectedLocation?.id === loc.id ? "ring-2 ring-ring ring-offset-2" : ""}`}
                  >
                    {loc.type === "port" ? (
                      <Package className="h-5 w-5" />
                    ) : (
                      <MapPin className="h-5 w-5" />
                    )}
                  </div>
                  <span className="mt-1 whitespace-nowrap rounded bg-background/90 px-2 py-0.5 text-xs font-medium shadow">
                    {loc.name}
                  </span>
                </button>
              ))}

              {/* Vehicle Markers */}
              {vehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  className={`absolute transition-transform hover:scale-110 ${
                    vehicle.status === "moving" ? "animate-pulse" : ""
                  }`}
                  style={{ left: `${vehicle.x}%`, top: `${vehicle.y}%`, transform: "translate(-50%, -50%)" }}
                  onClick={() => {
                    setSelectedVehicle(vehicle)
                    setSelectedLocation(null)
                  }}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg ${
                      vehicle.status === "moving" ? "bg-success" : 
                      vehicle.status === "loading" ? "bg-warning" : "bg-muted"
                    } ${selectedVehicle?.id === vehicle.id ? "ring-2 ring-ring ring-offset-2" : ""}`}
                  >
                    <Truck className={`h-4 w-4 ${
                      vehicle.status === "moving" || vehicle.status === "loading" ? "text-white" : "text-muted-foreground"
                    }`} />
                  </div>
                </button>
              ))}
            </div>

            {/* Info Panel */}
            {(selectedVehicle || selectedLocation) && (
              <div className="absolute bottom-4 right-4 z-10 w-72 rounded-lg border border-border bg-card p-4 shadow-lg">
                {selectedVehicle && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-success/10 p-2">
                          <Truck className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="font-mono font-medium">{selectedVehicle.plateNumber}</p>
                          <p className="text-sm text-muted-foreground">{selectedVehicle.driver}</p>
                        </div>
                      </div>
                      <Badge className={statusConfig[selectedVehicle.status].className}>
                        {statusConfig[selectedVehicle.status].label}
                      </Badge>
                    </div>
                    {selectedVehicle.currentContainer && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Container</p>
                        <p className="font-mono text-sm font-medium">{selectedVehicle.currentContainer}</p>
                      </div>
                    )}
                    {selectedVehicle.route && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">Tuyến</p>
                          <p className="text-sm font-medium">{selectedVehicle.route}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3">
                          <p className="text-xs text-muted-foreground">Tốc độ</p>
                          <p className="text-sm font-medium">{selectedVehicle.speed}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {selectedLocation && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-lg p-2 ${
                          selectedLocation.type === "port" ? "bg-primary/10" : "bg-accent/10"
                        }`}>
                          {selectedLocation.type === "port" ? (
                            <Package className={`h-5 w-5 ${
                              selectedLocation.type === "port" ? "text-primary" : "text-accent"
                            }`} />
                          ) : (
                            <MapPin className="h-5 w-5 text-accent" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{selectedLocation.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{locationTypeConfig[selectedLocation.type].label}</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Container</p>
                        <p className="text-lg font-bold">{selectedLocation.containers}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs text-muted-foreground">Tọa độ</p>
                        <p className="text-xs font-medium">{selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 rounded-lg border border-border bg-card/90 px-4 py-2 text-sm shadow">
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
                <span className="text-muted-foreground">Xếp hàng</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
