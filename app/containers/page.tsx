"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Search, Plus, Filter, Download, MapPin, Clock, Upload, CheckCircle2, RefreshCw } from "lucide-react"

type ContainerStatus = "at-port" | "in-transit" | "at-dry-port" | "delivered"

interface Container {
  id: string
  containerId: string
  type: string
  status: ContainerStatus
  location: string
  destination: string
  eta: string
  weight: string
}

const initialContainersData: Container[] = [
  {
    id: "1",
    containerId: "MSKU-2847561",
    type: "40ft HC",
    status: "at-port",
    location: "Cảng Hải Phòng",
    destination: "Cảng cạn Hà Nội",
    eta: "2024-03-20 14:00",
    weight: "24.500 kg",
  },
  {
    id: "2",
    containerId: "TCLU-9876543",
    type: "20ft",
    status: "in-transit",
    location: "Tuyến HP-HN",
    destination: "Cảng cạn Hà Nội",
    eta: "2024-03-20 16:30",
    weight: "18.200 kg",
  },
  {
    id: "3",
    containerId: "CSQU-1234567",
    type: "40ft",
    status: "at-dry-port",
    location: "Cảng cạn Hà Nội",
    destination: "Khách hàng cuối",
    eta: "2024-03-21 09:00",
    weight: "22.800 kg",
  },
  {
    id: "4",
    containerId: "HLXU-5678901",
    type: "40ft HC",
    status: "in-transit",
    location: "Tuyến ĐN-HCM",
    destination: "Cảng cạn TP.HCM",
    eta: "2024-03-20 20:00",
    weight: "25.100 kg",
  },
  {
    id: "5",
    containerId: "TEMU-3456789",
    type: "20ft",
    status: "at-port",
    location: "Cảng Đà Nẵng",
    destination: "Cảng cạn TP.HCM",
    eta: "2024-03-22 10:00",
    weight: "19.500 kg",
  },
  {
    id: "6",
    containerId: "APZU-7654321",
    type: "40ft",
    status: "delivered",
    location: "Cảng cạn TP.HCM",
    destination: "Khách hàng cuối",
    eta: "2024-03-19 08:00",
    weight: "23.700 kg",
  },
  {
    id: "7",
    containerId: "OOCL-1111111",
    type: "20ft HC",
    status: "in-transit",
    location: "Tuyến DN-HN",
    destination: "Cảng cạn Hà Nội",
    eta: "2024-03-21 12:00",
    weight: "20.100 kg",
  },
  {
    id: "8",
    containerId: "MAEU-2222222",
    type: "40ft HC",
    status: "at-port",
    location: "Cảng Hải Phòng",
    destination: "Cảng cạn Hà Nội",
    eta: "2024-03-20 15:00",
    weight: "26.200 kg",
  },
]

export default function ContainersPage() {
  const [containers, setContainers] = useState(initialContainersData)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEdiDialogOpen, setIsEdiDialogOpen] = useState(false)
  const [ediFile, setEdiFile] = useState<File | null>(null)
  const [ediPreview, setEdiPreview] = useState<any[]>([])
  const [isProcessingEdi, setIsProcessingEdi] = useState(false)

  const filteredContainers = containers.filter((container) => {
    const matchesSearch =
      container.containerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || container.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    total: containers.length,
    atPort: containers.filter((c) => c.status === "at-port").length,
    inTransit: containers.filter((c) => c.status === "in-transit").length,
    atDryPort: containers.filter((c) => c.status === "at-dry-port").length,
  }

  const handleEdiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEdiFile(file)
      // Simulate EDI file parsing
      const simulatedEdiData = [
        {
          containerId: "EDIU-1111111",
          type: "40ft",
          weight: "26.500 kg",
          destination: "Cảng cạn Hà Nội",
        },
        {
          containerId: "EDIU-2222222",
          type: "20ft",
          weight: "19.300 kg",
          destination: "Cảng cạn TP.HCM",
        },
        {
          containerId: "EDIU-3333333",
          type: "40ft HC",
          weight: "25.800 kg",
          destination: "Cảng cạn Hà Nội",
        },
      ]
      setEdiPreview(simulatedEdiData)
    }
  }

  const handleImportEdi = () => {
    setIsProcessingEdi(true)
    setTimeout(() => {
      const newContainers = ediPreview.map((item, index) => ({
        id: (containers.length + index + 1).toString(),
        containerId: item.containerId,
        type: item.type,
        status: "at-port" as ContainerStatus,
        location: "Cảng Hải Phòng",
        destination: item.destination,
        eta: "2024-03-22 10:00",
        weight: item.weight,
      }))
      setContainers([...containers, ...newContainers])
      setEdiPreview([])
      setEdiFile(null)
      setIsEdiDialogOpen(false)
      setIsProcessingEdi(false)
    }, 1500)
  }

  const handleCancelEdi = () => {
    setEdiFile(null)
    setEdiPreview([])
    setIsEdiDialogOpen(false)
  }

  const getStatusColor = (status: ContainerStatus) => {
    switch (status) {
      case "at-port":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-400"
      case "in-transit":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400"
      case "at-dry-port":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-400"
      case "delivered":
        return "bg-green-500/20 text-green-700 dark:text-green-400"
      default:
        return "bg-gray-500/20 text-gray-700"
    }
  }

  const getStatusLabel = (status: ContainerStatus) => {
    switch (status) {
      case "at-port":
        return "Tại cảng"
      case "in-transit":
        return "Đang vận chuyển"
      case "at-dry-port":
        return "Tại cảng cạn"
      case "delivered":
        return "Đã giao"
      default:
        return status
    }
  }

  return (
    <DashboardLayout
      title="Quản lý Container"
      description="Theo dõi và quản lý tất cả container"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Container</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Trong hệ thống</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tại Cảng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statusCounts.atPort}</div>
              <p className="text-xs text-muted-foreground mt-1">Chờ xử lý</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Đang Vận Chuyển</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statusCounts.inTransit}</div>
              <p className="text-xs text-muted-foreground mt-1">Đang di chuyển</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tại Cảng Cạn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{statusCounts.atDryPort}</div>
              <p className="text-xs text-muted-foreground mt-1">Chờ nhận</p>
            </CardContent>
          </Card>
        </div>

        {/* Container List */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="text-base font-medium">Danh sách Container</CardTitle>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm container..."
                    className="w-full bg-secondary pl-9 md:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Lọc trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="at-port">Tại cảng</SelectItem>
                    <SelectItem value="in-transit">Đang vận chuyển</SelectItem>
                    <SelectItem value="at-dry-port">Tại cảng cạn</SelectItem>
                    <SelectItem value="delivered">Đã giao</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Thêm Container
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm Container mới</DialogTitle>
                      <DialogDescription>Nhập thông tin container mới vào hệ thống</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="container-id" className="text-sm font-medium">
                          Mã Container
                        </label>
                        <Input id="container-id" placeholder="VD: MSKU-2847561" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="container-type" className="text-sm font-medium">
                          Loại
                        </label>
                        <Select>
                          <SelectTrigger id="container-type">
                            <SelectValue placeholder="Chọn loại" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="20ft">20ft</SelectItem>
                            <SelectItem value="40ft">40ft</SelectItem>
                            <SelectItem value="20ft-hc">20ft HC</SelectItem>
                            <SelectItem value="40ft-hc">40ft HC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="destination" className="text-sm font-medium">
                          Điểm Đến
                        </label>
                        <Input id="destination" placeholder="VD: Cảng cạn Hà Nội" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Hủy
                      </Button>
                      <Button onClick={() => setIsDialogOpen(false)}>Thêm</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEdiDialogOpen} onOpenChange={setIsEdiDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Import EDI
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                      <DialogTitle>Import EDI File</DialogTitle>
                      <DialogDescription>
                        Upload file EDI để nhập dữ liệu container từ hệ thống quốc tế
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto space-y-4">
                      {/* File Upload Area */}
                      {!ediFile || (ediFile && ediPreview.length === 0) ? (
                        <label className="rounded-lg border-2 border-dashed border-border p-8 text-center cursor-pointer hover:bg-muted/50 transition block">
                          <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                          <p className="text-sm font-medium text-foreground">Kéo thả hoặc click để chọn file EDI</p>
                          <p className="text-xs text-muted-foreground mt-1">Hỗ trợ .edi, .txt</p>
                          <input
                            type="file"
                            onChange={handleEdiFileChange}
                            accept=".edi,.txt"
                            className="hidden"
                          />
                        </label>
                      ) : null}

                      {/* Preview Table */}
                      {ediPreview.length > 0 && (
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium mb-3">Xem trước dữ liệu ({ediPreview.length} container)</h4>
                            <div className="rounded-lg border border-border overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="bg-muted/50">
                                    <TableHead className="font-medium">Mã Container</TableHead>
                                    <TableHead className="font-medium">Loại</TableHead>
                                    <TableHead className="font-medium">Trọng lượng</TableHead>
                                    <TableHead className="font-medium">Điểm đến</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {ediPreview.map((item, idx) => (
                                    <TableRow key={idx} className="hover:bg-muted/30">
                                      <TableCell className="font-mono text-sm font-medium">{item.containerId}</TableCell>
                                      <TableCell>{item.type}</TableCell>
                                      <TableCell>{item.weight}</TableCell>
                                      <TableCell>{item.destination}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Always visible at bottom */}
                    {ediPreview.length > 0 && (
                      <div className="flex gap-3 pt-4 border-t border-border">
                        <Button variant="outline" onClick={handleCancelEdi}>
                          Hủy
                        </Button>
                        <Button onClick={handleImportEdi} disabled={isProcessingEdi} className="ml-auto">
                          {isProcessingEdi ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Đang import...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Import {ediPreview.length} container
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-medium">Mã Container</TableHead>
                    <TableHead className="font-medium">Loại</TableHead>
                    <TableHead className="font-medium">Trạng Thái</TableHead>
                    <TableHead className="font-medium">Vị Trí</TableHead>
                    <TableHead className="font-medium">Điểm Đến</TableHead>
                    <TableHead className="font-medium">ETA</TableHead>
                    <TableHead className="font-medium">Trọng Lượng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContainers.length > 0 ? (
                    filteredContainers.map((container) => (
                      <TableRow key={container.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono font-medium">{container.containerId}</TableCell>
                        <TableCell>{container.type}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(container.status)}>
                            {getStatusLabel(container.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {container.location}
                          </div>
                        </TableCell>
                        <TableCell>{container.destination}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {container.eta}
                          </div>
                        </TableCell>
                        <TableCell>{container.weight}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Không tìm thấy container phù hợp
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Hiển thị {filteredContainers.length} trong {containers.length} container
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
