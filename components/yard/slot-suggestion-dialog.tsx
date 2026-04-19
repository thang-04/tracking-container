"use client"

import { useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  MapPin,
  Star,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  Package,
  Weight,
  Anchor,
  Snowflake,
  AlertOctagon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Container, YardBlock } from "@/lib/yard-types"
import { getPositionCode } from "@/lib/yard-types"
import { findBestSlots, type SlotRecommendation } from "@/lib/yard-optimizer"

interface SlotSuggestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  container: Container | null
  blocks: YardBlock[]
  onSelectSlot: (recommendation: SlotRecommendation) => void
}

export function SlotSuggestionDialog({
  open,
  onOpenChange,
  container,
  blocks,
  onSelectSlot,
}: SlotSuggestionDialogProps) {
  // Calculate slot recommendations
  const recommendations = useMemo(() => {
    if (!container) return []
    
    return findBestSlots(blocks, container, 5)
  }, [container, blocks])

  const getBadgeVariant = (score: number, index: number) => {
    if (index === 0) {
      return {
        className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
        label: "Tốt nhất",
        icon: Star,
      }
    }
    if (score >= 80) {
      return {
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        label: "Tốt",
        icon: CheckCircle2,
      }
    }
    if (score >= 50) {
      return {
        className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
        label: "Chấp nhận",
        icon: CheckCircle2,
      }
    }
    return {
      className: "bg-orange-500/10 text-orange-400 border-orange-500/30",
      label: "Cảnh báo",
      icon: AlertTriangle,
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400"
    if (score >= 50) return "text-yellow-400"
    return "text-orange-400"
  }

  if (!container) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Gợi ý vị trí bãi (Auto-Slotting)
          </DialogTitle>
          <DialogDescription>
            Hệ thống đề xuất vị trí tối ưu cho container dựa trên quy tắc xếp dỡ
          </DialogDescription>
        </DialogHeader>

        {/* Container Info */}
        <div className="bg-secondary/50 rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-primary" />
              <span className="font-mono font-bold text-lg">{container.containerNo}</span>
              {container.specialType === "reefer" && (
                <Badge variant="outline" className="text-cyan-400 border-cyan-500/40">
                  <Snowflake className="w-3 h-3 mr-1" />
                  Reefer
                </Badge>
              )}
              {container.specialType === "dg" && (
                <Badge variant="outline" className="text-red-400 border-red-500/40">
                  <AlertOctagon className="w-3 h-3 mr-1" />
                  DG
                </Badge>
              )}
            </div>
            <Badge variant="outline">{container.sizeType}</Badge>
          </div>
          
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Trọng lượng:</span>
              <div className="flex items-center gap-1 font-medium">
                <Weight className="w-3 h-3" />
                {((container.weight || 0) / 1000).toFixed(1)}T
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Cảng đích:</span>
              <div className="font-medium">{container.pod || container.destination || "-"}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Vị trí tàu:</span>
              <div className="font-mono text-xs">
                B{container.vesselBay}-R{container.vesselRow}-T{container.vesselTier}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Chuyến:</span>
              <div className="flex items-center gap-1 font-mono text-xs">
                <Anchor className="w-3 h-3" />
                {container.tripId || "-"}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Đề xuất {recommendations.length} vị trí (xếp theo điểm):
          </h4>
          
          <ScrollArea className="h-[320px]">
            <div className="space-y-2 pr-4">
              {recommendations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>Không tìm thấy vị trí phù hợp.</p>
                  <p className="text-sm">Bãi có thể đã đầy hoặc không có khu vực phù hợp.</p>
                </div>
              ) : (
                recommendations.map((rec, index) => {
                  const badge = getBadgeVariant(rec.score, index)
                  const BadgeIcon = badge.icon

                  return (
                    <div
                      key={`${rec.block}-${rec.bay}-${rec.row}-${rec.tier}`}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all cursor-pointer",
                        "hover:border-primary/50 hover:bg-primary/5",
                        index === 0
                          ? "border-emerald-500/50 bg-emerald-500/10"
                          : "border-border bg-secondary/30"
                      )}
                      onClick={() => onSelectSlot(rec)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <MapPin className={cn(
                            "w-5 h-5",
                            index === 0 ? "text-emerald-400" : "text-muted-foreground"
                          )} />
                          <span className="font-mono font-bold text-lg">
                            {getPositionCode(rec.block, rec.bay, rec.row, rec.tier)}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={badge.className}>
                            <BadgeIcon className="w-3 h-3 mr-1" />
                            {badge.label}
                          </Badge>
                          <span className={cn(
                            "text-xl font-bold",
                            getScoreColor(rec.score)
                          )}>
                            {rec.score}%
                          </span>
                        </div>
                      </div>

                      {/* Reasons - Positive factors */}
                      {rec.reasons.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {rec.reasons.map((reason, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              {reason}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Warnings */}
                      {rec.warnings.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {rec.warnings.map((warning, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs text-yellow-400">
                              <AlertTriangle className="w-3 h-3" />
                              {warning}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Rehandle Impact */}
                      {rec.expectedRehandle > 0 && (
                        <div className="flex items-center gap-1 text-xs text-orange-400 mb-3">
                          <RotateCcw className="w-3 h-3" />
                          Rehandle dự kiến: {rec.expectedRehandle} lần
                        </div>
                      )}

                      {/* Select Button */}
                      <Button
                        size="sm"
                        variant={index === 0 ? "default" : "outline"}
                        className="w-full gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectSlot(rec)
                        }}
                      >
                        Chọn vị trí này
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Scoring Legend */}
        <div className="border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Quy tắc chấm điểm:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div>+50 Không phát sinh rehandle</div>
            <div>-40 Mỗi container bị block</div>
            <div>+30 Đúng quy tắc trọng lượng</div>
            <div>-20 Sai trọng lượng</div>
            <div>+20 Cùng POD/nhóm</div>
            <div>-10 Sai zone</div>
            <div>+10 Đúng zone / gần khu thao tác</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
