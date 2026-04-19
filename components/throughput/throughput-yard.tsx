"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Download,
  Upload,
  RefreshCw,
  Package,
} from "lucide-react"

const yardData = [
  { block: "C01", import20: 4, import40: 69, export20: 0, export40: 0, shifting: 1, total: 74 },
  { block: "B01", import20: 17, import40: 27, export20: 0, export40: 0, shifting: 0, total: 44 },
  { block: "B05", import20: 26, import40: 0, export20: 4, export40: 2, shifting: 7, total: 39 },
  { block: "A10", import20: 0, import40: 0, export20: 7, export40: 13, shifting: 18, total: 38 },
]

export function ThroughputYard({ isDayShift = true }: { isDayShift?: boolean }) {
  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-yellow-500/20 text-yellow-500 rounded">
              <Package className="h-5 w-5 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Sản lượng Yard</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {isDayShift ? "Ca ngày (07:00-19:00)" : "Ca đêm (19:00-07:00)"} - 17/4/2026
          </p>
        </div>
      </div>

      {/* Row 1: Small KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {/* Gate In */}
        <Card className="bg-card border-border hover:border-yellow-500/50 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg group-hover:bg-yellow-500/20 group-hover:scale-110 transition-all duration-300">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-medium group-hover:text-foreground transition-colors">Nhập bãi</p>
              <h2 className="text-2xl font-bold text-yellow-500">370</h2>
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
              <h2 className="text-2xl font-bold text-orange-500">117</h2>
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
              <h2 className="text-2xl font-bold text-purple-500">119</h2>
            </div>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="bg-blue-950/10 border-blue-900/40 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group">
          <CardContent className="p-4 flex items-center gap-4 h-full">
            <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 shadow-inner">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-blue-500/80 uppercase font-medium group-hover:text-blue-400 transition-colors">Tổng Yard</p>
              <h2 className="text-2xl font-bold text-blue-500 transition-transform origin-left group-hover:scale-105">606</h2>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Detail Grids */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Gate In Details */}
        <Card className="bg-card border-border hover:border-foreground/30 transition-colors">
          <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
            <div className="p-1.5 bg-yellow-500/10 text-yellow-500 rounded">
              <Download className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold">Chi tiết Nhập bãi</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 bg-muted/30 rounded-lg p-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">20&apos; Hàng</p>
                <div className="text-xl font-bold">71</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">20&apos; Vỏ</p>
                <div className="text-xl font-bold">64</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">40&apos; Hàng</p>
                <div className="text-xl font-bold">216</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">40&apos; Vỏ</p>
                <div className="text-xl font-bold">19</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gate Out Details */}
        <Card className="bg-card border-border hover:border-foreground/30 transition-colors">
          <CardHeader className="p-4 pb-0 flex flex-row items-center gap-2">
            <div className="p-1.5 bg-orange-500/10 text-orange-500 rounded">
              <Upload className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold">Chi tiết Xuất bãi</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 bg-muted/30 rounded-lg p-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">20&apos; Hàng</p>
                <div className="text-xl font-bold">37</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">20&apos; Vỏ</p>
                <div className="text-xl font-bold">2</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">40&apos; Hàng</p>
                <div className="text-xl font-bold">76</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium mb-1">40&apos; Vỏ</p>
                <div className="text-xl font-bold">2</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Block Table */}
      <Card className="bg-card border-border hover:border-foreground/30 transition-colors flex-1">
        <div className="p-4 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/10 text-blue-500 rounded">
              <Package className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm">Sản lượng theo Block</h3>
            <div className="px-2 py-0.5 bg-muted text-xs font-medium rounded-full text-muted-foreground">
              33 blocks
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="px-3 py-1.5 bg-muted/50 rounded-md font-medium cursor-pointer hover:bg-muted transition-colors">Tất cả</div>
            <div className="px-3 py-1.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors">A</div>
            <div className="px-3 py-1.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors">B</div>
            <div className="px-3 py-1.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors">C</div>
            <div className="px-3 py-1.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors">D</div>
            <div className="px-3 py-1.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors">E</div>
          </div>
        </div>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Block</th>
                  <th className="px-6 py-4 font-medium text-yellow-500/80">Nhập 20&apos;</th>
                  <th className="px-6 py-4 font-medium text-yellow-500/80">Nhập 40&apos;</th>
                  <th className="px-6 py-4 font-medium text-orange-500/80">Xuất 20&apos;</th>
                  <th className="px-6 py-4 font-medium text-orange-500/80">Xuất 40&apos;</th>
                  <th className="px-6 py-4 font-medium text-purple-500/80">Đảo</th>
                  <th className="px-6 py-4 font-medium text-right">Tổng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {yardData.map((row) => (
                  <tr key={row.block} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{row.block}</td>
                    <td className="px-6 py-4 font-medium text-yellow-500">{row.import20}</td>
                    <td className="px-6 py-4 font-medium text-yellow-500">{row.import40}</td>
                    <td className="px-6 py-4 font-medium text-orange-500">{row.export20}</td>
                    <td className="px-6 py-4 font-medium text-orange-500">{row.export40}</td>
                    <td className="px-6 py-4">
                      <span className="bg-purple-500/20 text-purple-400 px-2.5 py-1 rounded-md text-xs font-bold">
                        {row.shifting}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-right">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
