"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, Container, Percent, AlertTriangle, LayoutGrid, Snowflake, TrendingUp, CheckCircle2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { YardBlock } from "@/lib/yard-types"
import { calculateBlockStats, getScoreLevelColors } from "@/lib/yard-scoring"

interface YardStatsProps {
  totalCapacity: number
  usedCapacity: number
  occupancyRate: number
  importCount: number
  exportCount: number
  holdCount: number
  reeferCount: number
  dgCount: number
  blocks?: YardBlock[]
}

export function YardStats({
  totalCapacity,
  usedCapacity,
  occupancyRate,
  importCount,
  exportCount,
  holdCount,
  reeferCount,
  dgCount,
  blocks = [],
}: YardStatsProps) {
  // Calculate overall yard quality score
  const blockScores = blocks.map(block => calculateBlockStats(block))
  const totalStacks = blockScores.reduce((a, b) => a + b.totalStacks, 0)
  const optimalStacks = blockScores.reduce((a, b) => a + b.optimalStacks, 0)
  const acceptableStacks = blockScores.reduce((a, b) => a + b.acceptableStacks, 0)
  const suboptimalStacks = blockScores.reduce((a, b) => a + b.suboptimalStacks, 0)
  const criticalStacks = blockScores.reduce((a, b) => a + b.criticalStacks, 0)
  const averageScore = totalStacks > 0 
    ? Math.round(blockScores.reduce((a, b) => a + b.averageScore * b.totalStacks, 0) / totalStacks)
    : 100

  const stats = [
    {
      label: "Sức chứa",
      value: `${totalCapacity}`,
      unit: "TEU",
      icon: LayoutGrid,
      color: "text-primary",
    },
    {
      label: "Đã sử dụng",
      value: `${usedCapacity}`,
      unit: "TEU",
      icon: Package,
      color: "text-blue-400",
      subLabel: `Đã dùng: ${usedCapacity} / Tối đa: ${totalCapacity}`,
    },
    {
      label: "Còn trống",
      value: `${totalCapacity - usedCapacity}`,
      unit: "TEU",
      icon: Container,
      color: "text-emerald-400",
    },
    {
      label: "Tỷ lệ lấp đầy",
      value: `${occupancyRate}`,
      unit: "%",
      icon: Percent,
      color: occupancyRate > 85 ? "text-red-400" : occupancyRate > 70 ? "text-yellow-400" : "text-emerald-400",
    },
  ]

  const breakdownStats = [
    { label: "Nhập", value: importCount, color: "text-blue-400" },
    { label: "Xuất", value: exportCount, color: "text-green-400" },
    { label: "Giữ", value: holdCount, color: "text-yellow-400", icon: AlertTriangle },
    { label: "Lạnh", value: reeferCount, color: "text-cyan-400", icon: Snowflake },
    { label: "HH", value: dgCount, color: "text-red-400", icon: AlertTriangle },
  ]

  // Determine overall yard quality level
  const qualityLevel = averageScore >= 80 ? "optimal" 
    : averageScore >= 50 ? "acceptable" 
    : averageScore >= 20 ? "suboptimal" 
    : "critical"
  const qualityColors = getScoreLevelColors(qualityLevel)

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="pt-4 pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className={cn("text-2xl font-bold tracking-tight", stat.color)}>
                    {stat.value}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {stat.unit}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
                <stat.icon className={cn("w-5 h-5", stat.color, "opacity-60")} />
              </div>
              {stat.label === "Tỷ lệ lấp đầy" && (
                <div className="mt-3">
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        occupancyRate > 85 ? "bg-red-500" : occupancyRate > 70 ? "bg-yellow-500" : "bg-emerald-500"
                      )}
                      style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Yard Quality Score - Soft Constraint Scoring */}
      {blocks.length > 0 && (
        <Card className={cn("border-2", qualityColors.border, qualityColors.bg)}>
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", qualityColors.bg)}>
                  <TrendingUp className={cn("w-5 h-5", qualityColors.text)} />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Chất lượng sắp xếp bãi</div>
                  <div className={cn("text-2xl font-bold", qualityColors.text)}>
                    {averageScore}%
                    <span className="text-sm font-normal ml-2">
                      {qualityLevel === "optimal" && "Tốt"}
                      {qualityLevel === "acceptable" && "Chấp nhận được"}
                      {qualityLevel === "suboptimal" && "Cần cải thiện"}
                      {qualityLevel === "critical" && "Cần xử lý ngay"}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Stack quality distribution */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div className="text-xs">
                    <span className="text-emerald-400 font-bold">{optimalStacks + acceptableStacks}</span>
                    <span className="text-muted-foreground"> stack đạt chuẩn</span>
                  </div>
                </div>
                {suboptimalStacks > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <div className="text-xs">
                      <span className="text-orange-400 font-bold">{suboptimalStacks}</span>
                      <span className="text-muted-foreground"> cần cải thiện</span>
                    </div>
                  </div>
                )}
                {criticalStacks > 0 && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <div className="text-xs">
                      <span className="text-red-400 font-bold">{criticalStacks}</span>
                      <span className="text-muted-foreground"> nghiêm trọng</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quality bar */}
            <div className="mt-3 flex gap-0.5 h-2 rounded-full overflow-hidden">
              {optimalStacks > 0 && (
                <div 
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${(optimalStacks / totalStacks) * 100}%` }}
                />
              )}
              {acceptableStacks > 0 && (
                <div 
                  className="bg-yellow-500 transition-all"
                  style={{ width: `${(acceptableStacks / totalStacks) * 100}%` }}
                />
              )}
              {suboptimalStacks > 0 && (
                <div 
                  className="bg-orange-500 transition-all"
                  style={{ width: `${(suboptimalStacks / totalStacks) * 100}%` }}
                />
              )}
              {criticalStacks > 0 && (
                <div 
                  className="bg-red-500 transition-all"
                  style={{ width: `${(criticalStacks / totalStacks) * 100}%` }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breakdown Stats */}
      <div className="flex items-center gap-6 px-2">
        {breakdownStats.map((stat) => (
          <div key={stat.label} className="flex items-center gap-2">
            {stat.icon && <stat.icon className={cn("w-3.5 h-3.5", stat.color)} />}
            <span className="text-sm text-muted-foreground">{stat.label}:</span>
            <span className={cn("text-sm font-bold", stat.color)}>{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
