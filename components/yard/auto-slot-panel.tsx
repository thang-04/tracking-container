"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Wand2, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Star,
  Info,
  RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { YardBlock } from "@/lib/yard-types"
import { findBestSlots, type SlotRecommendation, type ContainerWithETD } from "@/lib/yard-optimizer"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AutoSlotPanelProps {
  blocks: YardBlock[]
  onSelectSlot?: (recommendation: SlotRecommendation) => void
}

export function AutoSlotPanel({ blocks, onSelectSlot }: AutoSlotPanelProps) {
  const [containerNo, setContainerNo] = useState("")
  const [weight, setWeight] = useState("")
  const [etd, setEtd] = useState("")
  const [recommendations, setRecommendations] = useState<SlotRecommendation[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleFindSlots = () => {
    if (!containerNo) return
    
    setIsSearching(true)
    
    // Create a mock container for search
    const container: ContainerWithETD = {
      id: `new-${Date.now()}`,
      containerNo: containerNo.toUpperCase(),
      sizeType: "40GP",
      status: "in_use",
      dischargeStatus: "discharged",
      dwellDays: 0,
      weight: weight ? parseInt(weight) * 1000 : 15000,
      etd: etd ? new Date(etd) : undefined,
      specialType: "normal",
    }
    
    const results = findBestSlots(blocks, container, 5)
    setRecommendations(results)
    setIsSearching(false)
  }

  const getBestSlotBadge = (index: number, score: number) => {
    if (index === 0) {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40">
          <Star className="w-3 h-3 mr-1" />
          Tốt nhất
        </Badge>
      )
    }
    if (score >= 80) {
      return <Badge variant="outline" className="text-emerald-400">Tốt</Badge>
    }
    if (score >= 50) {
      return <Badge variant="outline" className="text-yellow-400">Chấp nhận</Badge>
    }
    return <Badge variant="outline" className="text-orange-400">Cảnh báo</Badge>
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary" />
          Gợi ý vị trí thông minh (Auto-Slotting)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Input Form */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="col-span-2">
            <label className="text-xs text-muted-foreground mb-1 block">Số Container</label>
            <Input
              placeholder="VD: MSKU1234567"
              value={containerNo}
              onChange={(e) => setContainerNo(e.target.value)}
              className="font-mono bg-secondary border-border"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Trọng lượng (tấn)</label>
            <Input
              type="number"
              placeholder="15"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">ETD</label>
            <Input
              type="date"
              value={etd}
              onChange={(e) => setEtd(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
        </div>
        
        <Button 
          className="w-full gap-2 mb-4" 
          onClick={handleFindSlots}
          disabled={!containerNo || isSearching}
        >
          <Wand2 className="w-4 h-4" />
          Tìm vị trí tối ưu
        </Button>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <TooltipProvider>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-2">
                Đề xuất {recommendations.length} vị trí:
              </div>
              
              {recommendations.map((rec, index) => (
                <div
                  key={`${rec.block}-${rec.bay}-${rec.row}-${rec.tier}`}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    "hover:border-primary/50 hover:bg-primary/5",
                    index === 0 
                      ? "border-emerald-500/50 bg-emerald-500/10" 
                      : "border-border bg-secondary/50"
                  )}
                  onClick={() => onSelectSlot?.(rec)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MapPin className={cn(
                        "w-4 h-4",
                        index === 0 ? "text-emerald-400" : "text-muted-foreground"
                      )} />
                      <span className="font-mono font-bold">
                        {rec.block}-{String(rec.bay).padStart(2, "0")}-{String(rec.row).padStart(2, "0")}-{String(rec.tier).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getBestSlotBadge(index, rec.score)}
                      <span className={cn(
                        "text-sm font-bold",
                        rec.score >= 80 ? "text-emerald-400" :
                        rec.score >= 50 ? "text-yellow-400" : "text-orange-400"
                      )}>
                        {rec.score}%
                      </span>
                    </div>
                  </div>

                  {/* Reasons */}
                  {rec.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {rec.reasons.slice(0, 3).map((reason, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 className="w-3 h-3" />
                          {reason}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Warnings */}
                  {rec.warnings.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {rec.warnings.map((warning, i) => (
                        <Tooltip key={i}>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-xs text-yellow-400 cursor-help">
                              <AlertTriangle className="w-3 h-3" />
                              {warning.length > 40 ? `${warning.slice(0, 40)}...` : warning}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">{warning}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  )}

                  {/* Rehandle Impact */}
                  {rec.expectedRehandle > 0 && (
                    <div className="flex items-center gap-1 text-xs text-orange-400 mt-2">
                      <RotateCcw className="w-3 h-3" />
                      Rehandle dự kiến: {rec.expectedRehandle} lần
                    </div>
                  )}

                  {/* Select button */}
                  <Button
                    size="sm"
                    variant={index === 0 ? "default" : "outline"}
                    className="w-full mt-3 gap-2"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectSlot?.(rec)
                    }}
                  >
                    Chọn vị trí này
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </TooltipProvider>
        )}

        {/* Empty State */}
        {recommendations.length === 0 && containerNo && (
          <div className="text-center py-4 text-muted-foreground">
            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nhập thông tin container và nhấn &quot;Tìm vị trí tối ưu&quot;</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
