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
import type { ContainerListItem } from "@/lib/containers/get-all-containers"
import type { ShippingLineRecord } from "@/lib/master-data/get-shipping-lines"
import type { ContainerTypeRecord } from "@/lib/master-data/get-container-types"
import type { YardInfo } from "@/lib/master-data/get-yards"

interface ContainersClientProps {
  initialContainers: ContainerListItem[]
  shippingLines: ShippingLineRecord[]
  containerTypes: ContainerTypeRecord[]
  ports: any[]
  yards: YardInfo[]
}

export function ContainersClient({ 
  initialContainers, 
  shippingLines, 
  containerTypes, 
  ports, 
  yards 
}: ContainersClientProps) {
  const [containers, setContainers] = useState(initialContainers)
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

  const getCategory = (status: string) => {
    if (['at_seaport_yard'].includes(status)) return 'at-port'
    if (['in_transit', 'on_barge'].includes(status)) return 'in-transit'
    if (['at_dryport_yard'].includes(status)) return 'at-dry-port'
    if (['released'].includes(status)) return 'delivered'
    return 'other'
  }

  const statusCounts = {
    total: containers.length,
    atPort: containers.filter((c) => getCategory(c.status) === "at-port").length,
    inTransit: containers.filter((c) => getCategory(c.status) === "in-transit").length,
    atDryPort: containers.filter((c) => getCategory(c.status) === "at-dry-port").length,
  }

  const handleEdiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setEdiFile(file)
      // Simulate EDI file parsing using real ports if possible
      const simulatedEdiData = [
        {
          containerId: "EDIU-1111111",
          type: containerTypes[0]?.name || "40ft",
          weight: "26.500 kg",
          destination: ports.find(p => p.portType === 'dryport')?.name || "Cảng cạn Hà Nội",
        },
        {
          containerId: "EDIU-2222222",
          type: containerTypes[1]?.name || "20ft",
          weight: "19.300 kg",
          destination: ports.find(p => p.portType === 'dryport')?.name || "Cảng cạn TP.HCM",
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
        status: "new",
        location: "Cổng chờ",
        destination: item.destination,
        eta: "Chưa có",
        weight: item.weight,
      }))
      setContainers([...newContainers, ...containers])
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

  const getStatusColor = (status: string) => {
    const category = getCategory(status)
    switch (category) {
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'Mới'
      case 'at_seaport_yard': return 'Tại cảng biển'
      case 'on_barge': return 'Trên sà lan'
      case 'in_transit': return 'Đang vận chuyển'
      case 'at_dryport_yard': return 'Tại cảng cạn'
      case 'released': return 'Đã giao'
      case 'hold': return 'Đang giữ'
      default: return status
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
                    <SelectItem value="new">Mới</SelectItem>
                    <SelectItem value="at_seaport_yard">Tại cảng biển</SelectItem>
                    <SelectItem value="on_barge">Trên sà lan</SelectItem>
                    <SelectItem value="in_transit">Đang vận chuyển</SelectItem>
                    <SelectItem value="at_dryport_yard">Tại cảng cạn</SelectItem>
                    <SelectItem value="released">Đã giao</SelectItem>
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
                  <DialogContent className="max-w-md">
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
                          Loại Container
                        </label>
                        <Select>
                          <SelectTrigger id="container-type">
                            <SelectValue placeholder="Chọn loại" />
                          </SelectTrigger>
                          <SelectContent>
                            {containerTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                            ))}
                            {containerTypes.length === 0 && <SelectItem value="none" disabled>Không có dữ liệu</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="shipping-line" className="text-sm font-medium">
                          Hãng tàu
                        </label>
                        <Select>
                          <SelectTrigger id="shipping-line">
                            <SelectValue placeholder="Chọn hãng tàu" />
                          </SelectTrigger>
                          <SelectContent>
                            {shippingLines.map(line => (
                              <SelectItem key={line.id} value={line.id}>{line.name} ({line.code})</SelectItem>
                            ))}
                            {shippingLines.length === 0 && <SelectItem value="none" disabled>Không có dữ liệu</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="destination" className="text-sm font-medium">
                          Cảng đích
                        </label>
                        <Select>
                          <SelectTrigger id="destination">
                            <SelectValue placeholder="Chọn cảng đích" />
                          </SelectTrigger>
                          <SelectContent>
                            {ports.filter(p => p.portType === 'dryport').map(port => (
                              <SelectItem key={port.id} value={port.id}>{port.name}</SelectItem>
                            ))}
                            {ports.length === 0 && <SelectItem value="none" disabled>Không có dữ liệu</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="yard" className="text-sm font-medium">
                          Vị trí bãi (Tùy chọn)
                        </label>
                        <Select>
                          <SelectTrigger id="yard">
                            <SelectValue placeholder="Chọn bãi" />
                          </SelectTrigger>
                          <SelectContent>
                            {yards.map(yard => (
                              <SelectItem key={yard.id} value={yard.id}>{yard.name}</SelectItem>
                            ))}
                            {yards.length === 0 && <SelectItem value="none" disabled>Không có dữ liệu</SelectItem>}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
