"use client"

import { cn } from "@/lib/utils"
import type { YardBlock, Stack, Container } from "@/lib/yard-types"
import { getStackContainerCount, calculateRehandleForContainer } from "@/lib/yard-types"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RotateCcw, Snowflake, AlertOctagon } from "lucide-react"

interface BlockGridProps {
  block: YardBlock
  onStackClick: (stack: Stack) => void
  highlightedContainer?: string
  highlightedPosition?: string // Block-Bay-Row format
}

// Determine container color based on SPECIFIC issues only
// Per spec: Colors must NOT represent "good or bad yard"
// Only show warning color when there IS an issue
function getContainerColor(container: Container, isBlocking: boolean): string {
  // DG container - Red (safety critical)
  if (container.status === "dangerous_goods" || container.specialType === "dg") {
    return "bg-red-500"
  }
  // Customs hold - Yellow (minor issue)
  if (container.status === "customs_hold") {
    return "bg-yellow-500"
  }
  // Reefer - Cyan (informational, not warning)
  if (container.specialType === "reefer") {
    return "bg-cyan-500"
  }
  // Container is blocking another - Orange
  if (isBlocking) {
    return "bg-orange-500"
  }
  // No issue - Neutral color (NOT green by default)
  // Per spec: "If there is NO issue → do NOT show warning color"
  return "bg-slate-400"
}

// Check if a container at a tier is blocking containers below it
function isContainerBlocking(stack: Stack, tierNum: number): boolean {
  const tierSlot = stack.tiers.find(t => t.tier === tierNum)
  if (!tierSlot?.container) return false
  
  // Check if any container below has earlier ETD (needs to come out first)
  const containersBelow = stack.tiers
    .filter(t => t.tier < tierNum && t.container)
    .map(t => t.container!)
  
  if (containersBelow.length === 0) return false
  
  const currentContainer = tierSlot.container
  if (!currentContainer.etd) return false
  
  // Check for ETD blocking
  for (const below of containersBelow) {
    if (below.etd && below.etd < currentContainer.etd) {
      return true // This container is blocking one below
    }
    // Check for customs hold blocking
    if (below.status === "customs_hold") {
      return true
    }
  }
  
  return false
}

// Calculate total blocking containers in a stack
function getStackBlockingCount(stack: Stack): number {
  let count = 0
  for (const tier of stack.tiers) {
    if (tier.container && isContainerBlocking(stack, tier.tier)) {
      count++
    }
  }
  return count
}

export function BlockGrid({ block, onStackClick, highlightedContainer, highlightedPosition }: BlockGridProps) {
  // Group stacks by row for grid layout
  const stacksByRow: Record<number, Stack[]> = {}
  
  for (const stack of block.stacks) {
    if (!stacksByRow[stack.row]) {
      stacksByRow[stack.row] = []
    }
    stacksByRow[stack.row].push(stack)
  }
  
  // Sort each row's stacks by bay
  for (const row of Object.keys(stacksByRow)) {
    stacksByRow[Number(row)].sort((a, b) => a.bay - b.bay)
  }
  
  const isContainerHighlighted = (stack: Stack) => {
    if (!highlightedContainer) return false
    return stack.tiers.some(t => 
      t.container?.containerNo.toLowerCase().includes(highlightedContainer.toLowerCase())
    )
  }

  const isPositionHighlighted = (stack: Stack) => {
    if (!highlightedPosition) return false
    const stackPos = `${block.id}-${String(stack.bay).padStart(2, "0")}-${String(stack.row).padStart(2, "0")}`
    return highlightedPosition.startsWith(stackPos)
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="overflow-x-auto rounded-lg bg-secondary/20 p-3 md:p-4">
        {/* Bay headers */}
        <div className="mb-2 flex gap-2 pl-14">
          {Array.from({ length: block.bays }, (_, i) => (
            <div
              key={i}
              className="w-20 text-center text-xs font-mono font-medium text-muted-foreground"
            >
              B{String(i + 1).padStart(2, "0")}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {Object.keys(stacksByRow)
          .map(Number)
          .sort((a, b) => a - b)
          .map((rowNum) => (
            <div key={rowNum} className="mb-2 flex gap-2">
              {/* Row label */}
              <div className="flex w-12 items-center justify-end pr-1 text-xs font-mono font-medium text-muted-foreground">
                R{String(rowNum).padStart(2, "0")}
              </div>

              {/* Stack cells */}
              {stacksByRow[rowNum].map((stack) => {
                const count = getStackContainerCount(stack)
                const containerHighlighted = isContainerHighlighted(stack)
                const positionHighlighted = isPositionHighlighted(stack)
                const isEmpty = count === 0
                
                // Check for specific issues
                const blockingCount = getStackBlockingCount(stack)
                const hasReeferContainer = stack.tiers.some(t => t.container?.specialType === "reefer")
                const hasDGContainer = stack.tiers.some(t => 
                  t.container?.status === "dangerous_goods" || t.container?.specialType === "dg"
                )

                // Top container for tooltip
                const topContainer = [...stack.tiers]
                  .reverse()
                  .find(t => t.container !== null)?.container

                return (
                  <Tooltip key={`${stack.bay}-${stack.row}`}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onStackClick(stack)}
                        className={cn(
                          "relative flex w-20 flex-col items-center justify-end rounded border-2 px-1.5 py-2",
                          "transition-all cursor-pointer",
                          "hover:scale-[1.03] hover:z-10 hover:shadow-lg",
                          // Default neutral styling - no warning colors unless there's an issue
                          isEmpty 
                            ? "h-16 border-border/50 bg-secondary/30" 
                            : "bg-secondary/40 border-border",
                          // Highlight for search/selection
                          (containerHighlighted || positionHighlighted) && "ring-2 ring-primary ring-offset-2 ring-offset-background animate-pulse",
                        )}
                        style={{ minHeight: `${block.maxTiers * 14 + 32}px` }}
                      >
                        {/* Mini Stack Visualization - Shows ALL tiers */}
                        <div className="flex w-full flex-col-reverse gap-1">
                          {Array.from({ length: block.maxTiers }, (_, i) => {
                            const tierNum = i + 1
                            const tierSlot = stack.tiers.find(t => t.tier === tierNum)
                            const container = tierSlot?.container
                            
                            if (!container) {
                              return (
                                <div
                                  key={tierNum}
                                  className="h-3 w-full rounded-sm border border-dashed border-border/30 bg-secondary/30"
                                  title={`T${String(tierNum).padStart(2, "0")} Trống`}
                                />
                              )
                            }
                            
                            const isBlocking = isContainerBlocking(stack, tierNum)
                            
                            return (
                              <div
                                key={tierNum}
                                className={cn(
                                  "h-3 w-full rounded-sm transition-all",
                                  getContainerColor(container, isBlocking)
                                )}
                                title={`${container.containerNo}${isBlocking ? " (Đang chặn)" : ""}`}
                              />
                            )
                          })}
                        </div>
                        
                        {/* Container count label */}
                        <div className="mt-2 text-[11px] font-mono font-medium text-muted-foreground">
                          {count}/{block.maxTiers}
                        </div>

                        <div className="mt-1 text-[10px] text-muted-foreground/80">
                          B{String(stack.bay).padStart(2, "0")} · R{String(stack.row).padStart(2, "0")}
                        </div>
                        
                        {/* Issue Indicators - Only show when there IS an issue */}
                        {blockingCount > 0 && (
                          <div 
                            className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center" 
                            title={`${blockingCount} container đang chặn`}
                          >
                            <RotateCcw className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                        
                        {/* Special type indicators */}
                        <div className="absolute -top-1 -left-1 flex gap-0.5">
                          {hasReeferContainer && (
                            <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center" title="Có container lạnh">
                              <Snowflake className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          {hasDGContainer && (
                            <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center" title="Có hàng nguy hiểm">
                              <AlertOctagon className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm border-border bg-popover p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-mono font-bold text-sm">
                            {block.id}-{String(stack.bay).padStart(2, "0")}-{String(stack.row).padStart(2, "0")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {count}/{block.maxTiers} cont
                          </span>
                        </div>
                        
                        {/* Mini stack preview in tooltip */}
                        <div className="bg-secondary/50 rounded p-2">
                          <div className="mb-1 text-center text-[10px] text-muted-foreground">Cấu trúc stack</div>
                          <div className="flex flex-col gap-0.5">
                            {[...Array.from({ length: block.maxTiers }, (_, i) => block.maxTiers - i)].map(tierNum => {
                              const tierSlot = stack.tiers.find(t => t.tier === tierNum)
                              const container = tierSlot?.container
                              const isBlocking = container ? isContainerBlocking(stack, tierNum) : false
                              const rehandleCount = container ? calculateRehandleForContainer(stack, tierNum) : 0
                              
                              return (
                                <div key={tierNum} className="flex items-center gap-1 text-[10px]">
                                  <span className="font-mono w-6 text-muted-foreground">T{String(tierNum).padStart(2, "0")}</span>
                                  {container ? (
                                    <div className="flex items-center gap-1">
                                      <span className={cn(
                                        "font-mono truncate",
                                        container.status === "dangerous_goods" ? "text-red-400" :
                                        container.status === "customs_hold" ? "text-yellow-400" :
                                        container.specialType === "reefer" ? "text-cyan-400" :
                                        isBlocking ? "text-orange-400" :
                                        "text-foreground"
                                      )}>
                                        {container.containerNo}
                                      </span>
                                      {isBlocking && (
                                        <span className="text-orange-400">(đang chặn)</span>
                                      )}
                                      {rehandleCount > 0 && (
                                        <span className="text-muted-foreground">({rehandleCount} lượt rehandle)</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground/50 italic">Trống</span>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                        
                        {/* Only show warnings if there are issues */}
                        {blockingCount > 0 && (
                          <div className="text-xs text-orange-400 flex items-center gap-1 border-t border-border pt-2">
                            <RotateCcw className="w-3 h-3" />
                            {blockingCount} container gây chặn, cần rehandle
                          </div>
                        )}
                        
                        {topContainer && (
                          <div className="border-t border-border pt-2 space-y-1">
                            <div className="text-xs font-medium">Container trên cùng:</div>
                            <div className="text-xs font-mono">{topContainer.containerNo}</div>
                            <div className="text-xs text-muted-foreground">
                              {topContainer.sizeType} | {((topContainer.weight || 0) / 1000).toFixed(1)}T
                              {topContainer.pod && ` | POD: ${topContainer.pod}`}
                            </div>
                          </div>
                        )}

                        <div className="pt-1 text-[10px] text-muted-foreground">
                          Nhấn để mở chi tiết stack
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          ))}

        {/* Legend - Per spec: Only for specific issues, not "good/bad yard" */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-border/30 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded bg-slate-400" />
            <span className="text-xs text-muted-foreground">Bình thường</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded bg-orange-500" />
            <span className="text-xs text-muted-foreground">Đang chặn (cần đảo chuyển)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded bg-yellow-500" />
            <span className="text-xs text-muted-foreground">Giữ hải quan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded bg-red-500" />
            <span className="text-xs text-muted-foreground">Hàng nguy hiểm</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded bg-cyan-500" />
            <span className="text-xs text-muted-foreground">Reefer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-2 rounded bg-secondary/30 border border-dashed border-border/50" />
            <span className="text-xs text-muted-foreground">Trống</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
