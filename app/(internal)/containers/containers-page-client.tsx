"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Download, Package, Search } from "lucide-react"

import { ContainerImportDialog } from "@/components/containers/container-import-dialog"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { ContainerFormOptions } from "@/lib/containers/container-master-data"
import {
  buildContainerDirectoryStats,
  filterContainerDirectoryItems,
  getContainerStatusMeta,
  type ContainerDirectoryFilterStatus,
  type ContainerDirectoryItem,
} from "@/lib/containers/container-view-model"
import { cn } from "@/lib/utils"

/* ── Pagination constants ──────────────────────────────── */

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const
const DEFAULT_PAGE_SIZE = 20

/** Build a compact page range like [1, '…', 4, 5, 6, '…', 10] */
function buildPageRange(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const pages: (number | "ellipsis")[] = [1]
  const left = Math.max(2, currentPage - 1)
  const right = Math.min(totalPages - 1, currentPage + 1)
  if (left > 2) pages.push("ellipsis")
  for (let i = left; i <= right; i++) pages.push(i)
  if (right < totalPages - 1) pages.push("ellipsis")
  pages.push(totalPages)
  return pages
}

/* ── Components ────────────────────────────────────────── */

function StatCard(props: {
  title: string
  value: number
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{props.title}</p>
        <p className="mt-2 text-2xl font-bold text-foreground">{props.value}</p>
      </CardContent>
    </Card>
  )
}

function getCustomsMeta(label: string | null) {
  switch (label) {
    case "Đã thông quan":
      return {
        label,
        className: "bg-success/10 text-success",
      }
    case "Đang bị giữ":
      return {
        label,
        className: "bg-destructive/10 text-destructive",
      }
    case "Chờ xử lý":
    default:
      return {
        label: label ?? "Chưa cập nhật",
        className: "bg-warning/10 text-warning",
      }
  }
}

function DetailField(props: {
  label: string
  value: string
  mono?: boolean
  muted?: boolean
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/15 p-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {props.label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm font-medium text-foreground",
          props.mono && "font-mono",
          props.muted && "font-normal text-muted-foreground",
        )}
      >
        {props.value}
      </p>
    </div>
  )
}

function ContainerDetailSheet(props: {
  container: ContainerDirectoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!props.container) {
    return null
  }

  const { container } = props
  const statusMeta = getContainerStatusMeta(container.status)
  const customsMeta = getCustomsMeta(container.customsStatusLabel)

  return (
    <Sheet open={props.open} onOpenChange={props.onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border/60 pb-4 pr-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={cn("border-transparent", statusMeta.className)}>
              {statusMeta.label}
            </Badge>
            <Badge className={cn("border-transparent", customsMeta.className)}>
              {customsMeta.label}
            </Badge>
            {container.categoryLabel ? <Badge variant="outline">{container.categoryLabel}</Badge> : null}
          </div>
          <SheetTitle className="mt-3 font-mono text-xl">{container.containerNo}</SheetTitle>
          <SheetDescription>
            {container.locationLabel} · {container.destinationLabel}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 overflow-y-auto px-4 pb-6 pt-4">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Tổng quan vận hành</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Vị trí hiện tại" value={container.locationLabel} />
              <DetailField label="Đích đến" value={container.destinationLabel} />
              <DetailField label="ETA" value={container.etaLabel} />
              <DetailField label="Trọng lượng" value={container.weightLabel} mono />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Nhận diện</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Loại container" value={container.typeLabel} />
              <DetailField label="Category" value={container.categoryLabel ?? "Chưa xác định"} />
              <DetailField label="T-State" value={container.tStateLabel ?? "Chưa cập nhật"} />
              <DetailField label="V-State" value={container.vStateLabel ?? "Chưa cập nhật"} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Hành trình & đối tác</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Hãng tàu" value={container.shippingLineLabel ?? "Chưa gán"} />
              <DetailField label="Khách hàng" value={container.customerLabel ?? "Chưa gán"} />
              <DetailField label="Tuyến" value={container.routeLabel ?? "Chưa gán"} />
              <DetailField label="Trạng thái hải quan" value={container.customsStatusLabel ?? "Chưa cập nhật"} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Chứng từ</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Bill No" value={container.billNo ?? "Chưa có"} mono />
              <DetailField label="Seal No" value={container.sealNo ?? "Chưa có"} mono />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function ContainersPageClient({
  containers,
  formOptions,
}: {
  containers: ContainerDirectoryItem[]
  formOptions: ContainerFormOptions
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<ContainerDirectoryFilterStatus>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  const [selectedContainer, setSelectedContainer] = useState<ContainerDirectoryItem | null>(null)

  const stats = useMemo(() => buildContainerDirectoryStats(containers), [containers])
  const filteredContainers = useMemo(
    () =>
      filterContainerDirectoryItems(containers, {
        searchTerm,
        status: statusFilter,
      }),
    [containers, searchTerm, statusFilter],
  )

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  useEffect(() => {
    if (!selectedContainer) {
      return
    }

    if (!filteredContainers.some((item) => item.id === selectedContainer.id)) {
      setSelectedContainer(null)
    }
  }, [filteredContainers, selectedContainer])

  const totalPages = Math.max(1, Math.ceil(filteredContainers.length / pageSize))
  // Clamp page if data shrinks (e.g. after filter)
  const safePage = Math.min(currentPage, totalPages)

  const paginatedContainers = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredContainers.slice(start, start + pageSize)
  }, [filteredContainers, safePage, pageSize])

  const handlePageSizeChange = useCallback((value: string) => {
    setPageSize(Number(value))
    setCurrentPage(1)
  }, [])

  const pageRange = buildPageRange(safePage, totalPages)

  return (
    <DashboardLayout
      title="Quản lý container"
      description="Theo dõi container, trạng thái hiện tại và đích đến."
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tổng container" value={stats.total} />
          <StatCard title="Tại bãi cảng biển" value={stats.atSeaportYard} />
          <StatCard title="Đang hành trình" value={stats.inTransit} />
          <StatCard title="Tại bãi cảng cạn" value={stats.atDryportYard} />
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">Danh sách container</CardTitle>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="w-full bg-secondary pl-9 md:w-72"
                    placeholder="Tìm theo mã, hãng tàu, khách hàng, tuyến..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
                <Select
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as ContainerDirectoryFilterStatus)
                  }
                >
                  <SelectTrigger className="w-full md:w-52">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="new">Mới tạo</SelectItem>
                    <SelectItem value="at_seaport_yard">Tại bãi cảng biển</SelectItem>
                    <SelectItem value="on_barge">Đã xếp lên sà lan</SelectItem>
                    <SelectItem value="in_transit">Đang hành trình</SelectItem>
                    <SelectItem value="at_dryport_yard">Tại bãi cảng cạn</SelectItem>
                    <SelectItem value="released">Đã giải phóng</SelectItem>
                    <SelectItem value="hold">Đang giữ</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" disabled>
                  <Download className="size-4" />
                </Button>
                <ContainerImportDialog />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {containers.length === 0 ? (
              <Empty className="border border-dashed border-border bg-muted/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Package />
                  </EmptyMedia>
                  <EmptyTitle>Chưa có container trong cơ sở dữ liệu</EmptyTitle>
                </EmptyHeader>
              </Empty>
            ) : filteredContainers.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                Không có container phù hợp với bộ lọc hiện tại.
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Mã container</TableHead>
                        <TableHead>Loại / Phân loại</TableHead>
                        <TableHead>T/V State</TableHead>
                        <TableHead>Trạng thái & Vị trí</TableHead>
                        <TableHead>Hải quan & Chứng từ</TableHead>
                        <TableHead>Đích đến / Tuyến</TableHead>
                        <TableHead>Ngày dự kiến</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedContainers.map((container) => {
                        const statusMeta = getContainerStatusMeta(container.status)

                        return (
                          <TableRow
                            key={container.id}
                            className={cn(
                              "cursor-pointer hover:bg-muted/30",
                              selectedContainer?.id === container.id && "bg-muted/30",
                            )}
                            onClick={() => setSelectedContainer(container)}
                            aria-selected={selectedContainer?.id === container.id}
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-mono font-medium">{container.containerNo}</p>
                                <p className="text-xs text-muted-foreground">
                                  {container.shippingLineLabel ?? "Chưa gắn hãng tàu"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 font-medium text-sm">
                                <p>{container.typeLabel}</p>
                                <Badge variant="outline" className="text-[10px] px-1 h-4 font-normal">
                                  {container.categoryLabel || "Chưa xác định"}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1 flex-col sm:flex-row text-xs">
                                <span className={cn("px-1.5 py-0.5 rounded-sm bg-muted whitespace-nowrap", container.tStateLabel === "Có hàng" ? "bg-blue-100 text-blue-800" : "")}>{container.tStateLabel || "--"}</span>
                                <span className={cn("px-1.5 py-0.5 rounded-sm bg-muted whitespace-nowrap", container.vStateLabel === "Hoạt động" ? "bg-green-100 text-green-800" : "")}>{container.vStateLabel || "--"}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge className={cn("border-transparent", statusMeta.className)}>
                                  {statusMeta.label}
                                </Badge>
                                <p className="text-xs text-muted-foreground break-words max-w-[150px]">
                                  {container.locationLabel}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 text-xs">
                                <p>HQ: <span className={cn("font-medium", container.customsStatusLabel === "Đã thông quan" ? "text-success" : "text-warning")}>{container.customsStatusLabel}</span></p>
                                <p className="text-muted-foreground">BL: {container.billNo || "N/A"}</p>
                                <p className="text-muted-foreground">Seal: {container.sealNo || "N/A"}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground space-y-1 max-w-[150px] truncate">
                              <p className="font-medium text-foreground">{container.destinationLabel}</p>
                              <p className="text-xs">{container.routeLabel ?? "Chưa gắn tuyến"}</p>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground space-y-1">
                              <p>{container.etaLabel}</p>
                              <p className="text-xs font-mono">{container.weightLabel}</p>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* ── Pagination bar ──────────────────────────── */}
                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left: info + page size */}
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      Hiển thị {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filteredContainers.length)} trong {filteredContainers.length} container
                      {filteredContainers.length !== containers.length && (
                        <span className="ml-1">(tổng {containers.length})</span>
                      )}
                    </span>
                    <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                      <SelectTrigger className="h-8 w-[72px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size} / trang
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Right: page buttons */}
                  {totalPages > 1 && (
                    <nav className="flex items-center gap-1" aria-label="Phân trang">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={safePage <= 1}
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        aria-label="Trang trước"
                      >
                        <ChevronLeft className="size-4" />
                      </Button>

                      {pageRange.map((item, idx) =>
                        item === "ellipsis" ? (
                          <span key={`e-${idx}`} className="flex size-8 items-center justify-center text-xs text-muted-foreground">
                            …
                          </span>
                        ) : (
                          <Button
                            key={item}
                            variant={item === safePage ? "default" : "outline"}
                            size="icon"
                            className="size-8 text-xs"
                            onClick={() => setCurrentPage(item)}
                            aria-current={item === safePage ? "page" : undefined}
                          >
                            {item}
                          </Button>
                        ),
                      )}

                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        disabled={safePage >= totalPages}
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        aria-label="Trang sau"
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </nav>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <ContainerDetailSheet
        container={selectedContainer}
        open={!!selectedContainer}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedContainer(null)
          }
        }}
      />
    </DashboardLayout>
  )
}
