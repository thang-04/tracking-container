"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
  Plus,
  RefreshCw,
  Settings2,
  Ship,
  Truck,
  Zap,
} from "lucide-react"
import type { VehicleData, TransportContainerData } from "@/lib/transport/get-transport-data"

interface Assignment {
  containerId: string
  vehicleId: string
  vehicleCode: string
  vehicleType: "truck" | "barge"
  route: string
  estimatedTime: string
}

const statusConfig = {
  available: { label: "Sẵn sàng", className: "bg-success/10 text-success" },
  assigned: { label: "Đã gán", className: "bg-primary/10 text-primary" },
  "in-transit": { label: "Đang chạy", className: "bg-warning/10 text-warning" },
  maintenance: { label: "Bảo dưỡng", className: "bg-destructive/10 text-destructive" },
}

const priorityConfig = {
  high: { label: "Cao", className: "bg-destructive/10 text-destructive" },
  medium: { label: "Trung bình", className: "bg-warning/10 text-warning" },
  low: { label: "Thấp", className: "bg-muted text-muted-foreground" },
}

const transportSuggestion = {
  truck: { label: "Xe tải", icon: Truck, color: "text-warning" },
  barge: { label: "Sà lan", icon: Ship, color: "text-primary" },
  both: { label: "Linh hoạt", icon: RefreshCw, color: "text-accent" },
}

interface TransportClientProps {
  initialVehicles: VehicleData[]
  initialContainers: TransportContainerData[]
  routes: any[]
}

export function TransportClient({ initialVehicles, initialContainers, routes }: TransportClientProps) {
  const [vehicles, setVehicles] = useState(initialVehicles)
  const [pendingContainers, setPendingContainers] = useState(initialContainers)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isAutoAssigning, setIsAutoAssigning] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [manualAssignments, setManualAssignments] = useState<Record<string, string>>({})
  const [selectedTab, setSelectedTab] = useState("all")
  const [optimizeMode, setOptimizeMode] = useState<"speed" | "balanced">("balanced")
  const [isCreateVehicleOpen, setIsCreateVehicleOpen] = useState(false)
  const [newVehicleData, setNewVehicleData] = useState({
    code: "",
    name: "",
    driver: "",
    type: "truck" as "truck" | "barge",
    capacity: "",
    currentLocation: "",
  })

  const trucks = vehicles.filter((vehicle) => vehicle.type === "truck")
  const barges = vehicles.filter((vehicle) => vehicle.type === "barge")
  const availableTrucks = trucks.filter((truck) => truck.status === "available")
  const availableBarges = barges.filter((barge) => barge.status === "available")

  const autoAssign = () => {
    setIsAutoAssigning(true)

    setTimeout(() => {
      const newAssignments: Assignment[] = []
      let availableVehicles = [...vehicles.filter(v => v.status === "available")]

      for (const container of pendingContainers) {
         if (availableVehicles.length === 0) break;
         const vehicle = availableVehicles.shift()!
         newAssignments.push({
            containerId: container.containerId,
            vehicleId: vehicle.id,
            vehicleCode: vehicle.code,
            vehicleType: vehicle.type,
            route: `${container.origin} -> ${container.destination}`,
            estimatedTime: "2 giờ",
         })
      }

      setAssignments(newAssignments)
      setIsAutoAssigning(false)
      setShowResults(true)
    }, 1000)
  }

  const handleManualAssignment = (containerId: string, vehicleId: string) => {
    setManualAssignments((prev) => ({
      ...prev,
      [containerId]: vehicleId,
    }))
  }

  const handleCreateVehicle = () => {
    if (!newVehicleData.code || !newVehicleData.name || !newVehicleData.driver) {
      return
    }

    const newVehicle: VehicleData = {
      id: `${newVehicleData.type === "truck" ? "T" : "B"}${vehicles.length + 1}`,
      code: newVehicleData.code,
      name: newVehicleData.name,
      driver: newVehicleData.driver,
      status: "available",
      capacity: newVehicleData.capacity,
      currentLocation: newVehicleData.currentLocation,
      type: newVehicleData.type,
    }

    setVehicles((prev) => [...prev, newVehicle])
    setNewVehicleData({
      code: "",
      name: "",
      driver: "",
      type: "truck",
      capacity: "",
      currentLocation: "",
    })
    setIsCreateVehicleOpen(false)
  }

  return (
    <DashboardLayout
      title="Phân công vận chuyển"
      description="Gán phương tiện cho container - Hỗ trợ xe tải và sà lan"
    >
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <Package className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingContainers.length}</p>
                <p className="text-sm text-muted-foreground">Chờ phân công</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <Truck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{availableTrucks.length}</p>
                <p className="text-sm text-muted-foreground">Xe tải sẵn sàng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Ship className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{availableBarges.length}</p>
                <p className="text-sm text-muted-foreground">Sà lan sẵn sàng</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base font-medium">Container chờ phân công</CardTitle>
                <CardDescription>Hệ thống đề xuất phương tiện phù hợp theo chế độ vận hành</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={optimizeMode} onValueChange={(value: "speed" | "balanced") => setOptimizeMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="speed">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Nhanh nhất
                      </div>
                    </SelectItem>
                    <SelectItem value="balanced">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Cân bằng
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={autoAssign} disabled={isAutoAssigning || pendingContainers.length === 0}>
                  {isAutoAssigning ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Tự động
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-[500px] space-y-3 overflow-y-auto pr-2">
              {pendingContainers.length > 0 ? pendingContainers.map((container) => {
                const suggestion = container.suggestedTransport
                  ? transportSuggestion[container.suggestedTransport]
                  : null
                const SuggestionIcon = suggestion?.icon || Package

                return (
                  <div
                    key={container.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-medium">{container.containerId}</span>
                        <Badge className={priorityConfig[container.priority].className}>
                          {priorityConfig[container.priority].label}
                        </Badge>
                        {suggestion && (
                          <Badge variant="outline" className={`gap-1 ${suggestion.color}`}>
                            <SuggestionIcon className="h-3 w-3" />
                            {suggestion.label}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {container.origin} {"->"} {container.destination}
                      </p>
                      <p className="text-xs text-muted-foreground">{container.weight}</p>
                    </div>

                    <div className="ml-2 flex items-center gap-2">
                      <Select
                        value={manualAssignments[container.containerId] || ""}
                        onValueChange={(value) => handleManualAssignment(container.containerId, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Chọn phương tiện" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto" className="text-muted-foreground">
                            Tự động
                          </SelectItem>
                          {availableTrucks.length > 0 && <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            Xe tải
                          </div>}
                          {availableTrucks.map((truck) => (
                            <SelectItem key={truck.id} value={truck.id}>
                              <div className="flex items-center gap-2">
                                <Truck className="h-3 w-3" />
                                {truck.code}
                              </div>
                            </SelectItem>
                          ))}
                          {availableBarges.length > 0 && <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                            Sà lan
                          </div>}
                          {availableBarges.map((barge) => (
                            <SelectItem key={barge.id} value={barge.id}>
                              <div className="flex items-center gap-2">
                                <Ship className="h-3 w-3" />
                                {barge.code}
                              </div>
                            </SelectItem>
                          ))}
                          {availableTrucks.length === 0 && availableBarges.length === 0 && (
                            <SelectItem value="none" disabled>Hết phương tiện sẵn sàng</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )
              }) : (
                 <div className="text-center p-8 text-muted-foreground border border-dashed rounded-lg">
                   Không có container chờ phân công
                 </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-medium">Trạng thái đội phương tiện</CardTitle>
              <CardDescription>Quản lý và theo dõi tất cả phương tiện vận chuyển</CardDescription>
            </div>
            <Dialog open={isCreateVehicleOpen} onOpenChange={setIsCreateVehicleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo phương tiện
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Tạo phương tiện mới</DialogTitle>
                  <DialogDescription>
                    Thêm phương tiện vận chuyển mới vào hệ thống (xe tải hoặc sà lan)
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Mã phương tiện</label>
                    <Input
                      placeholder="VD: 29H-12345 hoặc SL-HP-001"
                      value={newVehicleData.code}
                      onChange={(e) => setNewVehicleData({ ...newVehicleData, code: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Tên phương tiện</label>
                    <Input
                      placeholder="VD: Xe tải 7 hoặc Sà lan TP.HCM 3"
                      value={newVehicleData.name}
                      onChange={(e) => setNewVehicleData({ ...newVehicleData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Tài xế / Thuyền trưởng</label>
                    <Input
                      placeholder="Tên người điều khiển"
                      value={newVehicleData.driver}
                      onChange={(e) => setNewVehicleData({ ...newVehicleData, driver: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Loại phương tiện</label>
                    <Select
                      value={newVehicleData.type}
                      onValueChange={(value) =>
                        setNewVehicleData({ ...newVehicleData, type: value as "truck" | "barge" })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truck">Xe tải</SelectItem>
                        <SelectItem value="barge">Sà lan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Dung tích / Tải trọng</label>
                    <Input
                      placeholder="VD: 30 tấn hoặc 200 TEU"
                      value={newVehicleData.capacity}
                      onChange={(e) => setNewVehicleData({ ...newVehicleData, capacity: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                  <Button variant="outline" onClick={() => setIsCreateVehicleOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    onClick={handleCreateVehicle}
                    disabled={!newVehicleData.code || !newVehicleData.name || !newVehicleData.driver}
                  >
                    Tạo phương tiện
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-4 grid w-full grid-cols-3">
                <TabsTrigger value="all">Tất cả ({vehicles.length})</TabsTrigger>
                <TabsTrigger value="trucks" className="gap-1">
                  <Truck className="h-3 w-3" />
                  Xe tải ({trucks.length})
                </TabsTrigger>
                <TabsTrigger value="barges" className="gap-1">
                  <Ship className="h-3 w-3" />
                  Sà lan ({barges.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <VehicleTable vehicles={vehicles} />
              </TabsContent>
              <TabsContent value="trucks" className="mt-0">
                <VehicleTable vehicles={trucks} />
              </TabsContent>
              <TabsContent value="barges" className="mt-0">
                <VehicleTable vehicles={barges} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-h-[80vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-success" />
              Phân công tự động hoàn tất
            </DialogTitle>
            <DialogDescription>
              Hệ thống đã tối ưu phân công {assignments.length} container theo chế độ{" "}
              {optimizeMode === "speed" ? "Nhanh nhất" : "Cân bằng"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-warning">
                <Truck className="h-4 w-4" />
                <span className="text-lg font-bold">
                  {assignments.filter((assignment) => assignment.vehicleType === "truck").length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Xe tải</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-primary">
                <Ship className="h-4 w-4" />
                <span className="text-lg font-bold">
                  {assignments.filter((assignment) => assignment.vehicleType === "barge").length}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Sà lan</p>
            </div>
          </div>

          <div className="space-y-3 py-2">
            {assignments.map((assignment) => (
              <div
                key={`${assignment.containerId}-${assignment.vehicleId}`}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Package className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-mono text-sm font-medium">{assignment.containerId}</p>
                    <p className="text-xs text-muted-foreground">{assignment.route}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-lg p-2 ${
                      assignment.vehicleType === "barge" ? "bg-primary/10" : "bg-warning/10"
                    }`}
                  >
                    {assignment.vehicleType === "barge" ? (
                      <Ship className="h-4 w-4 text-primary" />
                    ) : (
                      <Truck className="h-4 w-4 text-warning" />
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-medium">{assignment.vehicleCode}</p>
                    <p className="text-xs text-muted-foreground">{assignment.estimatedTime}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowResults(false)}>
              <Settings2 className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </Button>
            <Button onClick={() => setShowResults(false)}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Xác nhận tất cả
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}

function VehicleTable({ vehicles }: { vehicles: VehicleData[] }) {
  if (vehicles.length === 0) {
     return (
        <div className="p-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg mt-2">
           Không có phương tiện
        </div>
     )
  }

  return (
    <div className="max-h-[300px] overflow-y-auto rounded-lg border border-border mt-2">
      <Table>
        <TableHeader className="sticky top-0 bg-background">
          <TableRow className="bg-muted/50">
            <TableHead className="font-medium">Mã/Biển số</TableHead>
            <TableHead className="font-medium">Loại</TableHead>
            <TableHead className="font-medium">Người điều khiển</TableHead>
            <TableHead className="font-medium">Trạng thái</TableHead>
            <TableHead className="font-medium">Vị trí hiện tại</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((vehicle) => (
            <TableRow key={vehicle.id} className="hover:bg-muted/30">
              <TableCell className="font-mono text-sm font-medium">
                <div className="flex items-center gap-2">
                  {vehicle.type === "barge" ? (
                    <Ship className="h-4 w-4 text-primary" />
                  ) : (
                    <Truck className="h-4 w-4 text-warning" />
                  )}
                  {vehicle.code}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={vehicle.type === "barge" ? "text-primary" : "text-warning"}
                >
                  {vehicle.type === "barge" ? "Sà lan" : "Xe tải"}
                </Badge>
              </TableCell>
              <TableCell>{vehicle.driver}</TableCell>
              <TableCell>
                <Badge className={statusConfig[vehicle.status].className}>
                  {statusConfig[vehicle.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{vehicle.currentLocation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
