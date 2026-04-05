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
import {
  AlertTriangle,
  Clock,
  MapPin,
  Truck,
  Package,
  Bell,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
} from "lucide-react"

interface Alert {
  id: string
  type: "delay" | "deviation" | "maintenance" | "weather" | "congestion"
  severity: "critical" | "warning" | "info"
  title: string
  description: string
  location?: string
  vehicle?: string
  container?: string
  timestamp: string
  status: "active" | "acknowledged" | "resolved"
}

const alertsData: Alert[] = [
  {
    id: "1",
    type: "delay",
    severity: "critical",
    title: "Phát hiện trễ nghiêm trọng",
    description: "Container MSKU-2847561 bị trễ hơn 2 giờ do tắc nghẽn giao thông trên tuyến HP-HN.",
    location: "Tuyến HP-HN, Km 45",
    vehicle: "29H-12345",
    container: "MSKU-2847561",
    timestamp: "10 phút trước",
    status: "active",
  },
  {
    id: "2",
    type: "deviation",
    severity: "warning",
    title: "Cảnh báo lệch tuyến",
    description: "Xe 30A-54321 đã lệch khỏi tuyến đường đã định. Vị trí hiện tại cách tuyến 3km.",
    location: "Quốc lộ 1A",
    vehicle: "30A-54321",
    timestamp: "25 phút trước",
    status: "acknowledged",
  },
  {
    id: "3",
    type: "maintenance",
    severity: "warning",
    title: "Đến hạn bảo dưỡng",
    description: "Xe 43A-22222 đến hạn bảo dưỡng định kỳ. Lần bảo dưỡng cuối cách đây 45 ngày.",
    vehicle: "43A-22222",
    timestamp: "1 giờ trước",
    status: "active",
  },
  {
    id: "4",
    type: "weather",
    severity: "info",
    title: "Cảnh báo thời tiết",
    description: "Dự báo mưa lớn tại khu vực Đà Nẵng. Các tuyến ĐN-HCM có thể bị ảnh hưởng.",
    location: "Khu vực Đà Nẵng",
    timestamp: "2 giờ trước",
    status: "active",
  },
  {
    id: "5",
    type: "congestion",
    severity: "warning",
    title: "Tắc nghẽn tại cảng",
    description: "Tình trạng tắc nghẽn cao tại Cảng Hải Phòng. Thời gian chờ trung bình tăng lên 3 giờ.",
    location: "Cảng Hải Phòng",
    timestamp: "3 giờ trước",
    status: "active",
  },
  {
    id: "6",
    type: "delay",
    severity: "info",
    title: "Trễ nhẹ",
    description: "Container TCLU-9876543 chậm 30 phút so với lịch trình.",
    container: "TCLU-9876543",
    vehicle: "29C-98765",
    timestamp: "4 giờ trước",
    status: "resolved",
  },
]

const severityConfig = {
  critical: { label: "Nghiêm trọng", className: "bg-destructive text-destructive-foreground", icon: XCircle },
  warning: { label: "Cảnh báo", className: "bg-warning text-warning-foreground", icon: AlertTriangle },
  info: { label: "Thông tin", className: "bg-primary text-primary-foreground", icon: Bell },
}

const typeConfig = {
  delay: { label: "Trễ", icon: Clock },
  deviation: { label: "Lệch tuyến", icon: MapPin },
  maintenance: { label: "Bảo dưỡng", icon: Truck },
  weather: { label: "Thời tiết", icon: AlertTriangle },
  congestion: { label: "Tắc nghẽn", icon: Package },
}

const statusConfig = {
  active: { label: "Đang hoạt động", className: "bg-destructive/10 text-destructive" },
  acknowledged: { label: "Đã xác nhận", className: "bg-warning/10 text-warning" },
  resolved: { label: "Đã giải quyết", className: "bg-success/10 text-success" },
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(alertsData)
  const [filter, setFilter] = useState("all")
  const [severityFilter, setSeverityFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filter === "all" || alert.status === filter
    const matchesSeverity = severityFilter === "all" || alert.severity === severityFilter
    return matchesSearch && matchesStatus && matchesSeverity
  })

  const stats = {
    total: alerts.length,
    critical: alerts.filter((a) => a.severity === "critical" && a.status !== "resolved").length,
    active: alerts.filter((a) => a.status === "active").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
  }

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status: "acknowledged" as const } : alert
      )
    )
  }

  const resolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status: "resolved" as const } : alert
      )
    )
  }

  return (
    <DashboardLayout
      title="Cảnh báo"
      description="Giám sát và quản lý cảnh báo hệ thống"
    >
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-muted p-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Tổng cảnh báo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 border-l-4 border-l-destructive">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-destructive/10 p-2">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.critical}</p>
                <p className="text-sm text-muted-foreground">Nghiêm trọng</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Đang hoạt động</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.resolved}</p>
                <p className="text-sm text-muted-foreground">Đã giải quyết</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mt-6 border-border/50">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-base font-medium">Danh sách cảnh báo</CardTitle>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm cảnh báo..."
                  className="w-full bg-secondary pl-9 md:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <SelectValue placeholder="Mức độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mức độ</SelectItem>
                  <SelectItem value="critical">Nghiêm trọng</SelectItem>
                  <SelectItem value="warning">Cảnh báo</SelectItem>
                  <SelectItem value="info">Thông tin</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full md:w-36">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Đang hoạt động</SelectItem>
                  <SelectItem value="acknowledged">Đã xác nhận</SelectItem>
                  <SelectItem value="resolved">Đã giải quyết</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const TypeIcon = typeConfig[alert.type].icon

                return (
                  <div
                    key={alert.id}
                    className={`rounded-lg border p-4 transition-colors ${
                      alert.severity === "critical" && alert.status === "active"
                        ? "border-destructive/50 bg-destructive/5"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg p-2 ${
                          alert.severity === "critical" ? "bg-destructive/10" :
                          alert.severity === "warning" ? "bg-warning/10" : "bg-primary/10"
                        }`}>
                          <TypeIcon className={`h-5 w-5 ${
                            alert.severity === "critical" ? "text-destructive" :
                            alert.severity === "warning" ? "text-warning" : "text-primary"
                          }`} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-foreground">{alert.title}</h3>
                            <Badge className={severityConfig[alert.severity].className}>
                              {severityConfig[alert.severity].label}
                            </Badge>
                            <Badge variant="outline" className={statusConfig[alert.status].className}>
                              {statusConfig[alert.status].label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{alert.description}</p>
                          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
                            {alert.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {alert.location}
                              </span>
                            )}
                            {alert.vehicle && (
                              <span className="flex items-center gap-1">
                                <Truck className="h-3 w-3" /> {alert.vehicle}
                              </span>
                            )}
                            {alert.container && (
                              <span className="flex items-center gap-1">
                                <Package className="h-3 w-3" /> {alert.container}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {alert.timestamp}
                            </span>
                          </div>
                        </div>
                      </div>
                      {alert.status !== "resolved" && (
                        <div className="flex gap-2">
                          {alert.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => acknowledgeAlert(alert.id)}
                            >
                              Xác nhận
                            </Button>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => resolveAlert(alert.id)}
                          >
                            Giải quyết
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
