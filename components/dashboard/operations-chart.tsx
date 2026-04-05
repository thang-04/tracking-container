"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardOperationsPoint } from "@/lib/dashboard/get-dashboard-overview"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function OperationsChart({ data }: { data: DashboardOperationsPoint[] }) {
  const hasData = data.some((item) => item.containers > 0 || item.shipments > 0)

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Hoạt động hàng ngày</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorContainers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="containers"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#colorContainers)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="shipments"
                    stroke="hsl(var(--chart-2))"
                    fillOpacity={1}
                    fill="url(#colorShipments)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-1" />
                <span className="text-sm text-muted-foreground">Container</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-2" />
                <span className="text-sm text-muted-foreground">Lô hàng</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Chưa có dữ liệu hoạt động trong 7 ngày gần đây.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
