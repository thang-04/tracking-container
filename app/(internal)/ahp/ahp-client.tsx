"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Progress } from "@/components/ui/progress"
import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { Scale, Calculator, Award, RefreshCw, Info, CheckCircle2 } from "lucide-react"

import type { AHPCriterion, AHPComparisonScale } from "@/lib/ahp/get-ahp-data"

interface ComparisonMatrix {
  [key: string]: { [key: string]: string }
}

interface AHPClientProps {
  criteria: AHPCriterion[]
  scales: AHPComparisonScale[]
}

export function AHPClient({ criteria, scales }: AHPClientProps) {
  const [matrix, setMatrix] = useState<ComparisonMatrix>(() => {
    const initial: ComparisonMatrix = {}
    criteria.forEach((c1) => {
      initial[c1.id] = {}
      criteria.forEach((c2) => {
        initial[c1.id][c2.id] = c1.id === c2.id ? "1" : "1"
      })
    })
    return initial
  })

  const [weights, setWeights] = useState<{ id: string; name: string; weight: number }[]>([])
  const [rankings, setRankings] = useState<{ id: string; name: string; score: number }[]>([])
  const [consistencyRatio, setConsistencyRatio] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const updateComparison = (row: string, col: string, value: string) => {
    setMatrix((prev) => ({
      ...prev,
      [row]: {
        ...prev[row],
        [col]: value,
      },
    }))
  }

  const calculateWeights = () => {
    setIsCalculating(true)
    
    setTimeout(() => {
      // Simulated AHP calculation results
      // In a real implementation, this would be computed by a mathematical library
      const calculatedWeights = [
        { id: "cost", name: "Chi phí", weight: 0.32 },
        { id: "time", name: "Thời gian", weight: 0.28 },
        { id: "reliability", name: "Độ tin cậy", weight: 0.22 },
        { id: "capacity", name: "Công suất", weight: 0.11 },
        { id: "flexibility", name: "Linh hoạt", weight: 0.07 },
      ].filter(w => criteria.some(c => c.id === w.id))

      const calculatedRankings = [
        { id: "a1", name: "Tuyến A: HP-HN Trực tiếp", score: 0.42 },
        { id: "a3", name: "Tuyến C: HP-HN qua Cảng cạn 2", score: 0.28 },
        { id: "a2", name: "Tuyến B: HP-HN qua Cảng cạn 1", score: 0.18 },
        { id: "a4", name: "Tuyến D: Đa phương thức", score: 0.12 },
      ]

      setWeights(calculatedWeights)
      setRankings(calculatedRankings)
      setConsistencyRatio(0.045)
      setIsCalculating(false)
    }, 1500)
  }

  const resetAll = () => {
    const initial: ComparisonMatrix = {}
    criteria.forEach((c1) => {
      initial[c1.id] = {}
      criteria.forEach((c2) => {
        initial[c1.id][c2.id] = c1.id === c2.id ? "1" : "1"
      })
    })
    setMatrix(initial)
    setWeights([])
    setRankings([])
    setConsistencyRatio(null)
  }

  const pieChartData = weights.map((w) => ({
    name: w.name,
    value: Math.round(w.weight * 100),
  }))

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <DashboardLayout
      title="Hỗ trợ quyết định AHP"
      description="Phân tích thứ bậc AHP cho việc lựa chọn tuyến đường và chiến lược"
    >
      <div className="grid gap-6 lg:grid-cols-2 mt-6">
        {/* Criteria Comparison Matrix */}
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Scale className="h-5 w-5" />
                  Ma trận so sánh tiêu chí
                </CardTitle>
                <CardDescription>
                  So sánh mức độ quan trọng tương đối của từng cặp tiêu chí
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetAll}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Đặt lại
                </Button>
                <Button onClick={calculateWeights} disabled={isCalculating || criteria.length === 0}>
                  {isCalculating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Đang tính...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Tính trọng số
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {criteria.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                Chưa có tiêu chí nào được định nghĩa trong hệ thống.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-medium">Tiêu chí</TableHead>
                      {criteria.map((c) => (
                        <TableHead key={c.id} className="text-center font-medium">
                          {c.name}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {criteria.map((row, rowIndex) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        {criteria.map((col, colIndex) => (
                          <TableCell key={col.id} className="text-center">
                            {rowIndex === colIndex ? (
                              <span className="text-muted-foreground">1</span>
                            ) : rowIndex < colIndex ? (
                              <Select
                                value={matrix[row.id]?.[col.id] || "1"}
                                onValueChange={(value) => updateComparison(row.id, col.id, value)}
                              >
                                <SelectTrigger className="h-8 w-20 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {scales.map((scale) => (
                                    <SelectItem key={scale.value} value={scale.value}>
                                      {scale.value}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                {matrix[col.id]?.[row.id] === "1" ? "1" :
                                 matrix[col.id]?.[row.id]?.startsWith("1/") 
                                  ? matrix[col.id][row.id].split("/")[1]
                                  : `1/${matrix[col.id]?.[row.id]}`}
                              </span>
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Consistency Check */}
            {consistencyRatio !== null && (
              <div className="mt-4 flex items-center gap-4 rounded-lg bg-muted/50 p-4">
                <Info className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    Tỷ lệ nhất quán: {(consistencyRatio * 100).toFixed(2)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {consistencyRatio < 0.1 ? (
                      <span className="text-green-600 font-medium">Mức nhất quán chấp nhận được (CR {"<"} 10%)</span>
                    ) : (
                      <span className="text-destructive">Đánh giá không nhất quán. Vui lòng xem lại các so sánh.</span>
                    )}
                  </p>
                </div>
                {consistencyRatio < 0.1 && (
                  <CheckCircle2 className="ml-auto h-5 w-5 text-green-600" />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Criteria Weights */}
        {weights.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-medium">Trọng số tiêu chí</CardTitle>
              <CardDescription>Mức độ quan trọng tương đối của từng tiêu chí</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                      labelLine={false}
                    >
                      {pieChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        color: "hsl(var(--foreground))",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 space-y-3">
                {weights.map((w, index) => (
                  <div key={w.id} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="flex-1 text-sm">{w.name}</span>
                    <span className="font-momo text-sm font-medium">
                      {(w.weight * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alternative Rankings */}
        {rankings.length > 0 && (
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Award className="h-5 w-5" />
                Xếp hạng phương án
              </CardTitle>
              <CardDescription>Điểm số cuối cùng và đề xuất</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {rankings.map((alt, index) => (
                  <div
                    key={alt.id}
                    className={`rounded-lg border p-4 ${
                      index === 0
                        ? "border-green-500/50 bg-green-500/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            index === 0
                              ? "bg-green-600 text-white"
                              : index === 1
                              ? "bg-blue-600/20 text-blue-600"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{alt.name}</p>
                          {index === 0 && (
                            <Badge className="mt-1 bg-green-600 text-white hover:bg-green-700">
                              Đề xuất
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{(alt.score * 100).toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">Điểm ưu tiên</p>
                      </div>
                    </div>
                    <Progress
                      value={alt.score * 100}
                      className={`mt-3 h-2 ${index === 0 ? "[&>div]:bg-green-600" : ""}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {weights.length === 0 && (
          <Card className="border-border/50 border-dashed lg:col-span-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="rounded-lg bg-muted p-4">
                <Scale className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-foreground">Chưa có kết quả</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Điền ma trận so sánh ở trên và nhấn<br />
                {'"Tính trọng số"'} để xem kết quả phân tích AHP.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
