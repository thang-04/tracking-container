"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { DashboardRouteEfficiencyPoint } from "@/lib/dashboard/get-dashboard-overview"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export function EfficiencyChart({ data }: { data: DashboardRouteEfficiencyPoint[] }) {
  const hasData = data.length > 0
  const averageEfficiency =
    data.length === 0
      ? 0
      : Math.round(data.reduce((sum, item) => sum + item.efficiency, 0) / data.length)

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Hiệu suất vận chuyển</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                  <XAxis
                    type="number"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="route"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [`${value}%`, "Hiệu suất"]}
                  />
                  <Bar
                    dataKey="efficiency"
                    fill="hsl(var(--chart-2))"
                    radius={[0, 4, 4, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Mục tiêu: {data[0]?.target ?? 85}%</span>
              <span className="font-medium text-success">Trung bình: {averageEfficiency}%</span>
            </div>
          </>
        ) : (
          <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
            Chưa có chuyến hoàn thành để tính hiệu suất theo tuyến.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
