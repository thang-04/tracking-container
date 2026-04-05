"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Play, Settings2, RotateCcw, Download, TrendingUp, Zap } from "lucide-react"

interface SimulationResult {
  scenario: string
  totalTime: number
  totalCost: number
  efficiency: number
  trucksUsed: number
  avgWaitTime: number
}

const initialResults: SimulationResult[] = []

export default function SimulationPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<SimulationResult[]>(initialResults)
  
  // Simulation parameters
  const [containers, setContainers] = useState(50)
  const [trucks, setTrucks] = useState(20)
  const [demandVariability, setDemandVariability] = useState([30])
  const [selectedRoute, setSelectedRoute] = useState("all")

  const runSimulation = () => {
    setIsRunning(true)
    setProgress(0)
    setResults([])

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRunning(false)
          // Generate results
          setResults([
            {
              scenario: "Chiến lược hiện tại",
              totalTime: 248,
              totalCost: 45600000,
              efficiency: 78,
              trucksUsed: trucks,
              avgWaitTime: 2.5,
            },
            {
              scenario: "Tối ưu A",
              totalTime: 195,
              totalCost: 38200000,
              efficiency: 89,
              trucksUsed: trucks - 2,
              avgWaitTime: 1.8,
            },
            {
              scenario: "Tối ưu B",
              totalTime: 210,
              totalCost: 35800000,
              efficiency: 85,
              trucksUsed: trucks - 4,
              avgWaitTime: 2.1,
            },
            {
              scenario: "Hiệu quả tối đa",
              totalTime: 185,
              totalCost: 42100000,
              efficiency: 94,
              trucksUsed: trucks + 2,
              avgWaitTime: 1.2,
            },
          ])
          return 100
        }
        return prev + 2
      })
    }, 100)
  }

  const resetSimulation = () => {
    setProgress(0)
    setResults([])
  }

  const chartData = results.map((r) => ({
    name: r.scenario,
    "Thời gian (giờ)": r.totalTime,
    "Chi phí (Tr.đ)": r.totalCost / 1000000,
    "Hiệu suất (%)": r.efficiency,
  }))

  const bestResult = results.length > 0 
    ? results.reduce((best, current) => 
        current.efficiency > best.efficiency ? current : best
      )
    : null

  return (
    <DashboardLayout
      title="Mô phỏng & Lập kế hoạch"
      description="Chạy mô phỏng để tối ưu hóa hoạt động vận tải"
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Parameters Panel */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings2 className="h-5 w-5" />
              Tham số mô phỏng
            </CardTitle>
            <CardDescription>Cấu hình các thiết lập mô phỏng</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="containers">Số lượng Container</Label>
              <Input
                id="containers"
                type="number"
                value={containers}
                onChange={(e) => setContainers(Number(e.target.value))}
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trucks">Xe tải khả dụng</Label>
              <Input
                id="trucks"
                type="number"
                value={trucks}
                onChange={(e) => setTrucks(Number(e.target.value))}
                className="bg-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label>Lựa chọn tuyến đường</Label>
              <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                <SelectTrigger className="bg-secondary">
                  <SelectValue placeholder="Chọn tuyến" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tuyến</SelectItem>
                  <SelectItem value="hp-hn">Hải Phòng - Hà Nội</SelectItem>
                  <SelectItem value="dn-hcm">Đà Nẵng - TP.HCM</SelectItem>
                  <SelectItem value="hp-dn">Hải Phòng - Đà Nẵng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Biến động nhu cầu</Label>
                <span className="text-sm text-muted-foreground">{demandVariability[0]}%</span>
              </div>
              <Slider
                value={demandVariability}
                onValueChange={setDemandVariability}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={runSimulation} disabled={isRunning} className="flex-1">
                {isRunning ? (
                  <>Đang chạy...</>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Chạy mô phỏng
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetSimulation} disabled={isRunning}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {isRunning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Đang xử lý...</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="space-y-6 lg:col-span-2">
          {/* Best Result Highlight */}
          {bestResult && (
            <Card className="border-success/50 bg-success/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-lg bg-success/10 p-3">
                      <Zap className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Chiến lược đề xuất</p>
                      <p className="text-lg font-semibold">{bestResult.scenario}</p>
                    </div>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    {bestResult.efficiency}% Hiệu suất
                  </Badge>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-4">
                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Tổng thời gian</p>
                    <p className="text-lg font-bold">{bestResult.totalTime} giờ</p>
                  </div>
                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Tổng chi phí</p>
                    <p className="text-lg font-bold">{(bestResult.totalCost / 1000000).toFixed(1)} Tr.đ</p>
                  </div>
                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Số xe sử dụng</p>
                    <p className="text-lg font-bold">{bestResult.trucksUsed}</p>
                  </div>
                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Thời gian chờ TB</p>
                    <p className="text-lg font-bold">{bestResult.avgWaitTime} giờ</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Chart */}
          {results.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-medium">So sánh kịch bản</CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Xuất báo cáo
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="name"
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
                      <Legend />
                      <Bar dataKey="Thời gian (giờ)" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Chi phí (Tr.đ)" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Hiệu suất (%)" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Kết quả chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-medium">Kịch bản</TableHead>
                        <TableHead className="font-medium text-right">Thời gian (giờ)</TableHead>
                        <TableHead className="font-medium text-right">Chi phí (VNĐ)</TableHead>
                        <TableHead className="font-medium text-right">Hiệu suất</TableHead>
                        <TableHead className="font-medium text-right">Số xe</TableHead>
                        <TableHead className="font-medium text-right">Chờ TB</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result, index) => (
                        <TableRow key={index} className="hover:bg-muted/30">
                          <TableCell className="font-medium">{result.scenario}</TableCell>
                          <TableCell className="text-right">{result.totalTime}</TableCell>
                          <TableCell className="text-right">
                            {result.totalCost.toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              className={
                                result.efficiency >= 90
                                  ? "bg-success/10 text-success"
                                  : result.efficiency >= 80
                                  ? "bg-warning/10 text-warning"
                                  : "bg-destructive/10 text-destructive"
                              }
                            >
                              {result.efficiency}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{result.trucksUsed}</TableCell>
                          <TableCell className="text-right">{result.avgWaitTime} giờ</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {results.length === 0 && !isRunning && (
            <Card className="border-border/50 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-lg bg-muted p-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-medium">Chưa có kết quả mô phỏng</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  Cấu hình các tham số và chạy mô phỏng để xem<br />
                  kết quả so sánh và đề xuất tối ưu hóa.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
