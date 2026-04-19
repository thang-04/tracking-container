"use client"

import { useMemo, useState } from "react"
import {
  Grid3X3,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  Ship,
  Wand2,
  ZoomIn,
  ZoomOut,
} from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { AutoSlotPanel } from "@/components/yard/auto-slot-panel"
import { BlockGrid } from "@/components/yard/block-grid"
import { BlockSelector } from "@/components/yard/block-selector"
import { ExportStackPlanDialog } from "@/components/yard/export-stack-plan-dialog"
import { ExportVesselPanel } from "@/components/yard/export-vessel-panel"
import { SlotSuggestionDialog } from "@/components/yard/slot-suggestion-dialog"
import { StackDetail } from "@/components/yard/stack-detail"
import { VesselPanel } from "@/components/yard/vessel-panel"
import { YardStats } from "@/components/yard/yard-stats"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getPositionCode,
  type Container,
  type ExportVessel,
  type Stack,
  type Vessel,
  type YardBlock,
} from "@/lib/yard-types"
import {
  exportVessels,
  findContainer,
  getBlockStats,
  getYardStats,
  vessels,
  yardBlocks,
} from "@/lib/yard-data"
import type { SlotRecommendation } from "@/lib/yard-optimizer"

const firstImportBlock = yardBlocks.find((block) => block.type === "Import") ?? yardBlocks[0]
const firstExportBlock = yardBlocks.find((block) => block.type === "Export") ?? yardBlocks[0]

export default function YardManagementPage() {
  const [selectedBlock, setSelectedBlock] = useState<YardBlock | null>(firstImportBlock)
  const [selectedStack, setSelectedStack] = useState<Stack | null>(null)
  const [showStackSheet, setShowStackSheet] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [zoomLevel, setZoomLevel] = useState(1)

  const [selectedVessel, setSelectedVessel] = useState<Vessel | null>(vessels[0] ?? null)
  const [selectedExportVessel, setSelectedExportVessel] = useState<ExportVessel | null>(
    exportVessels[0] ?? null,
  )
  const [showExportStackPlan, setShowExportStackPlan] = useState(false)

  const [containerToSlot, setContainerToSlot] = useState<Container | null>(null)
  const [showSlotDialog, setShowSlotDialog] = useState(false)
  const [highlightedPosition, setHighlightedPosition] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<"grid" | "import" | "export">("grid")

  const yardStats = useMemo(() => getYardStats(), [])

  const importCount = useMemo(
    () =>
      yardBlocks
        .filter((block) => block.type === "Import")
        .reduce((sum, block) => sum + getBlockStats(block).usedCapacity, 0),
    [],
  )

  const exportCount = useMemo(
    () =>
      yardBlocks
        .filter((block) => block.type === "Export")
        .reduce((sum, block) => sum + getBlockStats(block).usedCapacity, 0),
    [],
  )

  const holdCount = useMemo(
    () =>
      yardBlocks
        .filter((block) => block.type === "Hold")
        .reduce((sum, block) => sum + getBlockStats(block).usedCapacity, 0),
    [],
  )

  const reeferCount = useMemo(
    () =>
      yardBlocks
        .filter((block) => block.type === "Reefer")
        .reduce((sum, block) => sum + getBlockStats(block).usedCapacity, 0),
    [],
  )

  const dgCount = useMemo(
    () =>
      yardBlocks
        .filter((block) => block.type === "DG")
        .reduce((sum, block) => sum + getBlockStats(block).usedCapacity, 0),
    [],
  )

  const handleStackClick = (stack: Stack) => {
    setSelectedStack(stack)
    setShowStackSheet(true)
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return

    const result = findContainer(searchQuery)
    if (!result) return

    setActiveTab("grid")
    setSelectedBlock(result.block)
    setSelectedStack(result.stack)
    setShowStackSheet(true)
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleDischargeContainer = (container: Container) => {
    setContainerToSlot(container)
    setShowSlotDialog(true)
  }

  const handleSelectSlot = (recommendation: SlotRecommendation) => {
    const block = yardBlocks.find((yardBlock) => yardBlock.id === recommendation.block)
    if (block) {
      setSelectedBlock(block)
      setHighlightedPosition(
        getPositionCode(recommendation.block, recommendation.bay, recommendation.row, recommendation.tier),
      )

      const stack = block.stacks.find(
        (candidate) => candidate.bay === recommendation.bay && candidate.row === recommendation.row,
      )

      if (stack) {
        setSelectedStack(stack)
        setShowStackSheet(true)
      }
    }

    setShowSlotDialog(false)
    setContainerToSlot(null)
    setActiveTab("grid")
  }

  const handleTabChange = (value: string) => {
    const nextTab = value as "grid" | "import" | "export"
    setActiveTab(nextTab)

    if (nextTab === "import" && selectedBlock?.type !== "Import") {
      setSelectedBlock(firstImportBlock)
      setHighlightedPosition(null)
    }

    if (nextTab === "export" && selectedBlock?.type !== "Export") {
      setSelectedBlock(firstExportBlock)
      setHighlightedPosition(null)
    }
  }

  return (
    <DashboardLayout
      title="Quản lý bãi"
      description="Sử dụng lại mô-đun quản lý bãi từ tracking_v3 với 3 tab: Sơ đồ bãi 2D, Nhập, Xuất."
    >
      <YardStats
        totalCapacity={yardStats.totalCapacity}
        usedCapacity={yardStats.usedCapacity}
        occupancyRate={yardStats.occupancyRate}
        importCount={importCount}
        exportCount={exportCount}
        holdCount={holdCount}
        reeferCount={reeferCount}
        dgCount={dgCount}
        blocks={yardBlocks}
      />

      <div className="mt-6 mb-4 flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm container (VD: MSKU1234567)..."
            className="bg-secondary pl-9"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSearch()}
          />
        </div>

        <Button variant="secondary" size="sm" onClick={handleSearch}>
          Tìm kiếm
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-sm text-muted-foreground">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline" size="icon" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setHighlightedPosition(null)}>
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4 grid w-full max-w-[560px] grid-cols-3 bg-secondary">
          <TabsTrigger value="grid" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            Sơ đồ bãi 2D
          </TabsTrigger>
          <TabsTrigger value="import" className="gap-2">
            <Ship className="h-4 w-4" />
            Nhập
          </TabsTrigger>
          <TabsTrigger value="export" className="gap-2">
            <Layers className="h-4 w-4" />
            Xuất
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-3 xl:space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Layers className="h-4 w-4" />
                    Chọn khu bãi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BlockSelector
                    blocks={yardBlocks}
                    selectedBlock={selectedBlock}
                    onSelectBlock={setSelectedBlock}
                  />
                </CardContent>
              </Card>

              <div className="mt-4 xl:mt-0">
                <AutoSlotPanel blocks={yardBlocks} onSelectSlot={handleSelectSlot} />
              </div>
            </div>

            <div className="xl:col-span-9">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4" />
                      {selectedBlock ? (
                        <>
                          Khu {selectedBlock.id}
                          <span className="ml-2 font-normal text-muted-foreground">
                            ({selectedBlock.bays} Bay x {selectedBlock.rows} Row x {selectedBlock.maxTiers} Tầng)
                          </span>
                        </>
                      ) : (
                        "Chọn khu bãi để xem chi tiết"
                      )}
                    </CardTitle>

                    {selectedBlock ? (
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Sức chứa: </span>
                          <span className="font-bold">{getBlockStats(selectedBlock).totalCapacity} TEU</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Đã dùng: </span>
                          <span className="font-bold text-emerald-400">
                            {getBlockStats(selectedBlock).usedCapacity} TEU
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Trống: </span>
                          <span className="font-bold text-muted-foreground">
                            {getBlockStats(selectedBlock).emptySlots} TEU
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </CardHeader>

                <CardContent className="pb-5">
                  {selectedBlock ? (
                    <div className="rounded-xl border border-border/50 bg-background/40 p-3 md:p-4">
                      <div
                        className="origin-top-left overflow-x-auto transition-transform"
                        style={{ transform: `scale(${zoomLevel})` }}
                      >
                        <BlockGrid
                          block={selectedBlock}
                          onStackClick={handleStackClick}
                          highlightedContainer={searchQuery}
                          highlightedPosition={highlightedPosition ?? undefined}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Grid3X3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                        <p>Chọn một khu bãi từ danh sách bên trái</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="import">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <VesselPanel
                vessels={vessels}
                selectedVessel={selectedVessel}
                onSelectVessel={setSelectedVessel}
                onDischargeContainer={handleDischargeContainer}
              />
            </div>

            <div className="space-y-4 xl:col-span-8">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Wand2 className="h-4 w-4 text-primary" />
                      Khu bãi nhập
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Nhấn container đã dỡ để cấp vị trí bãi tự động</p>
                  </div>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {yardBlocks
                      .filter((block) => block.type === "Import")
                      .map((block) => (
                        <Button
                          key={block.id}
                          variant={selectedBlock?.id === block.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedBlock(block)}
                        >
                          {block.id}
                        </Button>
                      ))}
                  </div>

                  {selectedBlock && selectedBlock.type === "Import" ? (
                    <div className="rounded-xl border border-border/50 bg-background/40 p-3 md:p-4">
                      <BlockGrid
                        block={selectedBlock}
                        onStackClick={handleStackClick}
                        highlightedPosition={highlightedPosition ?? undefined}
                      />
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center text-muted-foreground">
                      <p>Chọn một khu bãi nhập để xem chi tiết</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="export">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-4">
              <ExportVesselPanel
                vessels={exportVessels}
                selectedVessel={selectedExportVessel}
                onSelectVessel={setSelectedExportVessel}
                onPlanContainer={(container) => {
                  setSearchQuery(container.containerNo)
                }}
                onViewStackPlan={(vessel) => {
                  setSelectedExportVessel(vessel)
                  setShowExportStackPlan(true)
                }}
              />
            </div>

            <div className="space-y-4 xl:col-span-8">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                      <Layers className="h-4 w-4 text-primary" />
                      Khu bãi xuất
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Quy tắc xếp: container load trước nằm tầng trên để giảm rehandle
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="pb-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {yardBlocks
                      .filter((block) => block.type === "Export")
                      .map((block) => (
                        <Button
                          key={block.id}
                          variant={selectedBlock?.id === block.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedBlock(block)}
                        >
                          {block.id}
                        </Button>
                      ))}
                  </div>

                  {selectedBlock && selectedBlock.type === "Export" ? (
                    <div className="rounded-xl border border-border/50 bg-background/40 p-3 md:p-4">
                      <BlockGrid
                        block={selectedBlock}
                        onStackClick={handleStackClick}
                        highlightedPosition={highlightedPosition ?? undefined}
                      />
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center text-muted-foreground">
                      <p>Chọn một khu bãi xuất để xem chi tiết</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <p className="mb-3 text-sm font-medium">Nguyên tắc hiển thị khu xuất</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
                      <p className="mb-1 font-medium text-emerald-400">Thứ tự xếp thấp</p>
                      <p className="text-xs text-muted-foreground">
                        Container cần xếp lên tàu trước nên ưu tiên đặt ở tầng trên.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/50 p-3 text-sm">
                      <p className="mb-1 font-medium text-foreground">Thứ tự xếp cao</p>
                      <p className="text-xs text-muted-foreground">
                        Container xếp lên tàu sau đặt ở tầng dưới để giảm thao tác đảo chuyển.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Sheet open={showStackSheet} onOpenChange={setShowStackSheet}>
        <SheetContent className="w-[90vw] sm:max-w-2xl lg:max-w-3xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Chi tiết stack
            </SheetTitle>
            <SheetDescription>
              Bảng chi tiết theo từng tầng, gồm tình trạng chặn, rehandle và thông tin vận hành.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-3 max-h-[calc(100vh-190px)] overflow-y-auto px-4 pb-4">
            {selectedStack && selectedBlock ? (
              <StackDetail
                stack={selectedStack}
                block={selectedBlock}
                targetContainerId={searchQuery || undefined}
              />
            ) : null}
          </div>
          <div className="mt-6">
            <Button variant="outline" className="w-full" onClick={() => setShowStackSheet(false)}>
              Đóng
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <SlotSuggestionDialog
        open={showSlotDialog}
        onOpenChange={setShowSlotDialog}
        container={containerToSlot}
        blocks={yardBlocks}
        onSelectSlot={handleSelectSlot}
      />

      <ExportStackPlanDialog
        open={showExportStackPlan}
        onOpenChange={setShowExportStackPlan}
        vessel={selectedExportVessel}
      />
    </DashboardLayout>
  )
}
