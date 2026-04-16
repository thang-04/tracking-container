"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Plus,
  Ship,
  Calendar,
  Clock,
  MapPin,
  Package,
  ChevronRight,
  Edit,
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface BargeTrip {
  id: string
  tripId: string
  bargeName: string
  operator: string
  route: string
  sourceSeaport: string
  destination: string
  capacity: number
  assignedContainers: number
  eta: string
  etd: string
  actualArrival: string | null
  status: "planned" | "inbound" | "arrived" | "discharging" | "completed" | "delayed"
  notes: string
}

const statusLabels: Record<string, string> = {
  planned: "Đã lên kế hoạch",
  inbound: "Đang đến",
  arrived: "Đã đến",
  discharging: "Đang dỡ hàng",
  completed: "Hoàn thành",
  delayed: "Trễ",
}

const tripsData: BargeTrip[] = [
  {
    id: "1",
    tripId: "BT-2024-0451",
    bargeName: "MV Delta Star",
    operator: "Công ty Vận tải Delta",
    route: "Cảng TP.HCM - ICD Bình Dương",
    sourceSeaport: "Cảng TP.HCM",
    destination: "ICD Bình Dương",
    capacity: 80,
    assignedContainers: 45,
    eta: "2024-01-15 10:30",
    etd: "2024-01-15 06:00",
    actualArrival: "2024-01-15 10:25",
    status: "discharging",
    notes: "Hoạt động bình thường",
  },
  {
    id: "2",
    tripId: "BT-2024-0452",
    bargeName: "MV River Queen",
    operator: "Vận tải Mekong",
    route: "Cảng Cát Lái - Cảng cạn Long An",
    sourceSeaport: "Cảng Cát Lái",
    destination: "Cảng cạn Long An",
    capacity: 100,
    assignedContainers: 62,
    eta: "2024-01-15 14:00",
    etd: "2024-01-15 09:30",
    actualArrival: null,
    status: "inbound",
    notes: "Đúng lịch trình",
  },
  {
    id: "3",
    tripId: "BT-2024-0453",
    bargeName: "MV Saigon Express",
    operator: "Đường thủy Sài Gòn",
    route: "Cảng TP.HCM - ICD Bình Dương",
    sourceSeaport: "Cảng TP.HCM",
    destination: "ICD Bình Dương",
    capacity: 60,
    assignedContainers: 38,
    eta: "2024-01-15 16:45",
    etd: "2024-01-15 12:00",
    actualArrival: null,
    status: "planned",
    notes: "Chờ khởi hành",
  },
  {
    id: "4",
    tripId: "BT-2024-0454",
    bargeName: "MV Mekong Spirit",
    operator: "Vận tải Mekong",
    route: "Cảng Cát Lái - Cảng cạn Long An",
    sourceSeaport: "Cảng Cát Lái",
    destination: "Cảng cạn Long An",
    capacity: 90,
    assignedContainers: 51,
    eta: "2024-01-15 18:30",
    etd: "2024-01-15 13:00",
    actualArrival: null,
    status: "delayed",
    notes: "Chậm do thời tiết - ETA đã điều chỉnh",
  },
  {
    id: "5",
    tripId: "BT-2024-0450",
    bargeName: "MV Coastal Star",
    operator: "Công ty Vận tải Delta",
    route: "Cảng TP.HCM - ICD Bình Dương",
    sourceSeaport: "Cảng TP.HCM",
    destination: "ICD Bình Dương",
    capacity: 80,
    assignedContainers: 78,
    eta: "2024-01-15 08:00",
    etd: "2024-01-15 03:30",
    actualArrival: "2024-01-15 07:55",
    status: "completed",
    notes: "Đã dỡ hết container",
  },
]

const scheduleBlocks = [
  { time: "06:00", trips: [{ id: "BT-0451", name: "MV Delta Star", status: "departed" }] },
  { time: "08:00", trips: [{ id: "BT-0450", name: "MV Coastal Star", status: "arrived" }] },
  { time: "10:00", trips: [{ id: "BT-0451", name: "MV Delta Star", status: "arrived" }] },
  { time: "12:00", trips: [{ id: "BT-0453", name: "MV Saigon Express", status: "departure" }] },
  { time: "14:00", trips: [{ id: "BT-0452", name: "MV River Queen", status: "expected" }] },
  { time: "16:00", trips: [{ id: "BT-0453", name: "MV Saigon Express", status: "expected" }] },
  { time: "18:00", trips: [{ id: "BT-0454", name: "MV Mekong Spirit", status: "delayed" }] },
]

const scheduleStatusLabels: Record<string, string> = {
  departed: "Đã khởi hành",
  arrived: "Đã đến",
  departure: "Sắp khởi hành",
  expected: "Dự kiến",
  delayed: "Trễ",
}

export default function TransportPage() {
  const [selectedTrip, setSelectedTrip] = useState<BargeTrip | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const columns = [
    {
      key: "tripId",
      header: "Mã Chuyến",
      cell: (row: BargeTrip) => (
        <span className="font-mono text-sm font-medium text-primary">{row.tripId}</span>
      ),
    },
    {
      key: "bargeName",
      header: "Sà Lan",
      cell: (row: BargeTrip) => (
        <div className="flex items-center gap-2">
          <Ship className="w-4 h-4 text-muted-foreground" />
          <span>{row.bargeName}</span>
        </div>
      ),
    },
    { key: "operator", header: "Đơn vị vận hành" },
    { key: "route", header: "Tuyến đường" },
    {
      key: "containers",
      header: "Container",
      cell: (row: BargeTrip) => (
        <div className="flex items-center gap-1">
          <Package className="w-3.5 h-3.5 text-muted-foreground" />
          <span>
            {row.assignedContainers}/{row.capacity}
          </span>
        </div>
      ),
    },
    {
      key: "eta",
      header: "ETA",
      cell: (row: BargeTrip) => (
        <div className="flex items-center gap-1 text-sm">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          {row.eta.split(" ")[1]}
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (row: BargeTrip) => (
        <StatusBadge status={row.status}>
          {statusLabels[row.status]}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "",
      cell: (row: BargeTrip) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSelectedTrip(row)}>Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem>Chỉnh sửa chuyến</DropdownMenuItem>
            <DropdownMenuItem>Phân bổ container</DropdownMenuItem>
            <DropdownMenuItem>Cập nhật ETA</DropdownMenuItem>
            <DropdownMenuItem>Đóng chuyến</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <DashboardLayout
      title="Quản Lý Chuyến Sà Lan"
      description="Lên lịch chuyến sà lan mới từ cảng biển đến cảng cạn, kiểm tra hành trình"
    >
      <Tabs defaultValue="list" className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="list">Danh sách chuyến</TabsTrigger>
            <TabsTrigger value="schedule">Lịch trình</TabsTrigger>
          </TabsList>
          <Button className="gap-2" onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4" />
            Tạo chuyến mới
          </Button>
        </div>

        <TabsContent value="list">
          {/* Bộ lọc */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm chuyến..." className="pl-9 bg-secondary border-border" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] bg-secondary border-border">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="planned">Đã lên kế hoạch</SelectItem>
                <SelectItem value="inbound">Đang đến</SelectItem>
                <SelectItem value="arrived">Đã đến</SelectItem>
                <SelectItem value="discharging">Đang dỡ hàng</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="delayed">Trễ</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-seaport">
              <SelectTrigger className="w-[180px] bg-secondary border-border">
                <SelectValue placeholder="Cảng biển" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-seaport">Tất cả cảng</SelectItem>
                <SelectItem value="hcmc">Cảng TP.HCM</SelectItem>
                <SelectItem value="catlai">Cảng Cát Lái</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-operator">
              <SelectTrigger className="w-[180px] bg-secondary border-border">
                <SelectValue placeholder="Đơn vị vận hành" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-operator">Tất cả</SelectItem>
                <SelectItem value="delta">Công ty Vận tải Delta</SelectItem>
                <SelectItem value="mekong">Vận tải Mekong</SelectItem>
                <SelectItem value="saigon">Đường thủy Sài Gòn</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          <DataTable columns={columns} data={tripsData} onRowClick={(row) => setSelectedTrip(row)} />
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Lịch trình hôm nay - 15/01/2024
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Ngày trước
                  </Button>
                  <Button variant="outline" size="sm">
                    Ngày sau
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="space-y-4">
                  {scheduleBlocks.map((block, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-16 text-sm font-medium text-muted-foreground pt-2">
                        {block.time}
                      </div>
                      <div className="flex-1 border-l-2 border-border pl-4 py-2">
                        {block.trips.map((trip, tripIndex) => (
                          <div
                            key={tripIndex}
                            className={`flex items-center gap-4 p-3 rounded-lg mb-2 last:mb-0 ${
                              trip.status === "arrived" || trip.status === "departed"
                                ? "bg-green-500/10 border border-green-500/30"
                                : trip.status === "delayed"
                                ? "bg-red-500/10 border border-red-500/30"
                                : trip.status === "expected" || trip.status === "departure"
                                ? "bg-blue-500/10 border border-blue-500/30"
                                : "bg-secondary/30 border border-border/50"
                            }`}
                          >
                            <Ship className="w-5 h-5 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{trip.name}</span>
                                <span className="text-xs text-muted-foreground">({trip.id})</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {scheduleStatusLabels[trip.status]}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog chi tiết chuyến */}
      <Dialog open={!!selectedTrip} onOpenChange={() => setSelectedTrip(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ship className="w-5 h-5" />
              Chi tiết chuyến - {selectedTrip?.tripId}
            </DialogTitle>
            <DialogDescription>
              Xem và quản lý thông tin chuyến sà lan
            </DialogDescription>
          </DialogHeader>
          {selectedTrip && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <StatusBadge status={selectedTrip.status} size="md">
                  {statusLabels[selectedTrip.status]}
                </StatusBadge>
                <span className="text-sm text-muted-foreground">{selectedTrip.notes}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-secondary/30 rounded-lg p-4">
                  <label className="text-xs text-muted-foreground">Tên sà lan</label>
                  <p className="font-medium mt-1">{selectedTrip.bargeName}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <label className="text-xs text-muted-foreground">Đơn vị vận hành</label>
                  <p className="font-medium mt-1">{selectedTrip.operator}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <label className="text-xs text-muted-foreground">Sức chứa</label>
                  <p className="font-medium mt-1">
                    {selectedTrip.assignedContainers} / {selectedTrip.capacity} TEU
                  </p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <label className="text-xs text-muted-foreground">Điểm xuất phát</label>
                  <p className="font-medium mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedTrip.sourceSeaport}
                  </p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <label className="text-xs text-muted-foreground">Điểm đến</label>
                  <p className="font-medium mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedTrip.destination}
                  </p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <label className="text-xs text-muted-foreground">Tuyến đường</label>
                  <p className="font-medium mt-1">{selectedTrip.route}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <label className="text-xs text-muted-foreground">ETD</label>
                  <p className="font-medium mt-1">{selectedTrip.etd}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <label className="text-xs text-muted-foreground">ETA</label>
                  <p className="font-medium mt-1">{selectedTrip.eta}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-4">
                  <label className="text-xs text-muted-foreground">Thời gian đến thực tế</label>
                  <p className="font-medium mt-1">{selectedTrip.actualArrival || "—"}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTrip(null)}>
              Đóng
            </Button>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              Chỉnh sửa
            </Button>
            <Button>Phân bổ container</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog tạo chuyến mới */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo Chuyến Sà Lan Mới</DialogTitle>
            <DialogDescription>
              Lên lịch chuyến sà lan mới từ cảng biển đến cảng cạn
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <label className="text-xs text-muted-foreground">Mã chuyến</label>
              <Input placeholder="Tự động tạo" className="mt-1" disabled />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Sà lan</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn sà lan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delta">MV Delta Star</SelectItem>
                  <SelectItem value="river">MV River Queen</SelectItem>
                  <SelectItem value="saigon">MV Saigon Express</SelectItem>
                  <SelectItem value="mekong">MV Mekong Spirit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Cảng biển xuất phát</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn cảng biển" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hcmc">Cảng TP.HCM</SelectItem>
                  <SelectItem value="catlai">Cảng Cát Lái</SelectItem>
                  <SelectItem value="haiphong">Cảng Hải Phòng</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Cảng cạn đích đến</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn cảng cạn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="binhduong">ICD Bình Dương</SelectItem>
                  <SelectItem value="longan">Cảng cạn Long An</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">ETD (Thời gian khởi hành dự kiến)</label>
              <Input type="datetime-local" className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">ETA (Thời gian đến dự kiến)</label>
              <Input type="datetime-local" className="mt-1" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-muted-foreground">Ghi chú</label>
              <Input placeholder="Ghi chú (tùy chọn)" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Hủy
            </Button>
            <Button>Tạo chuyến</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
