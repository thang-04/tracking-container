"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Truck, AlertTriangle, CheckCircle2 } from "lucide-react"

const activities = [
  {
    id: 1,
    type: "container",
    message: "Container MSKU-2847561 đã đến Cảng Hải Phòng",
    time: "5 phút trước",
    status: "success",
  },
  {
    id: 2,
    type: "truck",
    message: "Xe tải VN-29H-12345 bắt đầu tuyến đến Hà Nội",
    time: "12 phút trước",
    status: "info",
  },
  {
    id: 3,
    type: "alert",
    message: "Phát hiện trễ trên tuyến HP-HN (30 phút)",
    time: "25 phút trước",
    status: "warning",
  },
  {
    id: 4,
    type: "container",
    message: "Container TCLU-9876543 đã giao đến Cảng cạn",
    time: "1 giờ trước",
    status: "success",
  },
  {
    id: 5,
    type: "truck",
    message: "Xe tải VN-30A-54321 hoàn thành bảo dưỡng",
    time: "2 giờ trước",
    status: "info",
  },
]

const iconMap = {
  container: Package,
  truck: Truck,
  alert: AlertTriangle,
}

const statusColors = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-primary/10 text-primary",
}

export function RecentActivity() {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Hoạt động gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type as keyof typeof iconMap] || CheckCircle2
            const statusColor = statusColors[activity.status as keyof typeof statusColors]

            return (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`rounded-lg p-2 ${statusColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-foreground leading-relaxed">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
