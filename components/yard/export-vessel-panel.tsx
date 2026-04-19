"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Ship,
  Anchor,
  Package,
  CheckCircle2,
  Loader2,
  Search,
  MapPin,
  ArrowUp,
  Snowflake,
  AlertOctagon,
  FileText,
  Layers,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExportVessel, ExportContainer, ExportStatus } from "@/lib/yard-types"
import { exportStatusLabels, exportStatusColors } from "@/lib/yard-types"
import { getExportContainersByPOD } from "@/lib/yard-utils"

interface ExportVesselPanelProps {
  vessels: ExportVessel[]
  selectedVessel: ExportVessel | null
  onSelectVessel: (vessel: ExportVessel) => void
  onPlanContainer: (container: ExportContainer) => void
  onViewStackPlan: (vessel: ExportVessel) => void
}

const EMPTY_EXPORT_COUNTS: Record<ExportStatus, number> = {
  received: 0,
  planned: 0,
  in_yard: 0,
  ready_load: 0,
  loading: 0,
  loaded: 0,
}

const vesselStatusConfig: Record<ExportVessel["status"], { color: string; label: string; icon: React.ElementType }> = {
  planning: { color: "text-blue-400", label: "Lập kế hoạch", icon: FileText },
  receiving: { color: "text-yellow-400", label: "Đang nhận hàng", icon: Package },
  ready: { color: "text-emerald-400", label: "Sẵn sàng", icon: CheckCircle2 },
  loading: { color: "text-orange-400", label: "Đang xếp", icon: Loader2 },
  completed: { color: "text-purple-400", label: "Hoàn thành", icon: CheckCircle2 },
  departed: { color: "text-slate-400", label: "Đã rời", icon: Ship },
}

export function ExportVesselPanel({ 
  vessels, 
  selectedVessel, 
  onSelectVessel,
  onPlanContainer,
  onViewStackPlan,
}: ExportVesselPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<ExportStatus | "all">("all")
  const [podFilter, setPodFilter] = useState<string>("all")

  // Group containers by POD
  const containersByPOD = useMemo(() => {
    if (!selectedVessel) return {}
    return getExportContainersByPOD(selectedVessel)
  }, [selectedVessel])

  // Filter containers
  const filteredContainers = useMemo(() => {
    if (!selectedVessel) return []
    
    let containers = selectedVessel.containers
    
    if (searchQuery) {
      containers = containers.filter(c => 
        c.containerNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (statusFilter !== "all") {
      containers = containers.filter(c => c.exportStatus === statusFilter)
    }
    
    if (podFilter !== "all") {
      containers = containers.filter(c => c.pod === podFilter)
    }
    
    // Sort by load sequence
    return containers.sort((a, b) => a.loadSequence - b.loadSequence)
  }, [selectedVessel, searchQuery, statusFilter, podFilter])

  // Calculate load progress
  const loadProgress = useMemo(() => {
    if (!selectedVessel) return 0
    return Math.round((selectedVessel.loadedCount / selectedVessel.totalContainers) * 100)
  }, [selectedVessel])

  // Count containers by status
  const statusCounts = useMemo(() => {
    if (!selectedVessel) return EMPTY_EXPORT_COUNTS
    
    const counts: Record<ExportStatus, number> = { ...EMPTY_EXPORT_COUNTS }
    
    for (const container of selectedVessel.containers) {
      counts[container.exportStatus]++
    }
    
    return counts
  }, [selectedVessel])

  return (
    <div className="space-y-4">
      {/* Vessel List */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Ship className="w-4 h-4" />
            Tàu xuất (MOVINS)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {vessels.map((vessel) => {
            const statusConfig = vesselStatusConfig[vessel.status]
            const StatusIcon = statusConfig.icon
            const isSelected = selectedVessel?.id === vessel.id
            const progress = Math.round((vessel.loadedCount / vessel.totalContainers) * 100)

            return (
              <button
                key={vessel.id}
                onClick={() => onSelectVessel(vessel)}
                className={cn(
                  "w-full p-3 rounded-lg border-2 text-left transition-all",
                  "hover:border-primary/50",
                  isSelected 
                    ? "border-primary bg-primary/10" 
                    : "border-border bg-secondary/30"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={cn(
                      "w-4 h-4",
                      statusConfig.color,
                      vessel.status === "loading" && "animate-spin"
                    )} />
                    <span className="font-bold text-sm">{vessel.name}</span>
                  </div>
                  <Badge variant="outline" className={cn("text-xs", statusConfig.color)}>
                    {statusConfig.label}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground mb-2">
                  Chuyến: {vessel.voyageNo} | Ver: {vessel.version}
                </div>

                {/* POD List */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {vessel.pods.map(pod => (
                    <Badge key={pod} variant="outline" className="text-[10px] px-1.5 py-0">
                      {pod}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Tiến độ xếp:</span>
                  <span className="font-bold">{vessel.loadedCount}/{vessel.totalContainers} ({progress}%)</span>
                </div>
                
                <Progress value={progress} className="h-1.5" />
              </button>
            )
          })}
        </CardContent>
      </Card>

      {/* Selected Vessel Details */}
      {selectedVessel && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="w-4 h-4" />
                Container xuất ({selectedVessel.totalContainers})
              </CardTitle>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs"
                onClick={() => onViewStackPlan(selectedVessel)}
              >
                <Layers className="w-3 h-3" />
                Xem kế hoạch xếp
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm container..."
                className="pl-9 bg-secondary border-border h-8 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* POD Filter */}
            <div className="flex flex-wrap gap-1">
              <Button
                variant={podFilter === "all" ? "default" : "outline"}
                size="sm"
                className="h-6 text-xs"
                onClick={() => setPodFilter("all")}
              >
                Tất cả POD
              </Button>
              {selectedVessel.pods.map(pod => (
                <Button
                  key={pod}
                  variant={podFilter === pod ? "default" : "outline"}
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => setPodFilter(pod)}
                >
                  {pod} ({containersByPOD[pod]?.length || 0})
                </Button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-1">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                className="h-6 text-xs"
                onClick={() => setStatusFilter("all")}
              >
                Tất cả
              </Button>
              {(["received", "planned", "in_yard", "ready_load", "loading", "loaded"] as ExportStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-6 text-xs",
                    statusFilter === status && exportStatusColors[status].bg
                  )}
                  onClick={() => setStatusFilter(status)}
                >
                  {exportStatusLabels[status]} ({statusCounts[status] || 0})
                </Button>
              ))}
            </div>

            {/* Progress Summary */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                <div className="text-lg font-bold text-blue-400">
                  {(statusCounts.received || 0) + (statusCounts.planned || 0)}
                </div>
                <div className="text-[10px] text-muted-foreground">Đang lên kế hoạch</div>
              </div>
              <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
                <div className="text-lg font-bold text-yellow-400">
                  {(statusCounts.in_yard || 0) + (statusCounts.ready_load || 0)}
                </div>
                <div className="text-[10px] text-muted-foreground">Trong bãi</div>
              </div>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-lg font-bold text-emerald-400">
                  {(statusCounts.loading || 0) + (statusCounts.loaded || 0)}
                </div>
                <div className="text-[10px] text-muted-foreground">Đã/Đang xếp</div>
              </div>
            </div>

            {/* Container List - Sorted by Load Sequence */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                {filteredContainers.map((container) => {
                  const statusColors = exportStatusColors[container.exportStatus]
                  const needsPlan = container.exportStatus === "received"

                  return (
                    <div
                      key={container.id}
                      className={cn(
                        "p-2 rounded border text-sm",
                        statusColors.bg,
                        statusColors.border,
                        needsPlan && "ring-1 ring-blue-400"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {/* Load Sequence Badge */}
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "font-mono text-[10px] h-5 min-w-[32px] justify-center",
                              container.loadSequence <= 3 
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" 
                                : "text-muted-foreground"
                            )}
                          >
                            #{container.loadSequence}
                          </Badge>
                          <span className="font-mono font-bold text-xs">{container.containerNo}</span>
                          {container.specialType === "reefer" && (
                            <Snowflake className="w-3 h-3 text-cyan-400" />
                          )}
                          {container.specialType === "dg" && (
                            <AlertOctagon className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px] h-5", statusColors.text)}
                        >
                          {exportStatusLabels[container.exportStatus]}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>{container.sizeType}</span>
                          <span>{((container.weight || 0) / 1000).toFixed(1)}T</span>
                          <span className="text-primary font-medium">{container.pod}</span>
                        </div>
                        
                        {needsPlan && (
                          <Button
                            size="sm"
                            className="h-6 text-[10px] gap-1"
                            onClick={() => onPlanContainer(container)}
                          >
                            <MapPin className="w-3 h-3" />
                            Lập vị trí
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {container.plannedYardPosition && (
                          <span className="font-mono text-emerald-400">
                            {container.plannedYardPosition}
                          </span>
                        )}
                      </div>
                      
                      {/* Target vessel position */}
                      {container.vesselTargetBay && (
                        <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                          <ArrowUp className="w-3 h-3" />
                          Vị trí tàu: Bay {container.vesselTargetBay} - Row {container.vesselTargetRow} - Tier {container.vesselTargetTier}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Stacking Rule Reminder */}
            <div className="border-t border-border pt-3 mt-3">
              <div className="text-xs text-muted-foreground space-y-1">
                <div className="font-medium text-foreground flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Quy tắc xếp hàng xuất (MOVINS):
                </div>
                <div className="pl-4">
                  <div className="flex items-center gap-1">
                    <span className="text-emerald-400">Xếp trước (TRÊN)</span>: Container thứ tự xếp thấp
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Xếp sau (DƯỚI)</span>: Container thứ tự xếp cao
                  </div>
                  <div className="text-yellow-400 mt-1">
                    Giảm thiểu rehandle khi xếp tàu
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
