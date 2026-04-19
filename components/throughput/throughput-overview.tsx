"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Download,
  Upload,
  RefreshCw,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCcw,
  BarChart3,
  Clock,
  Sun,
  Moon,
  Grid3X3,
  Ship,
  Wrench,
  LineChart,
  FileText,
} from "lucide-react"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

import { ThroughputYard } from "./throughput-yard"
import { ThroughputQuaySide } from "./throughput-quayside"
import { ThroughputEquipment } from "./throughput-equipment"

const dayChartData = [
  { time: "07:00", import20: 0, import40: 60, export20: 40, export40: 60, total: 300 },
  { time: "08:00", import20: 10, import40: 70, export20: 10, export40: 80, total: 240 },
  { time: "09:00", import20: 10, import40: 80, export20: 40, export40: 60, total: 270 },
  { time: "10:00", import20: 10, import40: 90, export20: 30, export40: 60, total: 250 },
  { time: "11:00", import20: 10, import40: 80, export20: 40, export40: 70, total: 280 },
  { time: "12:00", import20: 0, import40: 70, export20: 10, export40: 60, total: 200 },
  { time: "13:00", import20: 0, import40: 80, export20: 10, export40: 60, total: 190 },
  { time: "14:00", import20: 5, import40: 100, export20: 10, export40: 30, total: 170 },
  { time: "15:00", import20: 10, import40: 50, export20: 40, export40: 50, total: 210 },
  { time: "16:00", import20: 0, import40: 30, export20: 0, export40: 35, total: 150 },
  { time: "17:00", import20: 0, import40: 5, export20: 5, export40: 5, total: 130 },
  { time: "18:00", import20: 0, import40: 0, export20: 0, export40: 0, total: 110 },
]

const nightChartData = [
  { time: "19:00", import20: 10, import40: 60, export20: 20, export40: 50, total: 180 },
  { time: "20:00", import20: 10, import40: 150, export20: 0, export40: 0, total: 250 },
  { time: "21:00", import20: 50, import40: 70, export20: 50, export40: 20, total: 320 },
  { time: "22:00", import20: 30, import40: 100, export20: 60, export40: 30, total: 350 },
  { time: "23:00", import20: 20, import40: 60, export20: 40, export40: 20, total: 280 },
  { time: "00:00", import20: 10, import40: 110, export20: 5, export40: 5, total: 250 },
  { time: "01:00", import20: 30, import40: 60, export20: 40, export40: 10, total: 240 },
  { time: "02:00", import20: 40, import40: 40, export20: 60, export40: 20, total: 260 },
  { time: "03:00", import20: 50, import40: 50, export20: 80, export40: 10, total: 280 },
  { time: "04:00", import20: 40, import40: 50, export20: 100, export40: 10, total: 270 },
  { time: "05:00", import20: 30, import40: 50, export20: 120, export40: 30, total: 300 },
  { time: "06:00", import20: 30, import40: 30, export20: 60, export40: 10, total: 190 },
]

const dayKpis = {
  discharge: 734, load: 684, gateOut: 134, gateIn: 612, shifting: 209,
  total: 2373, export20: 75, export40: 609, import20: 111, import40: 623
}

const nightKpis = {
  discharge: 1214, load: 789, gateOut: 251, gateIn: 919, shifting: 319,
  total: 3496, export20: 175, export40: 614, import20: 179, import40: 1035
}

export function ThroughputOverview() {
  const [isDayShift, setIsDayShift] = useState(true)
  const [shiftsInfo, setShiftsInfo] = useState({ nightDateShort: "17/04", nightDateFull: "17/4/2026", dayDateShort: "18/04", dayDateFull: "18/4/2026" })
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const now = new Date()
    const hours = now.getHours()
    
    let opsDay, opsNight;
    if (hours >= 7 && hours < 19) {
      opsDay = new Date(now);
      opsNight = new Date(now);
      opsNight.setDate(opsDay.getDate() - 1);
      setIsDayShift(true);
    } else {
      if (hours >= 19) {
        opsDay = new Date(now);
        opsNight = new Date(now);
      } else {
        opsDay = new Date(now);
        opsDay.setDate(opsDay.getDate() - 1);
        opsNight = new Date(now);
        opsNight.setDate(opsNight.getDate() - 1);
      }
      setIsDayShift(false);
    }
    
    setShiftsInfo({
      nightDateShort: `${opsNight.getDate().toString().padStart(2, "0")}/${(opsNight.getMonth() + 1).toString().padStart(2, "0")}`,
      nightDateFull: `${opsNight.getDate()}/${opsNight.getMonth() + 1}/${opsNight.getFullYear()}`,
      dayDateShort: `${opsDay.getDate().toString().padStart(2, "0")}/${(opsDay.getMonth() + 1).toString().padStart(2, "0")}`,
      dayDateFull: `${opsDay.getDate()}/${opsDay.getMonth() + 1}/${opsDay.getFullYear()}`
    })
  }, [])

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Sub-Navigation */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div className="flex flex-wrap items-center gap-1">
          <Button 
            variant={activeTab === "overview" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("overview")}
            className={`gap-2 transition-colors ${activeTab === "overview" ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted text-muted-foreground"}`}
          >
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Tổng quan</span>
          </Button>
          <Button 
            variant={activeTab === "yard" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("yard")}
            className={`gap-2 transition-colors ${activeTab === "yard" ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" : "hover:bg-muted text-muted-foreground"}`}
          >
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden sm:inline">Yard</span>
          </Button>
          <Button 
            variant={activeTab === "quayside" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("quayside")}
            className={`gap-2 transition-colors ${activeTab === "quayside" ? "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20" : "hover:bg-muted text-muted-foreground"}`}
          >
            <Ship className="h-4 w-4" />
            <span className="hidden sm:inline">Quay Side</span>
          </Button>
          <Button 
            variant={activeTab === "equipment" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setActiveTab("equipment")}
            className={`gap-2 transition-colors ${activeTab === "equipment" ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "hover:bg-muted text-muted-foreground"}`}
          >
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Thiết bị</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted transition-colors text-muted-foreground">
            <LineChart className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 hover:bg-muted transition-colors text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Report</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={!isDayShift ? "default" : "outline"} 
            size="sm" 
            className={`gap-2 transition-all ${!isDayShift ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5" : "hover:bg-muted"}`}
            onClick={() => setIsDayShift(false)}
          >
            <Moon className="h-4 w-4" />
            {shiftsInfo.nightDateShort}
          </Button>
          <Button 
            variant={isDayShift ? "default" : "outline"} 
            size="sm" 
            className={`gap-2 transition-all ${isDayShift ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5" : "hover:bg-muted"}`}
            onClick={() => setIsDayShift(true)}
          >
            <Sun className="h-4 w-4" />
            {shiftsInfo.dayDateShort}
          </Button>
        </div>
      </div>

      {activeTab === "overview" && <OverviewContent isDayShift={isDayShift} shiftsInfo={shiftsInfo} />}
      {activeTab === "yard" && <ThroughputYard isDayShift={isDayShift} />}
      {activeTab === "quayside" && <ThroughputQuaySide isDayShift={isDayShift} />}
      {activeTab === "equipment" && <ThroughputEquipment />}
    </div>
  )
}

function OverviewContent({ isDayShift, shiftsInfo }: { isDayShift: boolean, shiftsInfo: any }) {
  const data = isDayShift ? dayChartData : nightChartData;
  const kpis = isDayShift ? dayKpis : nightKpis;
  const currentDateFull = isDayShift ? shiftsInfo.dayDateFull : shiftsInfo.nightDateFull;

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary animate-pulse" />
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Sản lượng</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isDayShift ? "Ca ngày (07:00-19:00)" : "Ca đêm (19:00-07:00)"} - {currentDateFull}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2 hover:bg-primary/10 hover:text-primary transition-colors group">
          <RefreshCcw className="h-4 w-4 group-hover:animate-spin" />
          Làm mới
        </Button>
      </div>

      {/* Row 1: Small KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {/* Discharge */}
        <Card className="bg-card border-border hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium group-hover:text-foreground transition-colors">Dỡ tàu</p>
              <h2 className="text-2xl font-bold text-blue-500">{kpis.discharge.toLocaleString()}</h2>
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
              <h2 className="text-2xl font-bold text-emerald-500">{kpis.load.toLocaleString()}</h2>
            </div>
          </CardContent>
        </Card>

        {/* Gate Out */}
        <Card className="bg-card border-border hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg group-hover:bg-orange-500/20 group-hover:scale-110 transition-all duration-300">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium group-hover:text-foreground transition-colors">Xuất bãi</p>
              <h2 className="text-2xl font-bold text-orange-500">{kpis.gateOut.toLocaleString()}</h2>
            </div>
          </CardContent>
        </Card>

        {/* Gate In */}
        <Card className="bg-card border-border hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg group-hover:bg-yellow-500/20 group-hover:scale-110 transition-all duration-300">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium group-hover:text-foreground transition-colors">Nhập bãi</p>
              <h2 className="text-2xl font-bold text-yellow-500">{kpis.gateIn.toLocaleString()}</h2>
            </div>
          </CardContent>
        </Card>

        {/* Shifting */}
        <Card className="bg-card border-border hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg group-hover:bg-purple-500/20 group-hover:scale-110 transition-all duration-300">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium group-hover:text-foreground transition-colors">Đảo chuyển</p>
              <h2 className="text-2xl font-bold text-purple-500">{kpis.shifting.toLocaleString()}</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Large KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Throughput */}
        <Card className="bg-card border-border hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-5 flex justify-between">
            <div className="flex flex-col justify-center">
              <p className="text-xs text-muted-foreground uppercase font-medium mb-2 group-hover:text-foreground transition-colors">Tổng sản lượng</p>
              <h2 className="text-4xl font-bold text-blue-500 transition-transform origin-left group-hover:scale-105">{kpis.total.toLocaleString()}</h2>
            </div>
            <div className="p-4 h-fit bg-blue-500/10 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-inner">
              <Package className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Export */}
        <Card className="bg-emerald-950/10 border-emerald-900/40 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-5 flex justify-between h-full">
            <div className="flex flex-col justify-between h-full w-full">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium mb-2 group-hover:text-emerald-500/80 transition-colors">Xuất (Export)</p>
                <h2 className="text-4xl font-bold text-emerald-500 transition-transform origin-left group-hover:scale-105">{kpis.load.toLocaleString()}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-medium">20&apos;: {kpis.export20} <span className="text-border mx-1">|</span> 40&apos;: {kpis.export40}</p>
            </div>
            <div className="p-4 h-fit bg-emerald-500/10 text-emerald-500 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-inner">
              <ArrowUpRight className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Import */}
        <Card className="bg-blue-950/10 border-blue-900/40 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-5 flex justify-between h-full">
            <div className="flex flex-col justify-between h-full w-full">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium mb-2 group-hover:text-blue-500/80 transition-colors">Nhập (Import)</p>
                <h2 className="text-4xl font-bold text-blue-500 transition-transform origin-left group-hover:scale-105">{kpis.discharge.toLocaleString()}</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-4 font-medium">20&apos;: {kpis.import20} <span className="text-border mx-1">|</span> 40&apos;: {kpis.import40}</p>
            </div>
            <div className="p-4 h-fit bg-blue-500/10 text-blue-500 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-inner">
              <ArrowDownLeft className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="bg-card border-border hover:border-foreground/30 transition-colors duration-300 col-span-full group">
        <div className="p-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm">Sản lượng theo giờ</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1.5 rounded-md font-medium">
              <Clock className="h-3.5 w-3.5" />
              {isDayShift ? "07:00-19:00" : "19:00-07:00"}
            </div>
          </div>
        </div>
        <CardContent>
          <div className="h-[400px] w-full mt-4 transition-opacity duration-500">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
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
                  formatter={(value) => <span className="text-foreground ml-1 font-medium">{value}</span>}
                  iconType="circle"
                />
                {/* Export Bars */}
                <Bar dataKey="export20" name="Xuất 20'" stackId="a" fill="#f59e0b" maxBarSize={40} radius={[0, 0, 0, 0]} />
                <Bar dataKey="export40" name="Xuất 40'" stackId="a" fill="#d97706" maxBarSize={40} radius={[4, 4, 0, 0]} />
                {/* Import Bars */}
                <Bar dataKey="import20" name="Nhập 20'" stackId="b" fill="#3b82f6" maxBarSize={40} radius={[0, 0, 0, 0]} />
                <Bar dataKey="import40" name="Nhập 40'" stackId="b" fill="#2dd4bf" maxBarSize={40} radius={[4, 4, 0, 0]} />
                
                {/* Line Total */}
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  name="Tổng" 
                  stroke="#60a5fa" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: "hsl(var(--card))", stroke: "#60a5fa", strokeWidth: 2 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
