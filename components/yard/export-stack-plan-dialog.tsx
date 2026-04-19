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
  Layers,
  AlertTriangle,
  CheckCircle2,
  Snowflake,
  AlertOctagon,
  Ship,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExportVessel, ExportContainer } from "@/lib/yard-types"
// We only need types, no runtime exports from yard-types
import { planExportStacking, type ExportStackPlan } from "@/lib/yard-utils"

interface ExportStackPlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  vessel: ExportVessel | null
}

export function ExportStackPlanDialog({
  open,
  onOpenChange,
  vessel,
}: ExportStackPlanDialogProps) {
  // Generate stack plans for the vessel
  const stackPlans = useMemo(() => {
    if (!vessel) return []
    
    // Group containers by POD for organized planning
    const containersByPOD: Record<string, ExportContainer[]> = {}
    for (const container of vessel.containers) {
      const pod = container.pod || "UNKNOWN"
      if (!containersByPOD[pod]) {
        containersByPOD[pod] = []
      }
      containersByPOD[pod].push(container)
    }
    
    // Generate plans for each POD group
    const allPlans: { pod: string; plans: ExportStackPlan[] }[] = []
    let bayOffset = 1
    
    for (const pod of vessel.pods) {
      const containers = containersByPOD[pod] || []
      if (containers.length > 0) {
        const plans = planExportStacking(containers, "B01", bayOffset, 1, 5)
        allPlans.push({ pod, plans })
        bayOffset += Math.ceil(containers.length / 5) + 1 // Move to next bay section
      }
    }
    
    return allPlans
  }, [vessel])

  if (!vessel) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Kế hoạch xếp bãi xuất (MOVINS Pre-Plan)
          </DialogTitle>
          <DialogDescription>
            Tàu: {vessel.name} - Chuyến: {vessel.voyageNo}
          </DialogDescription>
        </DialogHeader>

        {/* Vessel Summary */}
        <div className="bg-secondary/50 rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Ship className="w-5 h-5 text-primary" />
              <span className="font-bold">{vessel.name}</span>
              <Badge variant="outline">{vessel.voyageNo}</Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {vessel.totalContainers} container | {vessel.pods.length} POD
            </div>
          </div>
          
          {/* POD Summary */}
          <div className="flex flex-wrap gap-2">
            {vessel.pods.map((pod, idx) => (
              <Badge key={pod} variant="outline" className="gap-1">
                <span className="text-primary font-medium">{pod}</span>
                <span className="text-muted-foreground">
                  (Thứ tự xếp: {idx + 1})
                </span>
              </Badge>
            ))}
          </div>
        </div>

        {/* Stacking Rule Explanation */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-400 font-medium mb-2">
            <Layers className="w-4 h-4" />
            Quy tắc xếp hàng xuất (Reverse Loading Order)
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-500/30 border border-emerald-500" />
              <span>Thứ tự xếp thấp = Xếp <strong>TRÊN</strong> (xếp trước)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-secondary border border-border" />
              <span>Thứ tự xếp cao = Xếp <strong>DƯỚI</strong> (xếp sau)</span>
            </div>
          </div>
          <div className="text-xs text-blue-400/80 mt-2">
            Container xếp lên tàu trước (POD gần) được đặt trên cùng stack để không cần rehandle.
          </div>
        </div>

        {/* Stack Plans by POD */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-6 pr-4">
            {stackPlans.map(({ pod, plans }, podIndex) => (
              <div key={pod} className="space-y-3">
                {/* POD Header */}
                <div className="flex items-center gap-2 sticky top-0 bg-background py-2 border-b border-border">
                  <Badge className="bg-primary/20 text-primary border-primary/40">
                    POD: {pod}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Thứ tự xếp #{podIndex + 1} | {plans.reduce((sum, p) => sum + p.containers.length, 0)} container
                  </span>
                </div>

                {/* Stack Visualizations */}
                <div className="grid grid-cols-3 gap-4">
                  {plans.map((plan, planIndex) => (
                    <div
                      key={`${plan.block}-${plan.bay}-${plan.row}`}
                      className={cn(
                        "p-3 rounded-lg border-2",
                        plan.warnings.length > 0
                          ? "border-yellow-500/40 bg-yellow-500/10"
                          : "border-border bg-secondary/30"
                      )}
                    >
                      {/* Stack Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-sm">
                          {plan.block}-{String(plan.bay).padStart(2, "0")}-{String(plan.row).padStart(2, "0")}
                        </span>
                        {plan.isValid ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        )}
                      </div>

                      {/* Stack Visualization - TOP to BOTTOM */}
                      <div className="space-y-1">
                        <div className="text-[10px] text-muted-foreground text-center mb-1">TRÊN</div>
                        
                        {plan.containers.map(({ tier, container, loadFirst }) => (
                          <div
                            key={`${container.id}-${tier}`}
                            className={cn(
                              "p-2 rounded border text-xs",
                              loadFirst
                                ? "bg-emerald-500/20 border-emerald-500/40"
                                : "bg-secondary/50 border-border"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-[10px] text-muted-foreground">
                                  T{String(tier).padStart(2, "0")}
                                </span>
                                <span className={cn(
                                  "font-mono font-medium",
                                  loadFirst ? "text-emerald-400" : "text-foreground"
                                )}>
                                  {container.containerNo}
                                </span>
                              </div>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[8px] h-4 px-1",
                                  loadFirst ? "text-emerald-400" : "text-muted-foreground"
                                )}
                              >
                                #{container.loadSequence}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                              <span>{container.sizeType}</span>
                              <span>{((container.weight || 0) / 1000).toFixed(1)}T</span>
                              {container.specialType === "reefer" && (
                                <Snowflake className="w-2.5 h-2.5 text-cyan-400" />
                              )}
                              {container.specialType === "dg" && (
                                <AlertOctagon className="w-2.5 h-2.5 text-red-400" />
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Empty slots */}
                        {Array.from({ length: 5 - plan.containers.length }).map((_, i) => (
                          <div
                            key={`empty-${i}`}
                            className="p-2 rounded border border-dashed border-border/50 bg-secondary/20"
                          >
                            <div className="text-[10px] text-muted-foreground/50 text-center">
                              Trống
                            </div>
                          </div>
                        ))}
                        
                        <div className="text-[10px] text-muted-foreground text-center mt-1">DƯỚI</div>
                      </div>

                      {/* Warnings */}
                      {plan.warnings.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          {plan.warnings.map((warning, i) => (
                            <div key={i} className="flex items-center gap-1 text-[10px] text-yellow-400">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              {warning}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Validation Summary */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-muted-foreground">Tổng rehandle dự kiến khi xếp tàu: </span>
              <span className="font-bold text-emerald-400">0</span>
              <span className="text-muted-foreground"> (do xếp theo reverse order)</span>
            </div>
            <Button onClick={() => onOpenChange(false)}>
              Đóng
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="border-t border-border pt-3 mt-2">
          <p className="text-xs font-medium text-muted-foreground mb-2">Chú thích:</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
              <span className="text-muted-foreground">Xếp trước (TRÊN)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-secondary/50 border border-border" />
              <span className="text-muted-foreground">Xếp sau (DƯỚI)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[8px] h-4 px-1">#1</Badge>
              <span className="text-muted-foreground">Thứ tự xếp</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
