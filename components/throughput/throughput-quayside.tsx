"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Download,
  Upload,
  Package,
  Anchor,
  Ship,
  BarChart3,
  Clock,
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

const vesselData = [
  { 
    vessel: "MAERSK TAURUS", 
    berth: "Cầu 5", 
    start: "19:30", 
    end: "23:34", 
    discharge: 600, 
    load: 134, 
    total: 734 
  },
]

const cmphData = [
  { time: "19:00", sts01: 15, sts02: 16, sts03: 3, sts04: 16, sts05: 20, sts06: 0 },
  { time: "20:00", sts01: 31, sts02: 39, sts03: 32, sts04: 28, sts05: 43, sts06: 2 },
  { time: "21:00", sts01: 34, sts02: 33, sts03: 35, sts04: 49, sts05: 53, sts06: 23 },
  { time: "22:00", sts01: 43, sts02: 28, sts03: 36, sts04: 50, sts05: 29, sts06: 25 },
  { time: "23:00", sts01: 22, sts02: 15, sts03: 22, sts04: 32, sts05: 10, sts06: 13 },
]

export function ThroughputQuaySide({ isDayShift = true }: { isDayShift?: boolean }) {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-500/20 text-blue-500 rounded">
              <Ship className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Sản lượng Quay Side</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isDayShift ? "Ca ngày (07:00-19:00)" : "Ca đêm (19:00-07:00)"} - 17/4/2026
          </p>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {/* Discharge */}
        <Card className="bg-card border-border hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium group-hover:text-foreground transition-colors">Dỡ tàu</p>
              <h2 className="text-2xl font-bold text-blue-500">600</h2>
            </div>
          </CardContent>
        </Card>

        {/* Load */}
        <Card className="bg-card border-border hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium group-hover:text-foreground transition-colors">Xếp tàu</p>
              <h2 className="text-2xl font-bold text-emerald-500">196</h2>
            </div>
          </CardContent>
        </Card>

        {/* Total Quay Side */}
        <Card className="bg-blue-950/10 border-blue-900/40 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4 h-full">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-inner">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-blue-500/80 uppercase font-medium group-hover:text-blue-400 transition-colors">Tổng Quay Side</p>
              <h2 className="text-2xl font-bold text-blue-500 transition-transform origin-left group-hover:scale-105">796</h2>
            </div>
          </CardContent>
        </Card>

        {/* Số tàu */}
        <Card className="bg-card border-border hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-slate-500/10 text-slate-400 rounded-lg group-hover:bg-slate-500/20 group-hover:scale-110 transition-all duration-300">
              <Anchor className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium group-hover:text-foreground transition-colors">Số tàu</p>
              <h2 className="text-2xl font-bold text-slate-300">1</h2>
            </div>
          </CardContent>
        </Card>

        {/* Barge */}
        <Card className="bg-card border-border hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg group-hover:bg-orange-500/20 group-hover:scale-110 transition-all duration-300">
              <Ship className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium group-hover:text-foreground transition-colors">Barge</p>
              <h2 className="text-2xl font-bold text-orange-500">62</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" className="gap-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20">
          <Ship className="h-4 w-4" />
          Theo Tàu (1)
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted text-muted-foreground">
          <Ship className="h-4 w-4" />
          Theo SALAN (1)
        </Button>
        <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted text-muted-foreground">
          <Clock className="h-4 w-4" />
          Gap Analysis
        </Button>
      </div>

      {/* Row 2: Vessel Table */}
      <Card className="bg-card border-border hover:border-foreground/30 transition-colors flex-1 shadow-sm">
        <div className="p-4 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded">
              <Ship className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm">Sản lượng theo Tàu</h3>
            <div className="px-2 py-0.5 bg-muted text-xs font-medium rounded-full text-muted-foreground">
              1 tàu
            </div>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Tàu</th>
                  <th className="px-6 py-4 font-medium">Bắt đầu</th>
                  <th className="px-6 py-4 font-medium">Kết thúc</th>
                  <th className="px-6 py-4 font-medium text-blue-500/80">Discharge</th>
                  <th className="px-6 py-4 font-medium text-emerald-500/80">Load</th>
                  <th className="px-6 py-4 font-medium text-right">Tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {vesselData.map((row) => (
                  <tr key={row.vessel} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{row.vessel}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{row.berth}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{row.start}</td>
                    <td className="px-6 py-4 text-muted-foreground">{row.end}</td>
                    <td className="px-6 py-4 font-medium text-blue-500">{row.discharge}</td>
                    <td className="px-6 py-4 font-medium text-emerald-500">{row.load}</td>
                    <td className="px-6 py-4 font-bold text-right text-white">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Row 3: CMPH Chart */}
      <Card className="bg-card border-border hover:border-foreground/30 transition-colors duration-300 col-span-full group shadow-sm">
        <div className="p-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm">CMPH theo giờ</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-md font-medium">
              <Clock className="h-3.5 w-3.5" />
              19:00-07:00
            </div>
          </div>
        </div>
        <CardContent>
          <div className="h-[350px] w-full mt-4 transition-opacity duration-500">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cmphData} margin={{ top: 20, right: 20, bottom: 20, left: -10 }} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis 
                  dataKey="time" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                  dx={-10}
                />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))", borderRadius: "0.5rem", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "hsl(var(--foreground))" }}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: "20px" }}
                  formatter={(value) => <span className="text-foreground ml-1 text-xs font-medium uppercase">{value}</span>}
                  iconType="square"
                />
                <Bar dataKey="sts01" name="STS01" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={30} />
                <Bar dataKey="sts02" name="STS02" fill="#22c55e" radius={[2, 2, 0, 0]} maxBarSize={30} />
                <Bar dataKey="sts03" name="STS03" fill="#f97316" radius={[2, 2, 0, 0]} maxBarSize={30} />
                <Bar dataKey="sts04" name="STS04" fill="#a855f7" radius={[2, 2, 0, 0]} maxBarSize={30} />
                <Bar dataKey="sts05" name="STS05" fill="#ec4899" radius={[2, 2, 0, 0]} maxBarSize={30} />
                <Bar dataKey="sts06" name="STS06" fill="#eab308" radius={[2, 2, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
