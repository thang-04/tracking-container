"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { AlertTriangle, Grid3X3, LayoutList, Search, Warehouse } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { YardOverview } from "@/lib/yard/get-yard-overview"
import { cn } from "@/lib/utils"

type YardItem = YardOverview["yards"][number]
type YardBlockItem = YardItem["blocks"][number]
type YardContainerItem = YardOverview["containers"][number]
type YardSlotItem = YardBlockItem["slots"][number]

const ALL_FILTER = "__all__"

function getCustomsMeta(status: YardContainerItem["customsStatus"]) {
  switch (status) {
    case "cleared":
      return {
        label: "Đã thông quan",
        className: "bg-success/10 text-success",
      }
    case "hold":
      return {
        label: "Đang giữ",
        className: "bg-destructive/10 text-destructive",
      }
    case "pending":
    default:
      return {
        label: "Chờ xử lý",
        className: "bg-warning/10 text-warning",
      }
  }
}

function getOccupancyCardTone(percent: number) {
  if (percent >= 90) return "border-destructive/60 bg-destructive/10"
  if (percent >= 80) return "border-warning/60 bg-warning/10"
  if (percent > 0) return "border-primary/30 bg-primary/5"

  return "border-border bg-card"
}

function getOccupancyProgressTone(percent: number) {
  if (percent >= 90) return "bg-destructive"
  if (percent >= 80) return "bg-warning"

  return "bg-primary"
}

function StatCard(props: { title: string; value: number; helper: string }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{props.title}</p>
        <p className="mt-2 text-2xl font-bold text-foreground">{props.value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{props.helper}</p>
      </CardContent>
    </Card>
  )
}

function DetailRow(props: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {props.label}
      </p>
      <p className={cn("mt-1 text-sm font-medium text-foreground", props.valueClassName)}>
        {props.value}
      </p>
    </div>
  )
}

function BlockGrid({
  block,
  onSelectContainer,
}: {
  block: YardBlockItem
  onSelectContainer: (container: NonNullable<YardSlotItem["container"]>) => void
}) {
  const positionedSlots = useMemo(
    () => block.slots.filter((slot) => slot.rowNo !== null && slot.bayNo !== null),
    [block.slots],
  )

  const rows = useMemo(
    () =>
      Array.from(new Set(positionedSlots.map((slot) => slot.rowNo as number))).sort(
        (a, b) => a - b,
      ),
    [positionedSlots],
  )
  const bays = useMemo(
    () =>
      Array.from(new Set(positionedSlots.map((slot) => slot.bayNo as number))).sort(
        (a, b) => a - b,
      ),
    [positionedSlots],
  )

  const slotMap = useMemo(() => {
    const map = new Map<string, YardSlotItem[]>()

    positionedSlots.forEach((slot) => {
      const key = `${slot.rowNo}-${slot.bayNo}`
      const current = map.get(key) ?? []
      current.push(slot)
      map.set(key, current)
    })

    map.forEach((value, key) => {
      map.set(
        key,
        [...value].sort((a, b) => {
          const tierA = a.tierNo ?? 0
          const tierB = b.tierNo ?? 0
          return tierB - tierA
        }),
      )
    })

    return map
  }, [positionedSlots])

  const unpositionedSlots = block.slots.filter((slot) => slot.rowNo === null || slot.bayNo === null)

  if (rows.length === 0 || bays.length === 0) {
    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-dashed border-border bg-muted/10 p-6 text-sm text-muted-foreground">
          Block này chưa có đủ dữ liệu `row/bay` để dựng sơ đồ trực quan.
        </div>
        {unpositionedSlots.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Slot chưa có tọa độ</p>
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {unpositionedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm",
                    slot.isOccupied
                      ? "border-primary/40 bg-primary/8"
                      : "border-border/60 bg-muted/20",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono font-medium">{slot.code}</span>
                    <Badge variant={slot.isOccupied ? "default" : "outline"}>
                      {slot.isOccupied ? "Đang dùng" : "Trống"}
                    </Badge>
                  </div>
                  {slot.container ? (
                    <button
                      type="button"
                      className="mt-2 text-left text-primary underline-offset-4 hover:underline"
                      onClick={() => onSelectContainer(slot.container!)}
                    >
                      {slot.container.containerNo}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-xl border border-border bg-muted/10 p-4">
        <div
          className="grid min-w-[720px] gap-2"
          style={{ gridTemplateColumns: `72px repeat(${bays.length}, minmax(112px, 1fr))` }}
        >
          <div />
          {bays.map((bay) => (
            <div
              key={`header-${bay}`}
              className="rounded-lg bg-background px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"
            >
              Bay {bay}
            </div>
          ))}
          {rows.map((row) => (
            <div key={`row-${row}`} className="contents">
              <div className="flex items-start justify-center rounded-lg bg-background px-3 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Row {row}
              </div>
              {bays.map((bay) => {
                const stackSlots = slotMap.get(`${row}-${bay}`) ?? []

                return (
                  <div
                    key={`${row}-${bay}`}
                    className="rounded-xl border border-border/70 bg-background p-2"
                  >
                    {stackSlots.length === 0 ? (
                      <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-border/60 bg-muted/10 text-xs text-muted-foreground">
                        Trống
                      </div>
                    ) : (
                      <div className="flex min-h-24 flex-col gap-2">
                        {stackSlots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={!slot.container}
                            title={slot.container ? slot.container.containerNo : slot.code}
                            onClick={() => slot.container && onSelectContainer(slot.container)}
                            className={cn(
                              "rounded-lg border px-2 py-2 text-left transition",
                              slot.container
                                ? "border-primary/40 bg-primary/8 hover:border-primary hover:bg-primary/12"
                                : "border-border/60 bg-muted/20 text-muted-foreground",
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-mono text-[11px] font-semibold">
                                {slot.code}
                              </span>
                              <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                T{slot.tierNo ?? "?"}
                              </span>
                            </div>
                            <div className="mt-1 text-xs">
                              {slot.container ? slot.container.containerNo : "Trống"}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {unpositionedSlots.length > 0 ? (
        <div className="space-y-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <AlertTriangle className="size-4 text-warning" />
            {unpositionedSlots.length} slot chưa có đủ tọa độ để hiển thị trên sơ đồ
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {unpositionedSlots.map((slot) => (
              <div key={slot.id} className="rounded-lg bg-background/70 px-3 py-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono font-medium">{slot.code}</span>
                  <Badge variant={slot.isOccupied ? "default" : "outline"}>
                    {slot.isOccupied ? "Đang dùng" : "Trống"}
                  </Badge>
                </div>
                {slot.container ? (
                  <button
                    type="button"
                    className="mt-2 text-left text-primary underline-offset-4 hover:underline"
                    onClick={() => onSelectContainer(slot.container!)}
                  >
                    {slot.container.containerNo}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function ContainerDetailDialog({
  container,
  open,
  onOpenChange,
}: {
  container: YardContainerItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!container) {
    return null
  }

  const customsMeta = getCustomsMeta(container.customsStatus)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-lg">{container.containerNo}</span>
            <Badge className={cn("border-transparent", container.statusClassName)}>
              {container.statusLabel}
            </Badge>
            <Badge className={cn("border-transparent", customsMeta.className)}>
              {customsMeta.label}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Thông tin vận hành hiện tại của container trong bãi.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-2">
          <DetailRow label="Vị trí hiện tại" value={container.locationLabel} />
          <DetailRow
            label="Bãi / Block / Slot"
            value={`${container.yardCode ?? "—"} / ${container.blockCode ?? "—"} / ${container.slotCode ?? "—"}`}
          />
          <DetailRow label="Loại container" value={container.typeLabel} />
          <DetailRow label="Trọng lượng" value={container.weightLabel} />
          <DetailRow label="Hãng tàu" value={container.shippingLineLabel ?? "Chưa gán"} />
          <DetailRow label="Khách hàng" value={container.customerLabel ?? "Chưa gán"} />
          <DetailRow label="Tuyến" value={container.routeLabel ?? "Chưa gán"} />
          <DetailRow label="Đích đến" value={container.destinationLabel} />
          <DetailRow label="ETA" value={container.etaLabel} />
          <DetailRow label="Cập nhật gần nhất" value={container.lastEventLabel} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

function BlockDetailDialog({
  block,
  open,
  onOpenChange,
  onSelectContainer,
}: {
  block: YardBlockItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectContainer: (container: NonNullable<YardSlotItem["container"]>) => void
}) {
  if (!block) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <span>{block.code}</span>
            <Badge variant="outline">{block.yardCode}</Badge>
            <Badge variant="outline">{block.portName}</Badge>
          </DialogTitle>
          <DialogDescription>
            {block.name} · {block.occupiedSlots}/{block.totalSlots} slot đang sử dụng ·{" "}
            {block.occupancyPercent}% công suất
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 md:grid-cols-4">
          <DetailRow label="Tổng slot" value={`${block.totalSlots}`} />
          <DetailRow label="Đang dùng" value={`${block.occupiedSlots}`} />
          <DetailRow label="Còn trống" value={`${block.availableSlots}`} />
          <DetailRow
            label="Tọa độ trực quan"
            value={`${block.positionedSlots}/${block.totalSlots} slot`}
          />
        </div>

        <BlockGrid block={block} onSelectContainer={onSelectContainer} />
      </DialogContent>
    </Dialog>
  )
}

export function YardPageClient({ overview }: { overview: YardOverview }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [portFilter, setPortFilter] = useState(ALL_FILTER)
  const [yardFilter, setYardFilter] = useState(ALL_FILTER)
  const [blockFilter, setBlockFilter] = useState(ALL_FILTER)
  const [statusFilter, setStatusFilter] = useState<YardContainerItem["status"] | typeof ALL_FILTER>(
    ALL_FILTER,
  )
  const [customsFilter, setCustomsFilter] = useState<
    YardContainerItem["customsStatus"] | typeof ALL_FILTER
  >(ALL_FILTER)
  const [activeBlock, setActiveBlock] = useState<YardBlockItem | null>(null)
  const [activeContainer, setActiveContainer] = useState<YardContainerItem | null>(null)
  const deferredSearchTerm = useDeferredValue(searchTerm)

  const allBlocks = useMemo(
    () => overview.yards.flatMap((yard) => yard.blocks),
    [overview.yards],
  )

  const filteredContainers = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase()

    return overview.containers.filter((container) => {
      const matchesPort = portFilter === ALL_FILTER || container.portCode === portFilter
      const matchesYard = yardFilter === ALL_FILTER || container.yardId === yardFilter
      const matchesBlock = blockFilter === ALL_FILTER || container.blockId === blockFilter
      const matchesStatus = statusFilter === ALL_FILTER || container.status === statusFilter
      const matchesCustoms =
        customsFilter === ALL_FILTER || container.customsStatus === customsFilter

      const haystack = [
        container.containerNo,
        container.typeLabel,
        container.shippingLineLabel ?? "",
        container.customerLabel ?? "",
        container.routeLabel ?? "",
        container.destinationLabel,
        container.locationLabel,
        container.yardCode ?? "",
        container.blockCode ?? "",
        container.slotCode ?? "",
        container.portCode ?? "",
      ]
        .join(" ")
        .toLowerCase()

      const matchesSearch =
        normalizedSearch.length === 0 || haystack.includes(normalizedSearch)

      return (
        matchesPort &&
        matchesYard &&
        matchesBlock &&
        matchesStatus &&
        matchesCustoms &&
        matchesSearch
      )
    })
  }, [
    blockFilter,
    customsFilter,
    deferredSearchTerm,
    overview.containers,
    portFilter,
    statusFilter,
    yardFilter,
  ])

  const filteredBlockIds = useMemo(
    () =>
      new Set(
        filteredContainers
          .map((container) => container.blockId)
          .filter((value): value is string => Boolean(value)),
      ),
    [filteredContainers],
  )

  const visibleYards = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase()
    const hasContainerFilters =
      normalizedSearch.length > 0 ||
      statusFilter !== ALL_FILTER ||
      customsFilter !== ALL_FILTER

    return overview.yards
      .filter((yard) => portFilter === ALL_FILTER || yard.portCode === portFilter)
      .filter((yard) => yardFilter === ALL_FILTER || yard.id === yardFilter)
      .map((yard) => {
        const blocks = yard.blocks.filter((block) => {
          if (blockFilter !== ALL_FILTER && block.id !== blockFilter) {
            return false
          }

          const searchHaystack = [
            yard.code,
            yard.name,
            yard.portCode,
            yard.portName,
            block.code,
            block.name,
          ]
            .join(" ")
            .toLowerCase()

          if (normalizedSearch.length > 0 && searchHaystack.includes(normalizedSearch)) {
            return true
          }

          if (!hasContainerFilters) {
            return true
          }

          return filteredBlockIds.has(block.id)
        })

        return { ...yard, blocks }
      })
      .filter((yard) => yard.blocks.length > 0)
  }, [
    blockFilter,
    customsFilter,
    deferredSearchTerm,
    filteredBlockIds,
    overview.yards,
    portFilter,
    statusFilter,
    yardFilter,
  ])

  const portOptions = useMemo(() => {
    const map = new Map<string, { code: string; name: string; portType: YardItem["portType"] }>()

    overview.yards.forEach((yard) => {
      map.set(yard.portCode, {
        code: yard.portCode,
        name: yard.portName,
        portType: yard.portType,
      })
    })

    return Array.from(map.values())
  }, [overview.yards])

  const yardOptions = useMemo(
    () =>
      overview.yards.filter(
        (yard) => portFilter === ALL_FILTER || yard.portCode === portFilter,
      ),
    [overview.yards, portFilter],
  )

  const blockOptions = useMemo(
    () =>
      allBlocks.filter((block) => {
        if (yardFilter !== ALL_FILTER && block.yardId !== yardFilter) return false
        if (portFilter !== ALL_FILTER && block.portCode !== portFilter) return false

        return true
      }),
    [allBlocks, portFilter, yardFilter],
  )

  const selectedContainerFromBlock = (container: NonNullable<YardSlotItem["container"]>) => {
    setActiveBlock(null)
    setActiveContainer(overview.containers.find((item) => item.id === container.id) ?? null)
  }

  return (
    <DashboardLayout
      title="Quản lý bãi"
      description="Theo dõi sức chứa block, tình trạng slot và container đang nằm trong bãi."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
          <StatCard
            title="Tổng bãi"
            value={overview.summary.totalYards}
            helper={`${overview.summary.totalBlocks} block đang hoạt động`}
          />
          <StatCard
            title="Tổng slot"
            value={overview.summary.totalSlots}
            helper={`${overview.summary.occupiedSlots} slot đã dùng`}
          />
          <StatCard
            title="Còn trống"
            value={overview.summary.availableSlots}
            helper="Slot đang sẵn sàng tiếp nhận"
          />
          <StatCard
            title="Bãi cảng biển"
            value={overview.summary.atSeaportYardContainers}
            helper="Container đang ở seaport yard"
          />
          <StatCard
            title="Bãi cảng cạn"
            value={overview.summary.atDryportYardContainers}
            helper="Container đang ở dry port yard"
          />
          <StatCard
            title="Block sắp đầy"
            value={overview.summary.highOccupancyBlocks}
            helper="Ngưỡng cảnh báo từ 80%"
          />
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-medium">Bộ lọc vận hành bãi</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="bg-secondary pl-9"
                placeholder="Tìm theo container, bãi, block, slot..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <Select value={portFilter} onValueChange={setPortFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Cảng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>Tất cả cảng</SelectItem>
                {portOptions.map((port) => (
                  <SelectItem key={port.code} value={port.code}>
                    {port.code} · {port.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yardFilter} onValueChange={setYardFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Bãi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>Tất cả bãi</SelectItem>
                {yardOptions.map((yard) => (
                  <SelectItem key={yard.id} value={yard.id}>
                    {yard.code} · {yard.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={blockFilter} onValueChange={setBlockFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Block" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>Tất cả block</SelectItem>
                {blockOptions.map((block) => (
                  <SelectItem key={block.id} value={block.id}>
                    {block.code} · {block.yardCode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as YardContainerItem["status"] | typeof ALL_FILTER)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>Tất cả trạng thái</SelectItem>
                <SelectItem value="at_seaport_yard">Tại bãi cảng biển</SelectItem>
                <SelectItem value="at_dryport_yard">Tại bãi cảng cạn</SelectItem>
                <SelectItem value="hold">Đang giữ</SelectItem>
                <SelectItem value="new">Mới tạo</SelectItem>
                <SelectItem value="on_barge">Đã lên sà lan</SelectItem>
                <SelectItem value="in_transit">Đang hành trình</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={customsFilter}
              onValueChange={(value) =>
                setCustomsFilter(
                  value as YardContainerItem["customsStatus"] | typeof ALL_FILTER,
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Hải quan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_FILTER}>Tất cả hải quan</SelectItem>
                <SelectItem value="cleared">Đã thông quan</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="hold">Đang giữ</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {overview.yards.length === 0 ? (
          <Empty className="border border-dashed border-border bg-muted/20">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Warehouse />
              </EmptyMedia>
              <EmptyTitle>Chưa có dữ liệu bãi để hiển thị</EmptyTitle>
              <EmptyDescription>
                Hệ thống cần `yard`, `block`, `slot` thực tế trong cơ sở dữ liệu trước khi có
                thể dựng sơ đồ bãi.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Tabs defaultValue="grid" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grid" className="gap-2">
                <Grid3X3 className="size-4" />
                Sơ đồ bãi
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-2">
                <LayoutList className="size-4" />
                Danh sách container
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-4">
              {visibleYards.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/15 p-10 text-center text-sm text-muted-foreground">
                  Không có block nào khớp với bộ lọc hiện tại.
                </div>
              ) : (
                visibleYards.map((yard) => (
                  <Card key={yard.id} className="border-border/50">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base font-medium">
                            {yard.code} · {yard.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {yard.portName} · {yard.occupiedSlots}/{yard.totalSlots} slot đang sử
                            dụng · {yard.occupancyPercent}% công suất
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {yard.portType === "seaport" ? "Cảng biển" : "Cảng cạn"}
                          </Badge>
                          <Badge variant="secondary">{yard.blocks.length} block</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {yard.blocks.map((block) => (
                          <button
                            key={block.id}
                            type="button"
                            onClick={() => setActiveBlock(block)}
                            className={cn(
                              "rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm",
                              getOccupancyCardTone(block.occupancyPercent),
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold text-foreground">{block.code}</p>
                                <p className="text-sm text-muted-foreground">{block.name}</p>
                              </div>
                              <Badge
                                variant="outline"
                                className="border-transparent bg-background/80"
                              >
                                {block.occupancyPercent}%
                              </Badge>
                            </div>
                            <div className="mt-4 flex items-end justify-between gap-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                                  Occupancy
                                </p>
                                <p className="mt-1 text-lg font-semibold text-foreground">
                                  {block.occupiedSlots}/{block.totalSlots} slot
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {block.rows > 0 && block.bays > 0
                                  ? `${block.rows} row · ${block.bays} bay · ${Math.max(block.tiers, 1)} tier`
                                  : `${block.positionedSlots}/${block.totalSlots} slot có tọa độ`}
                              </p>
                            </div>
                            <div className="mt-4 h-2 rounded-full bg-background/80">
                              <div
                                className={cn(
                                  "h-2 rounded-full transition-all",
                                  getOccupancyProgressTone(block.occupancyPercent),
                                )}
                                style={{ width: `${Math.min(block.occupancyPercent, 100)}%` }}
                              />
                            </div>
                            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                              <span>{block.availableSlots} slot trống</span>
                              <span>{block.unpositionedSlots} slot thiếu tọa độ</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="list">
              <Card className="border-border/50">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">
                    Container đang gắn với bãi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredContainers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border bg-muted/15 p-10 text-center text-sm text-muted-foreground">
                      Không có container nào khớp bộ lọc hiện tại.
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Mã container</TableHead>
                            <TableHead>Vị trí</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead>Hải quan</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Hãng tàu / Khách hàng</TableHead>
                            <TableHead>ETA</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredContainers.map((container) => {
                            const customsMeta = getCustomsMeta(container.customsStatus)

                            return (
                              <TableRow
                                key={container.id}
                                className="cursor-pointer hover:bg-muted/30"
                                onClick={() => setActiveContainer(container)}
                              >
                                <TableCell>
                                  <div className="space-y-1">
                                    <p className="font-mono font-medium">{container.containerNo}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {container.destinationLabel}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  <div className="space-y-1">
                                    <p className="font-medium text-foreground">
                                      {container.locationLabel}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {container.portCode ?? "—"} · {container.yardCode ?? "—"} ·{" "}
                                      {container.blockCode ?? "—"} ·{" "}
                                      {container.slotCode ?? "Chưa gán slot"}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={cn(
                                      "border-transparent",
                                      container.statusClassName,
                                    )}
                                  >
                                    {container.statusLabel}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={cn("border-transparent", customsMeta.className)}
                                  >
                                    {customsMeta.label}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {container.typeLabel}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  <div className="space-y-1">
                                    <p>{container.shippingLineLabel ?? "Chưa gán hãng tàu"}</p>
                                    <p className="text-xs">
                                      {container.customerLabel ?? "Chưa gán khách hàng"}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  <div className="space-y-1">
                                    <p>{container.etaLabel}</p>
                                    <p className="text-xs">Cập nhật: {container.lastEventLabel}</p>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <BlockDetailDialog
        block={activeBlock}
        open={!!activeBlock}
        onOpenChange={(open) => {
          if (!open) {
            setActiveBlock(null)
          }
        }}
        onSelectContainer={selectedContainerFromBlock}
      />

      <ContainerDetailDialog
        container={activeContainer}
        open={!!activeContainer}
        onOpenChange={(open) => {
          if (!open) {
            setActiveContainer(null)
          }
        }}
      />
    </DashboardLayout>
  )
}
