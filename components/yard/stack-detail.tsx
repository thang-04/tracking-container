"use client"

import { cn } from "@/lib/utils"
import type { Stack, YardBlock } from "@/lib/yard-types"
import { getPositionCode, calculateRehandleForContainer, dischargeStatusLabels, dischargeStatusColors } from "@/lib/yard-types"
import { Package, Weight, Ship, Calendar, RotateCcw, Snowflake, AlertOctagon, MapPin, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface StackDetailProps {
  stack: Stack
  block: YardBlock
  targetContainerId?: string
}

// Check if a container is blocking others below it
function isContainerBlocking(stack: Stack, tierNum: number): boolean {
  const tierSlot = stack.tiers.find(t => t.tier === tierNum)
  if (!tierSlot?.container) return false
  
  const containersBelow = stack.tiers
    .filter(t => t.tier < tierNum && t.container)
    .map(t => t.container!)
  
  if (containersBelow.length === 0) return false
  
  const currentContainer = tierSlot.container
  if (!currentContainer.etd) return false
  
  for (const below of containersBelow) {
    if (below.etd && below.etd < currentContainer.etd) {
      return true
    }
    if (below.status === "customs_hold") {
      return true
    }
  }
  
  return false
}

export function StackDetail({ stack, block, targetContainerId }: StackDetailProps) {
  // Sort tiers from top to bottom for display (highest tier first)
  const sortedTiers = [...stack.tiers].sort((a, b) => b.tier - a.tier)
  const containerCount = stack.tiers.filter(t => t.container !== null).length
  const maxTiers = block.maxTiers

  // Calculate blocking issues
  const blockingContainers = stack.tiers.filter(t => 
    t.container && isContainerBlocking(stack, t.tier)
  )

  return (
    <div className="space-y-5">
      {/* Stack Header */}
      <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-mono text-lg font-bold text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {block.id}-{String(stack.bay).padStart(2, "0")}-{String(stack.row).padStart(2, "0")}
            </h3>
            <p className="text-sm text-muted-foreground">
              Bay {stack.bay}, Row {stack.row}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium">
              <span className="text-foreground">Đang dùng: {containerCount}</span>
              <span className="text-muted-foreground"> / Tổng: {maxTiers}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Còn trống: {maxTiers - containerCount} tầng
            </p>
          </div>
        </div>

        {/* Only show warning if there ARE blocking issues */}
        {blockingContainers.length > 0 && (
          <div className="rounded-lg p-3 bg-orange-500/10 border border-orange-500/30">
            <div className="flex items-center gap-2 text-orange-400">
              <RotateCcw className="w-4 h-4" />
              <span className="font-medium">
                {blockingContainers.length} container đang gây chặn
              </span>
            </div>
            <p className="text-xs text-orange-400/80 mt-1">
              Cần rehandle để lấy các container ở tầng dưới.
            </p>
          </div>
        )}
      </div>

      {/* Stack Visualization - Show ALL tiers (per spec) */}
      <div className="space-y-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 bg-border/50" />
          <span className="rounded bg-secondary/50 px-2 py-1 text-xs font-bold text-muted-foreground">TẦNG TRÊN</span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {sortedTiers.map((tierSlot) => {
          const { container } = tierSlot
          const isHighlighted = container?.containerNo === targetContainerId
          const rehandleCount = container ? calculateRehandleForContainer(stack, tierSlot.tier) : 0
          const isBlocking = container ? isContainerBlocking(stack, tierSlot.tier) : false

          // Determine tier colors based on SPECIFIC issues only
          let tierBg = "bg-secondary/30"
          let tierBorder = "border-border/50"
          let tierText = "text-muted-foreground"

          if (container) {
            if (container.status === "dangerous_goods" || container.specialType === "dg") {
              tierBg = "bg-red-500/20"
              tierBorder = "border-red-500/40"
              tierText = "text-red-400"
            } else if (container.status === "customs_hold") {
              tierBg = "bg-yellow-500/20"
              tierBorder = "border-yellow-500/40"
              tierText = "text-yellow-400"
            } else if (container.specialType === "reefer") {
              tierBg = "bg-cyan-500/20"
              tierBorder = "border-cyan-500/40"
              tierText = "text-cyan-400"
            } else if (isBlocking) {
              tierBg = "bg-orange-500/20"
              tierBorder = "border-orange-500/40"
              tierText = "text-orange-400"
            } else {
              // Normal container - neutral styling, no warning color
              tierBg = "bg-secondary/50"
              tierBorder = "border-border"
              tierText = "text-foreground"
            }
          }

          return (
            <div
              key={tierSlot.tier}
              className={cn(
                "relative rounded-lg border-2 p-3 transition-all",
                tierBg,
                tierBorder,
                isHighlighted && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              {/* Tier indicator */}
              <div className={cn(
                "absolute left-0 top-0 bottom-0 flex w-16 items-center justify-center rounded-l-md border-r",
                container ? "bg-secondary/60 border-border/40" : "bg-secondary/30 border-border/20"
              )}>
                <span className="font-mono font-bold text-sm">
                  T{String(tierSlot.tier).padStart(2, "0")}
                </span>
              </div>

              <div className="ml-16 pl-3">
                {container ? (
                  <div className="space-y-2">
                    {/* Container ID and Type */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className={cn("w-4 h-4", tierText)} />
                        <span className={cn("font-mono font-bold", tierText)}>
                          {container.containerNo}
                        </span>
                        {container.specialType === "reefer" && (
                          <Snowflake className="w-4 h-4 text-cyan-400" />
                        )}
                        {(container.specialType === "dg" || container.status === "dangerous_goods") && (
                          <AlertOctagon className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {container.sizeType}
                        </Badge>
                        {/* Show rehandle count - this is DECISION SUPPORT per spec */}
                        {rehandleCount > 0 && (
                          <Badge variant="outline" className="text-muted-foreground border-muted gap-1">
                            <RotateCcw className="w-3 h-3" />
                            {rehandleCount} rehandle để lấy
                          </Badge>
                        )}
                        {/* Show if this container is blocking */}
                        {isBlocking && (
                          <Badge variant="outline" className="text-orange-400 border-orange-500/40 gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Đang chặn
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Container Details */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      {container.weight && (
                        <div className="flex items-center gap-1">
                          <Weight className="w-3 h-3" />
                          <span>Khối lượng: {(container.weight / 1000).toFixed(1)}T</span>
                        </div>
                      )}
                      {container.tripId && (
                        <div className="flex items-center gap-1">
                          <Ship className="w-3 h-3" />
                          <span className="font-mono">Chuyến: {container.tripId}</span>
                        </div>
                      )}
                      {container.etd && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>ETD: {new Date(container.etd).toLocaleDateString('vi-VN')}</span>
                        </div>
                      )}
                      {(container.destination || container.pod) && (
                        <div className="flex items-center gap-1 text-primary">
                          <span>POD: {container.pod || container.destination}</span>
                        </div>
                      )}
                    </div>

                    {/* Discharge Status */}
                    {container.dischargeStatus && (
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            dischargeStatusColors[container.dischargeStatus].text,
                            dischargeStatusColors[container.dischargeStatus].border
                          )}
                        >
                          {dischargeStatusLabels[container.dischargeStatus]}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          {getPositionCode(block.id, stack.bay, stack.row, tierSlot.tier)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm italic text-muted-foreground">Ô trống</span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {getPositionCode(block.id, stack.bay, stack.row, tierSlot.tier)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

      <div className="flex items-center justify-center gap-2 mt-3">
        <div className="h-px flex-1 bg-border/50" />
        <span className="rounded bg-secondary/50 px-2 py-1 text-xs font-bold text-muted-foreground">TẦNG DƯỚI</span>
        <div className="h-px flex-1 bg-border/50" />
      </div>
      </div>

      {/* Ground indicator */}
      <div className="flex items-center gap-2 pt-2">
        <div className="flex-1 h-2 bg-gradient-to-r from-amber-900/50 via-amber-800/60 to-amber-900/50 rounded-full border border-amber-700/30" />
      </div>
      <p className="text-center text-xs text-muted-foreground">Mặt đất</p>

      {/* Legend - Simplified, only showing what matters for operations */}
      <div className="border-t border-border/30 pt-4 mt-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Chú giải màu:</p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-secondary/50 border border-border" />
            <span className="text-muted-foreground">Bình thường</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500/40" />
            <span className="text-muted-foreground">Đang chặn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/40" />
            <span className="text-muted-foreground">Giữ hải quan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500/20 border border-red-500/40" />
            <span className="text-muted-foreground">Hàng nguy hiểm</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-cyan-500/20 border border-cyan-500/40" />
            <span className="text-muted-foreground">Reefer</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-secondary/30 border border-border/50" />
            <span className="text-muted-foreground">Ô trống</span>
          </div>
        </div>
      </div>
    </div>
  )
}
