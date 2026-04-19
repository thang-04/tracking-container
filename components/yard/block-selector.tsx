"use client"

import { cn } from "@/lib/utils"
import type { YardBlock } from "@/lib/yard-types"
import { blockTypeLabels } from "@/lib/yard-types"
import { getBlockStats } from "@/lib/yard-utils"
import { Eye } from "lucide-react"

interface BlockSelectorProps {
  blocks: YardBlock[]
  selectedBlock: YardBlock | null
  onSelectBlock: (block: YardBlock) => void
  filter?: YardBlock["type"]
}

const typeColors: Record<YardBlock["type"], string> = {
  Import: "text-blue-400",
  Export: "text-green-400",
  Empty: "text-slate-400",
  Reefer: "text-cyan-400",
  DG: "text-orange-400",
  Hold: "text-red-400",
  Inspection: "text-purple-400",
}

const getOccupancyColor = (percentage: number) => {
  if (percentage >= 90) return "bg-red-500/30 border-red-500/50 hover:bg-red-500/40"
  if (percentage >= 80) return "bg-orange-500/30 border-orange-500/50 hover:bg-orange-500/40"
  if (percentage >= 60) return "bg-yellow-500/30 border-yellow-500/50 hover:bg-yellow-500/40"
  return "bg-emerald-500/30 border-emerald-500/50 hover:bg-emerald-500/40"
}

export function BlockSelector({ blocks, selectedBlock, onSelectBlock, filter }: BlockSelectorProps) {
  const filteredBlocks = filter ? blocks.filter(b => b.type === filter) : blocks
  
  // Group blocks by type
  const blocksByType: Record<string, YardBlock[]> = {}
  for (const block of filteredBlocks) {
    const type = block.type
    if (!blocksByType[type]) {
      blocksByType[type] = []
    }
    blocksByType[type].push(block)
  }

  const typeOrder: YardBlock["type"][] = ["Import", "Export", "Empty", "Reefer", "DG", "Hold", "Inspection"]
  const sortedTypes = typeOrder.filter(t => blocksByType[t]?.length > 0)

  return (
    <div className="space-y-4">
      {sortedTypes.map((type) => (
        <div key={type} className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full", typeColors[type].replace("text-", "bg-").replace("-400", "-500"))} />
            Khu {blockTypeLabels[type]}
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {blocksByType[type].map((block) => {
              const stats = getBlockStats(block)
              const isSelected = selectedBlock?.id === block.id

              return (
                <button
                  key={block.id}
                  onClick={() => onSelectBlock(block)}
                  className={cn(
                    "p-3 rounded-lg border-2 cursor-pointer transition-all text-left",
                    getOccupancyColor(stats.occupancyRate),
                    isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">{block.id}</span>
                    <Eye className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className={cn("text-xs font-medium", typeColors[block.type])}>
                    {blockTypeLabels[block.type]}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {stats.usedCapacity}/{stats.totalCapacity}
                    </span>
                    <span className="font-bold">{stats.occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-1 mt-1">
                    <div
                      className="h-1 rounded-full bg-current opacity-70"
                      style={{ width: `${stats.occupancyRate}%` }}
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500/60" />
          <span>{"<60%"}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500/40 border border-yellow-500/60" />
          <span>60-80%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500/40 border border-orange-500/60" />
          <span>80-90%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500/40 border border-red-500/60" />
          <span>{">90%"}</span>
        </div>
      </div>
    </div>
  )
}
