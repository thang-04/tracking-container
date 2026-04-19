"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  History,
  Lock,
  Unlock,
  Eye,
  Download,
} from "lucide-react"

interface CustomsContainer {
  id: string
  containerNo: string
  customsStatus: "cleared" | "pending" | "hold" | "inspection"
  holdStatus: string
  holdReason: string
  inspectionRequired: boolean
  releaseStatus: "eligible" | "not-eligible" | "released"
  tripId: string
  yardBlock: string
  notes: string
  lastUpdated: string
}

const initialCustomsData: CustomsContainer[] = [
  {
    id: "1",
    containerNo: "MSKU1234567",
    customsStatus: "cleared",
    holdStatus: "None",
    holdReason: "",
    inspectionRequired: false,
    releaseStatus: "eligible",
    tripId: "BT-2024-0451",
    yardBlock: "A-01",
    notes: "Tất cả chứng từ đã xác minh",
    lastUpdated: "10 min ago",
  },
  {
    id: "2",
    containerNo: "TCLU8765432",
    customsStatus: "pending",
    holdStatus: "None",
    holdReason: "",
    inspectionRequired: false,
    releaseStatus: "not-eligible",
    tripId: "BT-2024-0451",
    yardBlock: "A-01",
    notes: "Chờ khai báo",
    lastUpdated: "30 min ago",
  },
  {
    id: "3",
    containerNo: "OOLU9876543",
    customsStatus: "hold",
    holdStatus: "Active",
    holdReason: "Chứng từ không khớp",
    inspectionRequired: true,
    releaseStatus: "not-eligible",
    tripId: "BT-2024-0448",
    yardBlock: "H-01",
    notes: "Trọng lượng không khớp với khai báo",
    lastUpdated: "2 hr ago",
  },
  {
    id: "4",
    containerNo: "MSKU2345678",
    customsStatus: "inspection",
    holdStatus: "Inspection",
    holdReason: "Chọn ngẫu nhiên",
    inspectionRequired: true,
    releaseStatus: "not-eligible",
    tripId: "BT-2024-0449",
    yardBlock: "I-01",
    notes: "Đã lên lịch kiểm tra vật lý",
    lastUpdated: "1 hr ago",
  },
  {
    id: "5",
    containerNo: "HLXU5678901",
    customsStatus: "cleared",
    holdStatus: "None",
    holdReason: "",
    inspectionRequired: false,
    releaseStatus: "released",
    tripId: "BT-2024-0450",
    yardBlock: "A-02",
    notes: "Đã giao cho người nhận",
    lastUpdated: "3 hr ago",
  },
  {
    id: "6",
    containerNo: "CMAU1234567",
    customsStatus: "hold",
    holdStatus: "Active",
    holdReason: "Nghi ngờ hàng cấm",
    inspectionRequired: true,
    releaseStatus: "not-eligible",
    tripId: "BT-2024-0447",
    yardBlock: "H-01",
    notes: "Chờ cơ quan chức năng phê duyệt",
    lastUpdated: "5 hr ago",
  },
]

const auditHistory = [
  { time: "2024-01-15 10:30", action: "Đã nhận tờ khai hải quan", user: "Hệ thống", details: "Tờ khai #CD-2024-0892" },
  { time: "2024-01-15 11:00", action: "Bắt đầu kiểm tra chứng từ", user: "Nguyễn Văn B", details: "Đã phân công xác minh" },
  { time: "2024-01-15 11:45", action: "Đặt lệnh giữ", user: "Nguyễn Văn B", details: "Phát hiện chứng từ không khớp" },
  { time: "2024-01-15 12:30", action: "Lên lịch kiểm tra", user: "Trần Thị C", details: "Yêu cầu kiểm tra vật lý" },
  { time: "2024-01-15 14:00", action: "Hoàn thành kiểm tra", user: "Đội kiểm tra", details: "Không phát hiện vấn đề" },
  { time: "2024-01-15 14:30", action: "Gỡ lệnh giữ", user: "Trần Thị C", details: "Tất cả đạt yêu cầu" },
]

export default function CustomsPage() {
  const [data, setData] = useState(initialCustomsData)
  const [selectedContainer, setSelectedContainer] = useState<CustomsContainer | null>(null)
  const [showHoldDialog, setShowHoldDialog] = useState(false)
  const [showReleaseDialog, setShowReleaseDialog] = useState(false)
  const [holdAction, setHoldAction] = useState<"place" | "remove">("place")

  const [searchQuery, setSearchQuery] = useState("")
  const [customsStatusFilter, setCustomsStatusFilter] = useState("all")
  const [holdStatusFilter, setHoldStatusFilter] = useState("all-hold")
  const [releaseStatusFilter, setReleaseStatusFilter] = useState("all-release")

  const [holdReasonType, setHoldReasonType] = useState("")

  const handlePlaceHold = () => {
    if (!selectedContainer) return
    const updated = data.map(c =>
      c.id === selectedContainer.id
        ? { ...c, customsStatus: "hold" as const, holdStatus: "Active", holdReason: holdReasonType || "Lý do khác" }
        : c
    )
    setData(updated)
    setSelectedContainer(updated.find(c => c.id === selectedContainer.id) || null)
    setShowHoldDialog(false)
    setHoldReasonType("")
  }

  const handleRemoveHold = () => {
    if (!selectedContainer) return
    const updated = data.map(c =>
      c.id === selectedContainer.id
        ? { ...c, customsStatus: "cleared" as const, holdStatus: "None", holdReason: "" }
        : c
    )
    setData(updated)
    setSelectedContainer(updated.find(c => c.id === selectedContainer.id) || null)
    setShowHoldDialog(false)
  }

  const handleMarkInspected = () => {
    if (!selectedContainer) return
    const updated = data.map(c =>
      c.id === selectedContainer.id
        ? { ...c, inspectionRequired: false }
        : c
    )
    setData(updated)
    setSelectedContainer(updated.find(c => c.id === selectedContainer.id) || null)
  }

  const handleApproveRelease = () => {
    if (!selectedContainer) return
    const updated = data.map(c =>
      c.id === selectedContainer.id
        ? { ...c, releaseStatus: "released" as const }
        : c
    )
    setData(updated)
    setSelectedContainer(updated.find(c => c.id === selectedContainer.id) || null)
    setShowReleaseDialog(false)
  }

  const columns = [
    {
      key: "containerNo",
      header: "Số Container",
      cell: (row: CustomsContainer) => (
        <span className="font-mono text-sm font-medium text-primary">{row.containerNo}</span>
      ),
    },
    {
      key: "customsStatus",
      header: "Trạng Thái Hải Quan",
      cell: (row: CustomsContainer) => (
        <StatusBadge
          status={
            row.customsStatus === "cleared"
              ? "success"
              : row.customsStatus === "hold"
                ? "error"
                : row.customsStatus === "inspection"
                  ? "warning"
                  : "pending"
          }
        >
          {row.customsStatus.charAt(0).toUpperCase() + row.customsStatus.slice(1)}
        </StatusBadge>
      ),
    },
    {
      key: "holdStatus",
      header: "Trạng Thái Giữ",
      cell: (row: CustomsContainer) => (
        <span className={row.holdStatus === "Active" || row.holdStatus === "Inspection" ? "text-red-400 font-medium" : "text-muted-foreground"}>
          {row.holdStatus}
        </span>
      ),
    },
    {
      key: "holdReason",
      header: "Lý Do Giữ",
      cell: (row: CustomsContainer) => (
        <span className="text-sm">{row.holdReason || "—"}</span>
      ),
    },
    {
      key: "inspectionRequired",
      header: "Kiểm Tra",
      cell: (row: CustomsContainer) => (
        row.inspectionRequired ? (
          <div className="flex items-center gap-1 text-yellow-500">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-xs">Yêu cầu</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Không</span>
        )
      ),
    },
    {
      key: "releaseStatus",
      header: "Phát Hành",
      cell: (row: CustomsContainer) => (
        <StatusBadge
          status={
            row.releaseStatus === "eligible"
              ? "success"
              : row.releaseStatus === "released"
                ? "completed"
                : "error"
          }
        >
          {row.releaseStatus === "eligible" ? "Đủ điều kiện" : row.releaseStatus === "released" ? "Đã giao" : "Chưa đủ ĐK"}
        </StatusBadge>
      ),
    },
    { key: "tripId", header: "Chuyến" },
    { key: "yardBlock", header: "Khu Bãi" },
    {
      key: "lastUpdated",
      header: "Cập Nhật",
      cell: (row: CustomsContainer) => (
        <span className="text-xs text-muted-foreground">{row.lastUpdated}</span>
      ),
    },
  ]

  const filteredData = data.filter(c => {
    const matchesSearch = c.containerNo.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCustoms = customsStatusFilter === "all" || c.customsStatus === customsStatusFilter
    const matchesHold = holdStatusFilter === "all-hold" ||
      (holdStatusFilter === "none" && c.holdStatus === "None") ||
      (holdStatusFilter === "active" && c.holdStatus === "Active") ||
      (holdStatusFilter === "inspection" && c.holdStatus === "Inspection")
    const matchesRelease = releaseStatusFilter === "all-release" || c.releaseStatus === releaseStatusFilter

    return matchesSearch && matchesCustoms && matchesHold && matchesRelease
  })

  const summaryStats = {
    total: data.length,
    cleared: data.filter(c => c.customsStatus === "cleared").length,
    pending: data.filter(c => c.customsStatus === "pending").length,
    hold: data.filter(c => c.customsStatus === "hold").length,
    inspection: data.filter(c => c.customsStatus === "inspection").length,
    releasable: data.filter(c => c.releaseStatus === "eligible").length,
  }

  return (
    <DashboardLayout
      title="Hải Quan & Kiểm Soát"
      description="Quản lý tờ khai hải quan, lệnh giữ và kiểm tra container."
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="text-2xl font-bold">{summaryStats.total}</div>
                  <div className="text-xs text-muted-foreground">Tổng Container</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-500">{summaryStats.cleared}</div>
                  <div className="text-xs text-muted-foreground">Đã Thông Quan</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <div>
                  <div className="text-2xl font-bold text-amber-500">{summaryStats.pending}</div>
                  <div className="text-xs text-muted-foreground">Chờ Xử Lý</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <div className="text-2xl font-bold text-red-500">{summaryStats.hold}</div>
                  <div className="text-xs text-muted-foreground">Đang Giữ</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-500">{summaryStats.inspection}</div>
                  <div className="text-xs text-muted-foreground">Kiểm Tra</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Unlock className="w-5 h-5 text-emerald-500" />
                <div>
                  <div className="text-2xl font-bold text-emerald-500">{summaryStats.releasable}</div>
                  <div className="text-xs text-muted-foreground">Sẵn Sàng Giao</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm container..."
              className="pl-9 bg-secondary border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Select value={customsStatusFilter} onValueChange={setCustomsStatusFilter}>
              <SelectTrigger className="w-[150px] bg-secondary border-border shrink-0">
                <SelectValue placeholder="Trạng Thái HQ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất Cả</SelectItem>
                <SelectItem value="cleared">Đã Thông Quan</SelectItem>
                <SelectItem value="pending">Chờ Xử Lý</SelectItem>
                <SelectItem value="hold">Đang Giữ</SelectItem>
                <SelectItem value="inspection">Kiểm Tra</SelectItem>
              </SelectContent>
            </Select>
            <Select value={holdStatusFilter} onValueChange={setHoldStatusFilter}>
              <SelectTrigger className="w-[150px] bg-secondary border-border shrink-0">
                <SelectValue placeholder="Trạng Thái Giữ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-hold">Tất Cả</SelectItem>
                <SelectItem value="none">Không Giữ</SelectItem>
                <SelectItem value="active">Đang Giữ</SelectItem>
                <SelectItem value="inspection">Giữ Kiểm Tra</SelectItem>
              </SelectContent>
            </Select>
            <Select value={releaseStatusFilter} onValueChange={setReleaseStatusFilter}>
              <SelectTrigger className="w-[150px] bg-secondary border-border shrink-0">
                <SelectValue placeholder="Trạng Thái Giao" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-release">Tất Cả</SelectItem>
                <SelectItem value="eligible">Đủ Điều Kiện</SelectItem>
                <SelectItem value="not-eligible">Chưa Đủ ĐK</SelectItem>
                <SelectItem value="released">Đã Giao</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="sm:ml-auto w-full sm:w-auto flex items-center justify-end">
            <Button variant="outline" size="sm" className="gap-2 shrink-0">
              <Download className="w-4 h-4" />
              Xuất File
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={filteredData}
          selectable
          onRowClick={(row) => setSelectedContainer(row)}
        />

        {/* Container Detail Sheet */}
        <Sheet open={!!selectedContainer} onOpenChange={() => setSelectedContainer(null)}>
          <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {selectedContainer?.containerNo}
              </SheetTitle>
              <SheetDescription>Thông tin hải quan và kiểm soát</SheetDescription>
            </SheetHeader>

            {selectedContainer && (
              <Tabs defaultValue="details" className="mt-6">
                <TabsList className="bg-secondary w-full">
                  <TabsTrigger value="details" className="flex-1">
                    Chi Tiết
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex-1">
                    Nhật Ký
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex-1">
                    Chứng Từ
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4 space-y-4">
                  {/* Status Cards */}
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      status={
                        selectedContainer.customsStatus === "cleared"
                          ? "success"
                          : selectedContainer.customsStatus === "hold"
                            ? "error"
                            : selectedContainer.customsStatus === "inspection"
                              ? "warning"
                              : "pending"
                      }
                      size="md"
                    >
                      Hải quan: {selectedContainer.customsStatus.charAt(0).toUpperCase() + selectedContainer.customsStatus.slice(1)}
                    </StatusBadge>
                    <StatusBadge
                      status={
                        selectedContainer.releaseStatus === "eligible"
                          ? "success"
                          : selectedContainer.releaseStatus === "released"
                            ? "completed"
                            : "error"
                      }
                      size="md"
                    >
                      {selectedContainer.releaseStatus === "eligible" ? "Đã thông qua hải quan" : selectedContainer.releaseStatus === "released" ? "Đã phát hành" : "Chưa đủ ĐK"}
                    </StatusBadge>
                  </div>

                  {/* Hold Information */}
                  {(selectedContainer.holdStatus === "Active" || selectedContainer.holdStatus === "Inspection") && (
                    <Card className="bg-red-500/10 border-red-500/30">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2 text-red-500">
                          <Lock className="w-4 h-4" />
                          Đang bị giữ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Loại giữ</span>
                            <span className="font-medium">{selectedContainer.holdStatus}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Lý do</span>
                            <span className="font-medium">{selectedContainer.holdReason}</span>
                          </div>
                          {selectedContainer.inspectionRequired && (
                            <div className="flex items-center gap-2 mt-2 p-2 bg-yellow-500/10 rounded-md border border-yellow-500/30">
                              <AlertTriangle className="w-4 h-4 text-yellow-500" />
                              <span className="text-yellow-600 dark:text-yellow-400 text-sm">Yêu cầu kiểm tra vật lý</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Container Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <label className="text-xs text-muted-foreground">Mã chuyến</label>
                      <p className="font-medium mt-1">{selectedContainer.tripId}</p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <label className="text-xs text-muted-foreground">Khu bãi</label>
                      <p className="font-medium mt-1">{selectedContainer.yardBlock}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  <Card className="bg-secondary/20 border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Ghi chú</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{selectedContainer.notes}</p>
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => {
                        setHoldAction(selectedContainer.holdStatus === "Active" || selectedContainer.holdStatus === "Inspection" ? "remove" : "place")
                        setShowHoldDialog(true)
                      }}
                    >
                      {selectedContainer.holdStatus === "Active" || selectedContainer.holdStatus === "Inspection" ? (
                        <>
                          <Unlock className="w-4 h-4" />
                          Gỡ lệnh giữ
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Lệnh giữ
                        </>
                      )}
                    </Button>
                    {selectedContainer.inspectionRequired && (
                      <Button variant="outline" className="flex-1 gap-2" onClick={handleMarkInspected}>
                        <CheckCircle2 className="w-4 h-4" />
                        Đã kiểm tra
                      </Button>
                    )}
                    <Button
                      className="flex-1"
                      disabled={selectedContainer.releaseStatus !== "eligible"}
                      onClick={() => setShowReleaseDialog(true)}
                    >
                      Duyệt giao
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-4">
                  <Card className="bg-secondary/20 border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Nhật ký kiểm toán
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {auditHistory.map((item, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-2 h-2 rounded-full bg-primary" />
                              {index < auditHistory.length - 1 && (
                                <div className="w-0.5 h-full bg-border flex-1 mt-1" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">{item.action}</span>
                                <span className="text-xs text-muted-foreground">{item.time}</span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                By: {item.user}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {item.details}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="mt-4">
                  <Card className="bg-secondary/20 border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Chứng từ hải quan
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        "Customs Declaration.pdf",
                        "Import Permit.pdf",
                        "Certificate of Origin.pdf",
                        "Commercial Invoice.pdf",
                      ].map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded-md bg-secondary/30 hover:bg-secondary/50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{doc}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            Xem
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </SheetContent>
        </Sheet>

        {/* Hold Dialog */}
        <Dialog open={showHoldDialog} onOpenChange={setShowHoldDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {holdAction === "place" ? "Đặt lệnh giữ lên container" : "Gỡ lệnh giữ container"}
              </DialogTitle>
              <DialogDescription>
                {holdAction === "place"
                  ? "Thêm lệnh giữ hải quan hoặc hành chính cho container này"
                  : "Gỡ lệnh giữ hiện tại và cập nhật trạng thái container"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {holdAction === "place" ? (
                <>
                  <div>
                    <label className="text-xs text-muted-foreground">Lý do giữ</label>
                    <Select value={holdReasonType} onValueChange={setHoldReasonType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Chọn lý do" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Sai sót chứng từ</SelectItem>
                        <SelectItem value="inspection">Yêu cầu kiểm tra</SelectItem>
                        <SelectItem value="prohibited">Nghi ngờ hàng cấm</SelectItem>
                        <SelectItem value="duty">Vấn đề thuế quan</SelectItem>
                        <SelectItem value="other">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Ghi chú</label>
                    <Textarea placeholder="Cung cấp chi tiết cho lệnh giữ..." className="mt-1" />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs text-muted-foreground">Ghi chú gỡ lệnh</label>
                  <Textarea placeholder="Lý do gỡ lệnh giữ..." className="mt-1" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowHoldDialog(false)}>
                Hủy
              </Button>
              <Button
                variant={holdAction === "place" ? "destructive" : "default"}
                onClick={holdAction === "place" ? handlePlaceHold : handleRemoveHold}
              >
                {holdAction === "place" ? "Đặt lệnh giữ" : "Gỡ lệnh giữ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Release Dialog */}
        <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chấp thuận giao container</DialogTitle>
              <DialogDescription>
                Xác nhận rằng mọi yêu cầu hải quan đã được đáp ứng và cho phép phát hành
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-500 mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-medium">Container đủ điều kiện để giao</span>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                  <li>Tờ khai hải quan được phê duyệt</li>
                  <li>Tất cả thuế phí đã được thanh toán</li>
                  <li>Không có lệnh giữ hiện tại</li>
                  <li>Không cần kiểm tra</li>
                </ul>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Ghi chú xác nhận</label>
                <Textarea placeholder="Các ghi chú tùy chọn cho việc cấp phép..." className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReleaseDialog(false)}>
                Hủy
              </Button>
              <Button className="gap-2" onClick={handleApproveRelease}>
                <CheckCircle2 className="w-4 h-4" />
                Duyệt giao
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
