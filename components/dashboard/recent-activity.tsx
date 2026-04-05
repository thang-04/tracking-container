"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardActivityItem } from "@/lib/dashboard/get-dashboard-overview"
import { Package, Truck, AlertTriangle, CheckCircle2 } from "lucide-react"

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

export function RecentActivity({ activities }: { activities: DashboardActivityItem[] }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Hoạt động gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
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
                    <p className="text-sm leading-relaxed text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            Chưa có hoạt động mới để hiển thị.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
