"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Truck,
  Factory,
  Caravan,
  CarFront,
  ChevronUp,
  Clock,
  Activity,
} from "lucide-react"

// Hourly data for the table
const hourlyTotal = [
  { time: "19:00", val: 70 },
  { time: "20:00", val: 174 },
  { time: "21:00", val: 227 },
  { time: "22:00", val: 211 },
  { time: "23:00", val: 121 },
  { time: "00:00", val: 0 },
  { time: "01:00", val: 0 },
  { time: "02:00", val: 0 },
  { time: "03:00", val: 0 },
  { time: "04:00", val: 0 },
  { time: "05:00", val: 0 },
  { time: "06:00", val: 0 },
]

const sts01Hourly = [
  { time: "19h", val: 15 },
  { time: "20h", val: 31 },
  { time: "21h", val: 34 },
  { time: "22h", val: 43 },
  { time: "23h", val: 23 },
  { time: "00h", val: 0 },
  { time: "01h", val: 0 },
  { time: "02h", val: 0 },
  { time: "03h", val: 0 },
  { time: "04h", val: 0 },
  { time: "05h", val: 0 },
  { time: "06h", val: 0 },
]

export function ThroughputEquipment() {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* Row 1: KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* STS Cranes */}
        <Card className="bg-blue-950/20 border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group rounded-xl">
          <CardContent className="p-5 flex justify-between">
            <div className="flex flex-col">
              <div className="p-2.5 bg-blue-500/20 text-blue-500 rounded-lg w-fit mb-3">
                <Factory className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-white">STS Cranes</p>
              <p className="text-xs text-muted-foreground mt-0.5">6 thiết bị hoạt động</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-right">803</h2>
            </div>
          </CardContent>
        </Card>

        {/* RTG */}
        <Card className="bg-card border-border hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 cursor-pointer group rounded-xl">
          <CardContent className="p-5 flex justify-between">
            <div className="flex flex-col">
              <div className="p-2.5 bg-cyan-500/10 text-cyan-500 rounded-lg w-fit mb-3">
                <Factory className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-white">RTG</p>
              <p className="text-xs text-muted-foreground mt-0.5">20 thiết bị hoạt động</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-right">1290</h2>
            </div>
          </CardContent>
        </Card>

        {/* Reach Stacker */}
        <Card className="bg-card border-border hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 cursor-pointer group rounded-xl">
          <CardContent className="p-5 flex justify-between">
            <div className="flex flex-col">
              <div className="p-2.5 bg-orange-500/10 text-orange-500 rounded-lg w-fit mb-3">
                <Caravan className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-white">Reach Stacker</p>
              <p className="text-xs text-muted-foreground mt-0.5">3 thiết bị hoạt động</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-right">161</h2>
            </div>
          </CardContent>
        </Card>

        {/* Terminal Truck */}
        <Card className="bg-card border-border hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 cursor-pointer group rounded-xl">
          <CardContent className="p-5 flex justify-between">
            <div className="flex flex-col">
              <div className="p-2.5 bg-red-500/10 text-red-500 rounded-lg w-fit mb-3">
                <Truck className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-white">Terminal Truck</p>
              <p className="text-xs text-muted-foreground mt-0.5">37 thiết bị hoạt động</p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white group-hover:scale-105 transition-transform origin-right">814</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pr-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> Last updated: N/A</p>
      </div>

      {/* Filter Tabs */}
      <Card className="bg-card/50 border-border">
        <CardContent className="p-0 flex items-center divide-x divide-border/50 text-sm font-medium">
          <div className="px-6 py-3 flex items-center gap-3 bg-muted/40 cursor-pointer text-white">
            <Factory className="h-4 w-4 text-blue-500" />
            STS <span className="bg-muted px-2 py-0.5 rounded-full text-xs text-muted-foreground">803</span>
          </div>
          <div className="px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/40 text-muted-foreground hover:text-white transition-colors">
            <Factory className="h-4 w-4 text-cyan-500" />
            RTG <span className="bg-muted px-2 py-0.5 rounded-full text-xs">1290</span>
          </div>
          <div className="px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/40 text-muted-foreground hover:text-white transition-colors">
            <Caravan className="h-4 w-4 text-orange-500" />
            RS <span className="bg-muted px-2 py-0.5 rounded-full text-xs">161</span>
          </div>
          <div className="px-6 py-3 flex items-center gap-3 cursor-pointer hover:bg-muted/40 text-muted-foreground hover:text-white transition-colors">
            <Truck className="h-4 w-4 text-red-500" />
            TT <span className="bg-muted px-2 py-0.5 rounded-full text-xs">814</span>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Table */}
      <Card className="bg-card border-border">
        <CardHeader className="p-4 border-b border-border/50">
          <CardTitle className="text-base font-semibold text-white">Sản lượng theo giờ - STS Cranes</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-center min-w-[800px]">
            <thead className="text-xs text-muted-foreground bg-muted/20 border-b border-border/50">
              <tr>
                <th className="px-4 py-4 text-left font-medium text-white w-32 pl-6">Giờ</th>
                {hourlyTotal.map((item) => (
                  <th key={item.time} className="px-2 py-4 font-medium">{item.time}</th>
                ))}
                <th className="px-4 py-4 font-medium text-white">Tổng</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-6 py-5 text-left font-semibold text-white">Tổng cộng</td>
                {hourlyTotal.map((item, idx) => (
                  <td key={idx} className="px-2 py-5 pl-[8px]">
                    {item.val > 0 ? (
                      <span className="bg-blue-600 border-2 border-blue-500/50 text-white px-3 py-1.5 rounded-full text-xs font-bold inline-block min-w-[36px] text-center shadow-lg shadow-blue-500/20">
                        {item.val}
                      </span>
                    ) : (
                      <span className="text-muted-foreground px-3 py-1 inline-block font-medium">0</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-5 pl-[4px]">
                  <span className="bg-blue-600 border-2 border-blue-500/50 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-blue-500/20 inline-block min-w-[40px] text-center">803</span>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Details Section */}
      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-white">Chi tiết từng thiết bị</h3>
        
        {/* Active Accordion Item */}
        <Card className="bg-card border border-border overflow-hidden">
          {/* Item Header */}
          <div className="flex items-center justify-between p-4 bg-muted/10 cursor-pointer hover:bg-muted/20 transition-colors border-b border-border/50 py-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-500/20 text-blue-500 rounded">
                <Factory className="h-5 w-5" />
              </div>
              <span className="font-bold text-white text-base">STS01</span>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center">
                <span className="font-bold text-white">146</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">moves</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-blue-400">35.9</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">cmph</span>
              </div>
              <div className="text-xs text-white bg-slate-800 px-2.5 py-1 rounded-md font-medium font-mono">D: 146</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                19:32 - 23:36
              </div>
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          
          {/* Expanded Content */}
          <div className="p-5 flex flex-col gap-6">
            {/* Stats Grid inside Body */}
            <div className="grid grid-cols-6 divide-x divide-border/50 border border-border/50 rounded-lg overflow-hidden bg-muted/10">
              <div className="flex flex-col items-center py-4 hover:bg-card/50 transition-colors">
                <span className="font-bold text-white text-lg">53</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">20ft</span>
              </div>
              <div className="flex flex-col items-center py-4 hover:bg-card/50 transition-colors">
                <span className="font-bold text-white text-lg">93</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">40ft</span>
              </div>
              <div className="flex flex-col items-center py-4 hover:bg-card/50 transition-colors">
                <span className="font-bold text-white text-lg">146</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">Discharge</span>
              </div>
              <div className="flex flex-col items-center py-4 hover:bg-card/50 transition-colors">
                <span className="font-bold text-white text-lg">0</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">Load</span>
              </div>
              <div className="flex flex-col items-center py-4 hover:bg-card/50 transition-colors">
                <span className="font-bold text-white text-lg">0</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">Receival</span>
              </div>
              <div className="flex flex-col items-center py-4 hover:bg-card/50 transition-colors">
                <span className="font-bold text-white text-lg">0</span>
                <span className="text-xs text-muted-foreground mt-1 text-center">Delivery</span>
              </div>
            </div>

            {/* Timeline Row */}
            <div className="overflow-x-auto pb-2">
              <table className="w-full text-xs text-center min-w-[700px]">
                <thead className="text-muted-foreground border-b border-border/50">
                  <tr>
                    {sts01Hourly.map(th => (
                      <th key={th.time} className="pb-3 font-normal">{th.time}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {sts01Hourly.map((td, idx) => (
                      <td key={idx} className="pt-4">
                        {td.val > 0 ? (
                           <span className="bg-blue-600/20 text-blue-400 px-3 py-1.5 rounded-full font-bold inline-block min-w-[32px] text-center border border-blue-500/20 shadow-sm shadow-blue-500/10">
                           {td.val}
                           </span>
                        ) : (
                          <span className="text-muted-foreground font-medium">0</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            
          </div>
        </Card>
      </div>

    </div>
  )
}
