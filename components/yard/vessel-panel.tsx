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
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Search,
  MapPin,
  ArrowRight,
  Snowflake,
  AlertOctagon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Vessel, Container, DischargeStatus } from "@/lib/yard-types"
import { dischargeStatusLabels, dischargeStatusColors } from "@/lib/yard-types"

interface VesselPanelProps {
  vessels: Vessel[]
  selectedVessel: Vessel | null
  onSelectVessel: (vessel: Vessel) => void
  onDischargeContainer: (container: Container) => void
}

const EMPTY_DISCHARGE_COUNTS: Record<DischargeStatus, number> = {
  planned: 0,
  on_vessel: 0,
  discharging: 0,
  discharged: 0,
  in_yard: 0,
  gate_out: 0,
}

const vesselStatusConfig: Record<Vessel["status"], { color: string; label: string; icon: React.ElementType }> = {
  approaching: { color: "text-blue-400", label: "Đang đến", icon: Ship },
  berthed: { color: "text-yellow-400", label: "Đã cập bến", icon: Anchor },
  discharging: { color: "text-orange-400", label: "Đang dỡ hàng", icon: Loader2 },
  completed: { color: "text-emerald-400", label: "Hoàn thành", icon: CheckCircle2 },
  departed: { color: "text-slate-400", label: "Đã rời", icon: Ship },
}

export function VesselPanel({ 
  vessels, 
  selectedVessel, 
  onSelectVessel, 
  onDischargeContainer 
}: VesselPanelProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<DischargeStatus | "all">("all")

  // Filter containers based on search and status
  const filteredContainers = useMemo(() => {
    if (!selectedVessel) return []
    
    let containers = selectedVessel.containers
    
    if (searchQuery) {
      containers = containers.filter(c => 
        c.containerNo.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    if (statusFilter !== "all") {
      containers = containers.filter(c => c.dischargeStatus === statusFilter)
    }
    
    return containers
  }, [selectedVessel, searchQuery, statusFilter])

  // Calculate discharge progress
  const dischargeProgress = useMemo(() => {
    if (!selectedVessel) return 0
    return Math.round((selectedVessel.dischargedCount / selectedVessel.totalContainers) * 100)
  }, [selectedVessel])

  // Count containers by status
  const statusCounts = useMemo(() => {
    if (!selectedVessel) return EMPTY_DISCHARGE_COUNTS
    
    const counts: Record<DischargeStatus, number> = { ...EMPTY_DISCHARGE_COUNTS }
    
    for (const container of selectedVessel.containers) {
      counts[container.dischargeStatus]++
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
            Danh sách tàu (BAPLIE)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {vessels.map((vessel) => {
            const statusConfig = vesselStatusConfig[vessel.status]
            const StatusIcon = statusConfig.icon
            const isSelected = selectedVessel?.id === vessel.id
            const progress = Math.round((vessel.dischargedCount / vessel.totalContainers) * 100)

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
                      vessel.status === "discharging" && "animate-spin"
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
                
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Tiến độ dỡ:</span>
                  <span className="font-bold">{vessel.dischargedCount}/{vessel.totalContainers} ({progress}%)</span>
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
                Container trên tàu
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {filteredContainers.length} container
              </div>
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

            {/* Status Filter */}
            <div className="flex flex-wrap gap-1">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setStatusFilter("all")}
              >
                Tất cả
              </Button>
              {(["on_vessel", "discharging", "discharged", "in_yard"] as DischargeStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs",
                    statusFilter === status && dischargeStatusColors[status].bg
                  )}
                  onClick={() => setStatusFilter(status)}
                >
                  {dischargeStatusLabels[status]} ({statusCounts[status] || 0})
                </Button>
              ))}
            </div>

            {/* Progress Summary */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30">
                <div className="text-lg font-bold text-blue-400">{statusCounts.on_vessel || 0}</div>
                <div className="text-[10px] text-muted-foreground">Trên tàu</div>
              </div>
              <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
                <div className="text-lg font-bold text-yellow-400">{statusCounts.discharging || 0}</div>
                <div className="text-[10px] text-muted-foreground">Đang dỡ</div>
              </div>
              <div className="p-2 rounded bg-orange-500/10 border border-orange-500/30">
                <div className="text-lg font-bold text-orange-400">{statusCounts.discharged || 0}</div>
                <div className="text-[10px] text-muted-foreground">Cần slot</div>
              </div>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
                <div className="text-lg font-bold text-emerald-400">{statusCounts.in_yard || 0}</div>
                <div className="text-[10px] text-muted-foreground">Trong bãi</div>
              </div>
            </div>

            {/* Container List */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                {filteredContainers.map((container) => {
                  const statusColors = dischargeStatusColors[container.dischargeStatus]
                  const canDischarge = container.dischargeStatus === "discharged"

                  return (
                    <div
                      key={container.id}
                      className={cn(
                        "p-2 rounded border text-sm",
                        statusColors.bg,
                        statusColors.border,
                        canDischarge && "ring-1 ring-orange-400"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
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
                          {dischargeStatusLabels[container.dischargeStatus]}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>{container.sizeType}</span>
                          <span>{((container.weight || 0) / 1000).toFixed(1)}T</span>
                          <span>{container.pod}</span>
                        </div>
                        
                        {canDischarge && (
                          <Button
                            size="sm"
                            className="h-6 text-[10px] gap-1"
                            onClick={() => onDischargeContainer(container)}
                          >
                            <MapPin className="w-3 h-3" />
                            Cấp vị trí
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        )}
                        
                        {container.yardPosition && (
                          <span className="font-mono text-emerald-400">
                            {container.yardPosition}
                          </span>
                        )}
                      </div>
                      
                      {/* Vessel position (BAPLIE) */}
                      {container.vesselBay && (
                        <div className="text-[10px] text-muted-foreground mt-1">
                          Vị trí tàu: Bay {container.vesselBay} - Row {container.vesselRow} - Tier {container.vesselTier}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
