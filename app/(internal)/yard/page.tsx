"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
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
  Grid3X3,
  Package,
  MapPin,
  Move,
  Eye,
  Clock,
  RefreshCw,
  Maximize2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface YardBlock {
  id: string
  name: string
  type: "Import" | "Export" | "Empty" | "Reefer" | "DG" | "Hold" | "Inspection"
  capacity: number
  occupied: number
  rows: number
  bays: number
  tiers: number
}

interface YardContainer {
  id: string
  containerNo: string
  block: string
  row: number
  bay: number
  tier: number
  sizeType: string
  status: string
  customsStatus: string
  dwellDays: number
  tripId: string
}

const yardBlocks: YardBlock[] = [
  { id: "A-01", name: "A-01", type: "Import", capacity: 120, occupied: 102, rows: 6, bays: 10, tiers: 4 },
  { id: "A-02", name: "A-02", type: "Import", capacity: 120, occupied: 86, rows: 6, bays: 10, tiers: 4 },
  { id: "A-03", name: "A-03", type: "Import", capacity: 120, occupied: 114, rows: 6, bays: 10, tiers: 4 },
  { id: "B-01", name: "B-01", type: "Export", capacity: 100, occupied: 58, rows: 5, bays: 10, tiers: 4 },
  { id: "B-02", name: "B-02", type: "Export", capacity: 100, occupied: 67, rows: 5, bays: 10, tiers: 4 },
  { id: "C-01", name: "C-01", type: "Empty", capacity: 150, occupied: 65, rows: 6, bays: 12, tiers: 5 },
  { id: "C-02", name: "C-02", type: "Empty", capacity: 150, occupied: 47, rows: 6, bays: 12, tiers: 5 },
  { id: "D-01", name: "D-01", type: "Reefer", capacity: 50, occupied: 39, rows: 5, bays: 5, tiers: 2 },
  { id: "D-02", name: "D-02", type: "DG", capacity: 30, occupied: 14, rows: 3, bays: 5, tiers: 2 },
  { id: "H-01", name: "H-01", type: "Hold", capacity: 40, occupied: 25, rows: 4, bays: 5, tiers: 2 },
  { id: "I-01", name: "I-01", type: "Inspection", capacity: 20, occupied: 8, rows: 2, bays: 5, tiers: 2 },
]

const containersList: YardContainer[] = [
  { id: "1", containerNo: "MSKU1234567", block: "A-01", row: 3, bay: 2, tier: 2, sizeType: "40HC", status: "Yarded", customsStatus: "Cleared", dwellDays: 2, tripId: "BT-2024-0451" },
  { id: "2", containerNo: "TCLU8765432", block: "A-01", row: 3, bay: 3, tier: 1, sizeType: "20GP", status: "Yarded", customsStatus: "Pending", dwellDays: 1, tripId: "BT-2024-0451" },
  { id: "3", containerNo: "OOLU9876543", block: "H-01", row: 1, bay: 2, tier: 1, sizeType: "40GP", status: "Hold", customsStatus: "Hold", dwellDays: 5, tripId: "BT-2024-0448" },
  { id: "4", containerNo: "MSKU2345678", block: "A-02", row: 2, bay: 5, tier: 3, sizeType: "20GP", status: "Yarded", customsStatus: "Cleared", dwellDays: 3, tripId: "BT-2024-0449" },
  { id: "5", containerNo: "HLXU5678901", block: "A-02", row: 1, bay: 1, tier: 1, sizeType: "40HC", status: "Ready", customsStatus: "Cleared", dwellDays: 4, tripId: "BT-2024-0450" },
]

const getOccupancyColor = (percentage: number) => {
  if (percentage >= 90) return "bg-red-500/40 border-red-500/60 hover:bg-red-500/50"
  if (percentage >= 80) return "bg-orange-500/40 border-orange-500/60 hover:bg-orange-500/50"
  if (percentage >= 60) return "bg-yellow-500/40 border-yellow-500/60 hover:bg-yellow-500/50"
  return "bg-green-500/40 border-green-500/60 hover:bg-green-500/50"
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    Import: "text-blue-400",
    Export: "text-green-400",
    Empty: "text-slate-400",
    Reefer: "text-cyan-400",
    DG: "text-orange-400",
    Hold: "text-red-400",
    Inspection: "text-purple-400",
  }
  return colors[type] || "text-muted-foreground"
}

const typeLabels: Record<string, string> = {
  Import: "Nhập",
  Export: "Xuất",
  Empty: "Rỗng",
  Reefer: "Lạnh",
  DG: "HH",
  Hold: "Giữ",
  Inspection: "Kiểm tra",
}

export default function YardManagementPage() {
  const [selectedBlock, setSelectedBlock] = useState<YardBlock | null>(null)
  const [selectedContainer, setSelectedContainer] = useState<YardContainer | null>(null)
  const [showMoveDialog, setShowMoveDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const totalCapacity = yardBlocks.reduce((sum, b) => sum + b.capacity, 0)
  const totalOccupied = yardBlocks.reduce((sum, b) => sum + b.occupied, 0)
  const overallOccupancy = Math.round((totalOccupied / totalCapacity) * 100)

  // Generate grid cells for a block
  const generateBlockGrid = (block: YardBlock) => {
    const cells = []
    for (let row = 1; row <= block.rows; row++) {
      for (let bay = 1; bay <= block.bays; bay++) {
        const container = containersList.find(
          (c) => c.block === block.id && c.row === row && c.bay === bay
        )
        const isOccupied = container !== undefined
        cells.push({
          row,
          bay,
          occupied: isOccupied,
          container,
          tier: container?.tier || 0,
        })
      }
    }
    return cells
  }

  return (
    <DashboardLayout
      title="Quản Lý Bãi"
      description="Xem sơ đồ khu bãi và thao tác container"
    >
      {/* Summary Stats */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalOccupied}</div>
            <div className="text-xs text-muted-foreground">Tổng Container</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{overallOccupancy}%</div>
            <div className="text-xs text-muted-foreground">Tỷ Lệ Sử Dụng Bãi</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-400">{yardBlocks.filter(b => b.type === "Import").reduce((s, b) => s + b.occupied, 0)}</div>
            <div className="text-xs text-muted-foreground">Nhập</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-400">{yardBlocks.filter(b => b.type === "Export").reduce((s, b) => s + b.occupied, 0)}</div>
            <div className="text-xs text-muted-foreground">Xuất</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-400">{yardBlocks.filter(b => b.type === "Hold").reduce((s, b) => s + b.occupied, 0)}</div>
            <div className="text-xs text-muted-foreground">Đang Giữ</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-cyan-400">{yardBlocks.filter(b => b.type === "Reefer").reduce((s, b) => s + b.occupied, 0)}</div>
            <div className="text-xs text-muted-foreground">Container Lạnh</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm container..."
            className="pl-9 bg-secondary border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[150px] bg-secondary border-border">
            <SelectValue placeholder="Loại Khu" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất Cả Loại</SelectItem>
            <SelectItem value="import">Nhập</SelectItem>
            <SelectItem value="export">Xuất</SelectItem>
            <SelectItem value="empty">Rỗng</SelectItem>
            <SelectItem value="reefer">Lạnh</SelectItem>
            <SelectItem value="dg">Hàng Nguy Hiểm</SelectItem>
            <SelectItem value="hold">Giữ</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all-customs">
          <SelectTrigger className="w-[150px] bg-secondary border-border">
            <SelectValue placeholder="Hải Quan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-customs">Tất Cả Hải Quan</SelectItem>
            <SelectItem value="cleared">Đã Thông Quan</SelectItem>
            <SelectItem value="pending">Chờ Xử Lý</SelectItem>
            <SelectItem value="hold">Đang Giữ</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all-trips">
          <SelectTrigger className="w-[150px] bg-secondary border-border">
            <SelectValue placeholder="Chuyến" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-trips">Tất Cả Chuyến</SelectItem>
            <SelectItem value="bt-0451">BT-2024-0451</SelectItem>
            <SelectItem value="bt-0452">BT-2024-0452</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Làm Mới
          </Button>
          <Button size="sm" className="gap-2">
            <Move className="w-4 h-4" />
            Di Chuyển Container
          </Button>
        </div>
      </div>

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="bg-secondary mb-4">
          <TabsTrigger value="grid">Sơ Đồ Bãi</TabsTrigger>
          <TabsTrigger value="list">Danh Sách Container</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          {/* Yard Grid Visualization */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Grid3X3 className="w-4 h-4" />
                  Tổng Quan Khu Bãi
                </CardTitle>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-green-500/40 border border-green-500/60" />
                    <span>{"<60%"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-yellow-500/40 border border-yellow-500/60" />
                    <span>60-80%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-orange-500/40 border border-orange-500/60" />
                    <span>80-90%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-red-500/40 border border-red-500/60" />
                    <span>{">90%"}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Yard Layout */}
              <div className="grid grid-cols-6 gap-4">
                {/* Import Blocks */}
                <div className="col-span-3 space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Khu Nhập</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {yardBlocks.filter(b => b.type === "Import").map((block) => {
                      const percentage = Math.round((block.occupied / block.capacity) * 100)
                      return (
                        <div
                          key={block.id}
                          className={cn(
                            "p-4 rounded-lg border-2 cursor-pointer transition-all",
                            getOccupancyColor(percentage)
                          )}
                          onClick={() => setSelectedBlock(block)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">{block.name}</span>
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className={cn("text-xs font-medium", getTypeColor(block.type))}>{block.type}</div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{block.occupied}/{block.capacity}</span>
                              <span className="font-bold">{percentage}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                              <div
                                className="h-1.5 rounded-full bg-current"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Export Blocks */}
                <div className="col-span-2 space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Khu Xuất</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {yardBlocks.filter(b => b.type === "Export").map((block) => {
                      const percentage = Math.round((block.occupied / block.capacity) * 100)
                      return (
                        <div
                          key={block.id}
                          className={cn(
                            "p-4 rounded-lg border-2 cursor-pointer transition-all",
                            getOccupancyColor(percentage)
                          )}
                          onClick={() => setSelectedBlock(block)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">{block.name}</span>
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className={cn("text-xs font-medium", getTypeColor(block.type))}>{block.type}</div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{block.occupied}/{block.capacity}</span>
                              <span className="font-bold">{percentage}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                              <div
                                className="h-1.5 rounded-full bg-current"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Special Blocks */}
                <div className="col-span-1 space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Khu Đặc Biệt</h4>
                  <div className="space-y-3">
                    {yardBlocks.filter(b => ["Reefer", "DG", "Hold", "Inspection"].includes(b.type)).map((block) => {
                      const percentage = Math.round((block.occupied / block.capacity) * 100)
                      return (
                        <div
                          key={block.id}
                          className={cn(
                            "p-3 rounded-lg border-2 cursor-pointer transition-all",
                            getOccupancyColor(percentage)
                          )}
                          onClick={() => setSelectedBlock(block)}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{block.name}</span>
                            <span className="text-sm font-bold">{percentage}%</span>
                          </div>
                          <div className={cn("text-xs font-medium", getTypeColor(block.type))}>{block.type}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Empty Blocks */}
                <div className="col-span-6 space-y-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Khu Container Rỗng</h4>
                  <div className="grid grid-cols-6 gap-3">
                    {yardBlocks.filter(b => b.type === "Empty").map((block) => {
                      const percentage = Math.round((block.occupied / block.capacity) * 100)
                      return (
                        <div
                          key={block.id}
                          className={cn(
                            "p-4 rounded-lg border-2 cursor-pointer transition-all",
                            getOccupancyColor(percentage)
                          )}
                          onClick={() => setSelectedBlock(block)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-lg">{block.name}</span>
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div className={cn("text-xs font-medium", getTypeColor(block.type))}>{block.type}</div>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>{block.occupied}/{block.capacity}</span>
                              <span className="font-bold">{percentage}%</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Số Container</th>
                    <th>Vị Trí</th>
                    <th>Kích Thước/Loại</th>
                    <th>Trạng Thái</th>
                    <th>Hải Quan</th>
                    <th>Ngày Lưu Kho</th>
                    <th>Chuyến</th>
                    <th>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {containersList.map((container) => (
                    <tr key={container.id} className="cursor-pointer" onClick={() => setSelectedContainer(container)}>
                      <td className="font-mono font-medium text-primary">{container.containerNo}</td>
                      <td className="font-mono">{container.block}-{String(container.row).padStart(2, "0")}-{String(container.bay).padStart(2, "0")}-{container.tier}</td>
                      <td>{container.sizeType}</td>
                      <td>
                        <StatusBadge status={container.status === "Hold" ? "hold" : container.status === "Ready" ? "success" : "yarded"}>
                          {container.status}
                        </StatusBadge>
                      </td>
                      <td>
                        <StatusBadge status={container.customsStatus === "Cleared" ? "cleared" : container.customsStatus === "Hold" ? "hold" : "pending"}>
                          {container.customsStatus}
                        </StatusBadge>
                      </td>
                      <td>
                        <span className={cn(container.dwellDays > 4 ? "text-yellow-400" : "")}>
                          {container.dwellDays} ngày
                        </span>
                      </td>
                      <td>{container.tripId}</td>
                      <td>
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setShowMoveDialog(true) }}>
                          <Move className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Block Detail Dialog */}
      <Dialog open={!!selectedBlock} onOpenChange={() => setSelectedBlock(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              Khu {selectedBlock?.name} - {typeLabels[selectedBlock?.type || "Import"]}
            </DialogTitle>
            <DialogDescription>
              Xem sơ đồ khu bãi và vị trí container
            </DialogDescription>
          </DialogHeader>
          {selectedBlock && (
            <div className="py-4">
              <div className="flex items-center gap-6 mb-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Sức Chứa:</span>{" "}
                  <span className="font-medium">{selectedBlock.capacity} TEU</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Đã Sử Dụng:</span>{" "}
                  <span className="font-medium">{selectedBlock.occupied} TEU</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Còn Trống:</span>{" "}
                  <span className="font-medium text-green-400">{selectedBlock.capacity - selectedBlock.occupied} TEU</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Kích Thước:</span>{" "}
                  <span className="font-medium">{selectedBlock.rows}H x {selectedBlock.bays}V x {selectedBlock.tiers}T</span>
                </div>
              </div>

              {/* Grid Visualization */}
              <div className="bg-secondary/30 rounded-lg p-4 overflow-x-auto">
                <div className="flex gap-1 mb-2">
                  <div className="w-8" />
                  {Array.from({ length: selectedBlock.bays }, (_, i) => (
                    <div key={i} className="w-10 text-center text-xs text-muted-foreground">
                      B{i + 1}
                    </div>
                  ))}
                </div>
                {Array.from({ length: selectedBlock.rows }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex gap-1 mb-1">
                    <div className="w-8 text-xs text-muted-foreground flex items-center">R{rowIndex + 1}</div>
                    {Array.from({ length: selectedBlock.bays }, (_, bayIndex) => {
                      const container = containersList.find(
                        c => c.block === selectedBlock.id && c.row === rowIndex + 1 && c.bay === bayIndex + 1
                      )
                      return (
                        <div
                          key={bayIndex}
                          className={cn(
                            "w-10 h-8 rounded border flex items-center justify-center text-[10px] cursor-pointer transition-all",
                            container
                              ? "bg-primary/30 border-primary/50 hover:bg-primary/40"
                              : "bg-secondary/50 border-border/50 hover:bg-secondary"
                          )}
                          title={container ? `${container.containerNo} (Tầng ${container.tier})` : "Trống"}
                          onClick={() => container && setSelectedContainer(container)}
                        >
                          {container && container.tier}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded bg-primary/30 border border-primary/50" />
                  <span>Đã sử dụng (số = tầng)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded bg-secondary/50 border border-border/50" />
                  <span>Còn trống</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBlock(null)}>
              Đóng
            </Button>
            <Button className="gap-2">
              <Maximize2 className="w-4 h-4" />
              Xem Toàn Bộ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Container Detail Dialog */}
      <Dialog open={!!selectedContainer && !selectedBlock} onOpenChange={() => setSelectedContainer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {selectedContainer?.containerNo}
            </DialogTitle>
            <DialogDescription>Thông tin container trong bãi</DialogDescription>
          </DialogHeader>
          {selectedContainer && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/30 rounded-lg p-3">
                  <label className="text-xs text-muted-foreground">Vị Trí Hiện Tại</label>
                  <p className="font-mono font-bold text-lg text-primary mt-1">
                    {selectedContainer.block}-{String(selectedContainer.row).padStart(2, "0")}-{String(selectedContainer.bay).padStart(2, "0")}-{selectedContainer.tier}
                  </p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <label className="text-xs text-muted-foreground">Thời Gian Lưu Kho</label>
                  <p className={cn("font-bold text-lg mt-1", selectedContainer.dwellDays > 4 ? "text-yellow-400" : "text-foreground")}>
                    {selectedContainer.dwellDays} ngày
                  </p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <label className="text-xs text-muted-foreground">Kích Thước/Loại</label>
                  <p className="font-medium mt-1">{selectedContainer.sizeType}</p>
                </div>
                <div className="bg-secondary/30 rounded-lg p-3">
                  <label className="text-xs text-muted-foreground">Mã Chuyến</label>
                  <p className="font-medium mt-1">{selectedContainer.tripId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedContainer.status === "Hold" ? "hold" : selectedContainer.status === "Ready" ? "success" : "yarded"} size="md">
                  {selectedContainer.status}
                </StatusBadge>
                <StatusBadge status={selectedContainer.customsStatus === "Cleared" ? "cleared" : selectedContainer.customsStatus === "Hold" ? "hold" : "pending"} size="md">
                  Hải Quan: {selectedContainer.customsStatus}
                </StatusBadge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedContainer(null)}>
              Đóng
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => { setShowMoveDialog(true); setSelectedContainer(null) }}>
              <Move className="w-4 h-4" />
              Di Chuyển
            </Button>
            <Button>Xem Chi Tiết</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Container Dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Di Chuyển Container</DialogTitle>
            <DialogDescription>Phân bổ lại container đến vị trí mới trong bãi</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-xs text-muted-foreground">Container</label>
              <Input placeholder="MSKU1234567" className="mt-1" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-muted-foreground">Khu Đích</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Khu" />
                  </SelectTrigger>
                  <SelectContent>
                    {yardBlocks.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Hàng</label>
                <Input placeholder="01" className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Vịnh</label>
                <Input placeholder="01" className="mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Tầng</label>
                <Input placeholder="1" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Lý Do</label>
              <Input placeholder="Lý do di chuyển (không bắt buộc)" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
              Hủy
            </Button>
            <Button>Xác Nhận Di Chuyển</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
