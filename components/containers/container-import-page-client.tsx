"use client"

import Link from "next/link"
import { useActionState, useEffect, useMemo, useState } from "react"
import { ArrowLeft, CircleAlert, LoaderCircle, MapPin, Search, ShieldAlert, Thermometer, Waypoints } from "lucide-react"
import { useFormStatus } from "react-dom"

import { importContainerImportPreviewBatchAction } from "@/app/actions/containers"
import {
  initialContainerImportSubmitActionState,
} from "@/lib/containers/container-action-state"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { getContainerImportPreviewBatch } from "@/lib/containers/container-persistence"
import { cn } from "@/lib/utils"

type ContainerImportPreviewBatch = NonNullable<
  Awaited<ReturnType<typeof getContainerImportPreviewBatch>>
>

type PreviewRow = ContainerImportPreviewBatch["rows"][number] & {
  category: string | null
  vState: string | null
  tState: string | null
  stow: string | null
  grp: string | null
  sealNo2: string | null
  frghtKind: string | null
  ibActualVisit: string | null
  obActualVisit: string | null
  reqsPower: boolean | null
  tempRequiredC: string | null
  rlh: string | null
  rdh: string | null
  isOog: boolean | null
  imdg: string | null
  hazardous: boolean | null
}
type RowFilter = "all" | "valid" | "invalid"

function formatDateTime(value: string | null) {
  if (!value) {
    return "Chưa có"
  }

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

function formatText(value: string | null) {
  return value?.trim() ? value : "—"
}

function formatLocation(row: PreviewRow) {
  const parts = [
    row.currentPortCode,
    row.currentYardCode,
    row.currentBlockCode,
    row.currentSlotCode,
  ].filter((part): part is string => Boolean(part && part.trim()))

  return parts.length > 0 ? parts.join(" / ") : "Chưa xác định"
}

function getSourceModeLabel(sourceMode: ContainerImportPreviewBatch["batch"]["sourceMode"]) {
  return sourceMode === "edi" ? "EDI" : "CSV / Excel"
}

function getBatchStatusMeta(status: ContainerImportPreviewBatch["batch"]["status"]) {
  switch (status) {
    case "validated":
      return {
        label: "Đã kiểm tra",
        className: "bg-primary/10 text-primary",
      }
    case "imported":
      return {
        label: "Đã nhập",
        className: "bg-success/10 text-success",
      }
    case "partial":
      return {
        label: "Nhập một phần",
        className: "bg-warning/10 text-warning",
      }
    case "rejected":
      return {
        label: "Bị từ chối",
        className: "bg-destructive/10 text-destructive",
      }
    case "uploaded":
    default:
      return {
        label: "Đã tải lên",
        className: "bg-muted text-muted-foreground",
      }
  }
}

function getStatusHintLabel(statusHint: string | null) {
  switch (statusHint) {
    case "yard":
      return "Trong bãi"
    case "new":
      return "Mới tạo"
    case "at_seaport_yard":
      return "Bãi cảng biển"
    case "at_dryport_yard":
      return "Bãi cảng cạn"
    case "on_barge":
      return "Đã lên sà lan"
    case "in_transit":
      return "Đang hành trình"
    case "released":
      return "Đã giải phóng"
    case "hold":
      return "Đang giữ"
    default:
      return "Tự suy diễn"
  }
}

function getPreviewRowStateMeta(row: PreviewRow) {
  if (!row.isValid) {
    return {
      label: "Có lỗi",
      summary: `${row.errors.length} lỗi cần xử lý trước khi nhập`,
      className: "bg-destructive/10 text-destructive",
      badgeVariant: "destructive" as const,
    }
  }

  if (row.warnings.length > 0) {
    return {
      label: "Cần rà soát",
      summary: `${row.warnings.length} cảnh báo, có thể phát sinh tạo mới master data`,
      className: "bg-warning/10 text-warning",
      badgeVariant: "outline" as const,
    }
  }

  return {
    label: "Hợp lệ",
    summary: "Có thể nhập ngay nếu các dòng khác cũng đạt điều kiện",
    className: "bg-success/10 text-success",
    badgeVariant: "secondary" as const,
  }
}

function getMissingMasterData(row: PreviewRow) {
  const groups: Array<{ label: string; value: string }> = []

  if (row.warnings.some((warning) => warning.includes("loại container")) && row.containerTypeCode) {
    groups.push({ label: "Loại container", value: row.containerTypeCode })
  }

  if (row.warnings.some((warning) => warning.includes("cảng mới")) && row.currentPortCode) {
    groups.push({ label: "Cảng", value: row.currentPortCode })
  }

  if (row.warnings.some((warning) => warning.includes("hãng tàu")) && row.shippingLineCode) {
    groups.push({ label: "Hãng tàu", value: row.shippingLineCode })
  }

  if (row.warnings.some((warning) => warning.includes("chủ hàng")) && row.customerCode) {
    groups.push({ label: "Chủ hàng", value: row.customerCode })
  }

  return groups
}


function ImportBatchActionForm({
  batchId,
  canImport,
  rows,
  successRows,
  errorRows,
}: {
  batchId: string
  canImport: boolean
  rows: PreviewRow[]
  successRows: number
  errorRows: number
}) {
  const [state, formAction] = useActionState(
    importContainerImportPreviewBatchAction,
    initialContainerImportSubmitActionState,
  )
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)

  // Tổng hợp dữ liệu Master Data sẽ được tạo mới
  const missingSummary = useMemo(() => {
    const types = new Set<string>()
    const ports = new Set<string>()
    const lines = new Set<string>()
    const customers = new Set<string>()

    rows.forEach(row => {
      row.warnings.forEach(warn => {
        if (warn.includes("loại container")) types.add(row.containerTypeCode || "")
        if (warn.includes("cảng mới")) ports.add(row.currentPortCode || "")
        if (warn.includes("hãng tàu")) lines.add(row.shippingLineCode || "")
        if (warn.includes("chủ hàng")) customers.add(row.customerCode || "")
      })
    })

    return {
      types: Array.from(types).sort(),
      ports: Array.from(ports).sort(),
      lines: Array.from(lines).sort(),
      customers: Array.from(customers).sort(),
      hasAny: types.size > 0 || ports.size > 0 || lines.size > 0 || customers.size > 0
    }
  }, [rows])

  const handleOpenConfirm = () => {
    setIsConfirmOpen(true)
  }

  return (
    <div className="space-y-3">
      {state.status === "error" ? (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <CircleAlert className="size-4" />
          <AlertTitle>Không thể nhập batch preview</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <Button 
          type="button" 
          disabled={!canImport} 
          onClick={handleOpenConfirm}
        >
          Nhập dữ liệu
        </Button>
        
        <DialogContent className="max-w-2xl">
          <form action={formAction}>
            <input type="hidden" name="batchId" value={batchId} />
            <DialogHeader>
              <DialogTitle>Xác nhận nhập dữ liệu</DialogTitle>
              <DialogDescription>
                {errorRows > 0 ? (
                  <span className="block mb-2 font-medium text-amber-600">
                    Lưu ý: Bạn đang thực hiện nhập một phần. Hệ thống sẽ nhập {successRows} dòng hợp lệ và bỏ qua {errorRows} dòng bị lỗi.
                  </span>
                ) : null}
                Hệ thống phát hiện các danh mục (Master Data) sau chưa có trong cơ sở dữ liệu và sẽ được tự động tạo mới. Hãy kiểm tra lại trước khi xác nhận.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[60vh] overflow-y-auto py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Loại danh mục</TableHead>
                    <TableHead>Các mã sẽ tạo mới (duy nhất)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missingSummary.types.length > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">Loại container</TableCell>
                      <TableCell className="flex flex-wrap gap-1">
                        {missingSummary.types.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
                      </TableCell>
                    </TableRow>
                  )}
                  {missingSummary.ports.length > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">Cảng</TableCell>
                      <TableCell className="flex flex-wrap gap-1">
                        {missingSummary.ports.map(p => <Badge key={p} variant="outline">{p}</Badge>)}
                      </TableCell>
                    </TableRow>
                  )}
                  {missingSummary.lines.length > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">Hãng tàu</TableCell>
                      <TableCell className="flex flex-wrap gap-1">
                        {missingSummary.lines.map(l => <Badge key={l} variant="outline">{l}</Badge>)}
                      </TableCell>
                    </TableRow>
                  )}
                  {missingSummary.customers.length > 0 && (
                    <TableRow>
                      <TableCell className="font-medium">Chủ hàng</TableCell>
                      <TableCell className="flex flex-wrap gap-1">
                        {missingSummary.customers.map(c => <Badge key={c} variant="outline">{c}</Badge>)}
                      </TableCell>
                    </TableRow>
                  )}
                  {!missingSummary.hasAny && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-8 text-muted-foreground italic">
                        Tất cả danh mục đã tồn tại trong hệ thống.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <DialogActionButtons onCancel={() => setIsConfirmOpen(false)} />
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DialogActionButtons({ onCancel }: { onCancel: () => void }) {
  const { pending } = useFormStatus()
  
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
        Hủy
      </Button>
      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          "Xác nhận & Nhập dữ liệu"
        )}
      </Button>
    </DialogFooter>
  )
}

function PreviewStatCard(props: {
  title: string
  value: number
  tone?: "default" | "success" | "destructive"
}) {
  const toneClassName =
    props.tone === "success"
      ? "text-success"
      : props.tone === "destructive"
        ? "text-destructive"
        : "text-foreground"

  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{props.title}</p>
        <p className={cn("mt-2 text-2xl font-bold", toneClassName)}>{props.value}</p>
      </CardContent>
    </Card>
  )
}

function PreviewDetailField(props: {
  label: string
  value: string
  tone?: "default" | "strong"
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {props.label}
      </p>
      <p
        className={cn(
          "mt-1 text-sm text-foreground",
          props.tone === "strong" ? "font-semibold" : "font-medium",
        )}
      >
        {props.value}
      </p>
    </div>
  )
}

function PreviewRowDetailSheet({
  row,
  open,
  onOpenChange,
}: {
  row: PreviewRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!row) {
    return null
  }

  const stateMeta = getPreviewRowStateMeta(row)
  const missingMasterData = getMissingMasterData(row)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-xl">
        <SheetHeader className="border-b border-border/60 pb-4 pr-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Dòng {row.rowNo}</Badge>
            <Badge
              variant={stateMeta.badgeVariant}
              className={cn(
                stateMeta.badgeVariant === "outline" && "border-warning/30 bg-warning/10 text-warning",
              )}
            >
              {stateMeta.label}
            </Badge>
            {row.statusHint ? <Badge variant="secondary">{getStatusHintLabel(row.statusHint)}</Badge> : null}
          </div>
          <SheetTitle className="mt-3 font-mono text-xl">{row.containerNo || "Chưa có mã container"}</SheetTitle>
          <SheetDescription>{stateMeta.summary}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {(row.errors.length > 0 || row.warnings.length > 0) && (
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <ShieldAlert className="size-4 text-warning" />
                Kiểm tra dữ liệu
              </div>

              {row.errors.length > 0 ? (
                <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
                  <CircleAlert className="size-4" />
                  <AlertTitle>Phát hiện lỗi validation</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-1">
                      {row.errors.map((error) => (
                        <p key={error}>{error}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              ) : null}

              {row.warnings.length > 0 ? (
                <Alert className="border-warning/30 bg-warning/10 text-foreground [&>svg]:text-warning">
                  <CircleAlert className="size-4" />
                  <AlertTitle>Cần rà soát trước khi nhập</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-1">
                      {row.warnings.map((warning) => (
                        <p key={warning}>{warning}</p>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              ) : null}

              {missingMasterData.length > 0 ? (
                <div className="rounded-xl border border-border/60 bg-background p-3">
                  <p className="text-sm font-medium text-foreground">Master data có thể được tạo mới</p>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {missingMasterData.map((item) => (
                      <PreviewDetailField
                        key={`${item.label}-${item.value}`}
                        label={item.label}
                        value={item.value}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
          )}

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Waypoints className="size-4 text-primary" />
              Nhận diện
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <PreviewDetailField label="Loại container" value={formatText(row.containerTypeCode)} tone="strong" />
              <PreviewDetailField label="Category" value={formatText(row.category)} />
              <PreviewDetailField label="V-State" value={formatText(row.vState)} />
              <PreviewDetailField label="T-State" value={formatText(row.tState)} />
              <PreviewDetailField label="Seal 1" value={formatText(row.sealNo)} />
              <PreviewDetailField label="Seal 2" value={formatText(row.sealNo2)} />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Waypoints className="size-4 text-success" />
              Hành trình
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <PreviewDetailField label="Hãng tàu" value={formatText(row.shippingLineCode)} />
              <PreviewDetailField label="Inbound visit" value={formatText(row.ibActualVisit)} />
              <PreviewDetailField label="Bill No" value={formatText(row.billNo)} />
              <PreviewDetailField label="Outbound visit" value={formatText(row.obActualVisit)} />
              <PreviewDetailField label="ETA" value={formatDateTime(row.eta)} />
              <PreviewDetailField label="Status hint" value={getStatusHintLabel(row.statusHint)} />
              <PreviewDetailField label="Cảng đích / POD" value={formatText(row.currentPortCode)} />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="size-4 text-primary" />
              Vị trí
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <PreviewDetailField label="Port" value={formatText(row.currentPortCode)} />
              <PreviewDetailField label="Yard" value={formatText(row.currentYardCode)} />
              <PreviewDetailField label="Block" value={formatText(row.currentBlockCode)} />
              <PreviewDetailField label="Slot" value={formatText(row.currentSlotCode)} tone="strong" />
              <PreviewDetailField label="Stow" value={formatText(row.stow)} />
              <PreviewDetailField label="Group" value={formatText(row.grp)} />
              <PreviewDetailField label="Tóm tắt vị trí" value={formatLocation(row)} tone="strong" />
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Thermometer className="size-4 text-warning" />
              Đặc biệt
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <PreviewDetailField label="Reefer / Power" value={row.reqsPower ? "Có yêu cầu nguồn" : "Không"} />
              <PreviewDetailField label="Nhiệt độ yêu cầu" value={row.tempRequiredC ? `${row.tempRequiredC}°C` : "Chưa có"} />
              <PreviewDetailField label="RLH / RDH" value={`${formatText(row.rlh)} / ${formatText(row.rdh)}`} />
              <PreviewDetailField label="OOG" value={row.isOog ? "Có" : "Không"} />
              <PreviewDetailField label="IMDG" value={formatText(row.imdg)} />
              <PreviewDetailField label="Hazardous" value={row.hazardous ? "Có" : "Không"} />
              <PreviewDetailField label="Freight kind" value={formatText(row.frghtKind)} />
              <PreviewDetailField label="Ghi chú" value={formatText(row.note)} />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function PreviewRowTable({
  rows,
  totalRows,
  validRows,
  invalidRows,
  selectedRowKey,
  onSelectRow,
}: {
  rows: PreviewRow[]
  totalRows: number
  validRows: number
  invalidRows: number
  selectedRowKey: string | null
  onSelectRow: (row: PreviewRow) => void
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [rowFilter, setRowFilter] = useState<RowFilter>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const filteredRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return rows.filter((row) => {
      const matchesFilter =
        rowFilter === "all" ||
        (rowFilter === "valid" ? row.isValid : !row.isValid)

      const haystack = [
        row.rowNo,
        row.containerNo,
        row.containerTypeCode,
        row.customerCode,
        row.routeCode,
        row.shippingLineCode,
        row.grossWeightKg,
        row.eta,
        row.ibActualVisit,
        row.billNo,
        row.sealNo,
        row.currentPortCode,
        row.currentYardCode,
        row.currentBlockCode,
        row.currentSlotCode,
        row.statusHint,
        row.note,
        row.errors.join(" "),
      ]
        .filter((value) => value != null && `${value}`.trim().length > 0)
        .map((value) => `${value}`.toLowerCase())
        .join(" ")

      const matchesSearch =
        normalizedSearch.length === 0 || haystack.includes(normalizedSearch)

      return matchesFilter && matchesSearch
    })
  }, [rowFilter, rows, searchTerm])

  const totalFilteredRows = filteredRows.length
  const totalPages = Math.ceil(totalFilteredRows / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedRows = filteredRows.slice(startIndex, startIndex + pageSize)

  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, rowFilter, pageSize])

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-medium">Bảng preview</CardTitle>
            <p className="text-sm text-muted-foreground">
              Lọc theo trạng thái, tìm theo container hoặc bất kỳ trường nào trong batch.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Tabs
              value={rowFilter}
              onValueChange={(value) => setRowFilter(value as RowFilter)}
              className="w-full md:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 md:w-auto">
                <TabsTrigger value="all">Tất cả ({totalRows})</TabsTrigger>
                <TabsTrigger value="valid">Hợp lệ ({validRows})</TabsTrigger>
                <TabsTrigger value="invalid">Có lỗi ({invalidRows})</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="w-full bg-secondary pl-9 md:w-72"
                placeholder="Tìm nhanh trong preview..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-lg border border-border">
          {filteredRows.length === 0 ? (
            <div className="flex min-h-40 items-center justify-center px-4 text-sm text-muted-foreground">
              Không có dòng nào khớp bộ lọc hiện tại.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 text-center font-bold">#</TableHead>
                  <TableHead className="w-[180px] font-bold">Container & Loại</TableHead>
                  <TableHead className="w-[120px] font-bold">Định danh</TableHead>
                  <TableHead className="w-[120px] font-bold">Hãng tàu & Seal</TableHead>
                  <TableHead className="w-[120px] font-bold">Trọng lượng/Hàng</TableHead>
                  <TableHead className="w-[180px] font-bold">Hành trình & POD</TableHead>
                  <TableHead className="w-[150px] font-bold">Vị trí (Position)</TableHead>
                  <TableHead className="w-[120px] font-bold">Lạnh (Reefer)</TableHead>
                  <TableHead className="w-[120px] font-bold">Đặc biệt</TableHead>
                  <TableHead className="w-24 font-bold">Trạng thái</TableHead>
                  <TableHead className="font-bold">Nhận xét/Lỗi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((row) => (
                  <TableRow
                    key={`${row.rowNo}-${row.containerNo ?? "unknown"}`}
                    className={cn(
                      "cursor-pointer hover:bg-muted/35",
                      !row.isValid && "bg-destructive/5",
                      selectedRowKey === `${row.rowNo}-${row.containerNo ?? "unknown"}` &&
                        "bg-primary/8 ring-1 ring-primary/30",
                    )}
                    onClick={() => onSelectRow(row)}
                  >
                    <TableCell className="align-top whitespace-normal font-medium text-center">
                      {row.rowNo}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-col gap-0.5">
                        <div className="font-mono font-bold text-foreground">
                          {row.containerNo || "—"}
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase">
                          {row.containerTypeCode || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-muted-foreground w-12 shrink-0">Cat:</span>
                          <span className="font-medium">{row.category || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-muted-foreground w-12 shrink-0">V-St:</span>
                          <span className={row.vState === "Active" ? "text-green-600 font-medium" : ""}>{row.vState || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-semibold text-muted-foreground w-12 shrink-0">T-St:</span>
                          <span className="font-medium italic">{row.tState || "—"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-xs">
                      <div className="space-y-1">
                        <div className="font-medium text-blue-600">{row.shippingLineCode || "—"}</div>
                        <div className="text-[10px] text-muted-foreground truncate" title={row.sealNo || undefined}>
                          S1: {row.sealNo || "—"}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate" title={row.sealNo2 || undefined}>
                          S2: {row.sealNo2 || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-xs">
                      <div className="space-y-1">
                        <div className="font-medium">{row.grossWeightKg ? `${row.grossWeightKg}kg` : "—"}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {row.frghtKind || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-xs">
                      <div className="space-y-1">
                        <div className="font-medium truncate max-w-[150px]" title={row.ibActualVisit || undefined}>
                          IB: {row.ibActualVisit || "—"}
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">
                          OB: {row.obActualVisit || "—"}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground font-bold">
                          POD: {row.currentPortCode || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-xs">
                      <div className="space-y-1">
                        <div className="font-mono font-bold text-amber-700 bg-amber-50 px-1 py-0.5 rounded border border-amber-100 inline-block">
                          {row.currentSlotCode || "—"}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                          <span>Stow: {row.stow || "—"}</span>
                          <span>Grp: {row.grp || "—"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top text-xs">
                      {row.reqsPower ? (
                        <div className="space-y-1">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] px-1 h-4">
                            Reefer (Y)
                          </Badge>
                          <div className="text-[10px] font-medium text-blue-800">
                            Temp: {row.tempRequiredC ? `${row.tempRequiredC}°C` : "—"}
                          </div>
                          <div className="text-[9px] text-muted-foreground">
                            H: {row.rlh}/{row.rdh}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[10px]">No</span>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-xs">
                      <div className="space-y-1">
                        {row.hazardous && (
                          <Badge variant="destructive" className="text-[9px] px-1 h-4">
                            Hazardous
                          </Badge>
                        )}
                        {row.isOog && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200 text-[9px] px-1 h-4">
                            OOG
                          </Badge>
                        )}
                        <div className="text-[10px] font-medium mt-1">
                          {row.imdg ? `IMDG: ${row.imdg}` : ""}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="align-top space-y-1">
                      <Badge variant={row.isValid ? (row.warnings.length > 0 ? "outline" : "secondary") : "destructive"} className={cn("px-1.5 py-0 text-[10px] h-5", row.isValid && row.warnings.length > 0 && "border-amber-200 bg-amber-50 text-amber-700")}>
                        {row.isValid ? (row.warnings.length > 0 ? "Cần tạo mới" : "Hợp lệ") : "Có lỗi"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md align-top whitespace-normal text-xs font-medium">
                      {row.errors.length > 0 && (
                        <div className="text-destructive/90 mb-1">
                          {row.errors.join(" | ")}
                        </div>
                      )}
                      {row.warnings.length > 0 && (
                        <div className="text-amber-600 mb-1">
                          {row.warnings.join(" | ")}
                        </div>
                      )}
                      {row.errors.length === 0 && row.warnings.length === 0 && (
                        <div className="text-muted-foreground">
                          {row.note || "—"}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <div className="text-sm text-muted-foreground">
              Hiển thị {startIndex + 1} - {Math.min(startIndex + pageSize, totalFilteredRows)} trên {totalFilteredRows} dòng
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Trước
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true
                    if (p === 1 || p === totalPages) return true
                    return Math.abs(p - currentPage) <= 1
                  })
                  .map((p, i, arr) => (
                    <div key={p} className="flex items-center gap-1">
                      {i > 0 && p - arr[i - 1] > 1 && <span className="px-1 text-muted-foreground">...</span>}
                      <Button
                        variant={currentPage === p ? "default" : "outline"}
                        size="sm"
                        className="size-8 p-0"
                        onClick={() => setCurrentPage(p)}
                      >
                        {p}
                      </Button>
                    </div>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ContainerImportPageClient({
  batch,
  rowsJson,
}: {
  batch: ContainerImportPreviewBatch["batch"]
  rowsJson: string
}) {
  const rows = useMemo(() => JSON.parse(rowsJson) as PreviewRow[], [rowsJson])
  const [selectedRow, setSelectedRow] = useState<PreviewRow | null>(null)
  const sourceModeLabel = getSourceModeLabel(batch.sourceMode)
  const batchStatusMeta = getBatchStatusMeta(batch.status)
  const canImport =
    batch.status === "validated" &&
    batch.totalRows > 0 &&
    batch.successRows > 0

  return (
    <DashboardLayout
      title="Xem trước import container"
      description="Trang review full-width cho batch import, tối ưu cho dữ liệu dài và nhiều cột."
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Preview batch</Badge>
              <Badge className={cn("border-transparent", batchStatusMeta.className)}>
                {batchStatusMeta.label}
              </Badge>
              <Badge variant="secondary">{sourceModeLabel}</Badge>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                Xem trước {batch.batchNo}
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                {batch.fileName} · {batch.totalRows} dòng · {batch.successRows} hợp lệ ·{" "}
                {batch.errorRows} lỗi
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Button variant="outline" asChild>
              <Link href="/containers">
                <ArrowLeft className="mr-2 size-4" />
                Quay lại danh sách
              </Link>
            </Button>

            <ImportBatchActionForm 
              batchId={batch.id} 
              canImport={canImport} 
              rows={rows} 
              successRows={batch.successRows}
              errorRows={batch.errorRows}
            />
          </div>
        </div>

        {batch.note ? (
          <Alert className="border-border/60 bg-muted/30">
            <CircleAlert className="size-4" />
            <AlertTitle>Thông tin nguồn</AlertTitle>
            <AlertDescription>{batch.note}</AlertDescription>
          </Alert>
        ) : null}

        {batch.successRows === 0 ? (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/10 mt-4">
            <CircleAlert className="size-5" />
            <AlertTitle className="text-base font-semibold">Không thể nhập dữ liệu</AlertTitle>
            <AlertDescription className="text-sm mt-1">
              Toàn bộ {batch.totalRows} bản ghi trong file này đều đã tồn tại trong hệ thống hoặc chứa lỗi không thể khắc phục. Không có bản ghi mới nào hợp lệ để nhập. Vui lòng kiểm tra mục "Nhận xét/Lỗi" trong bảng dưới đây để biết thêm chi tiết.
            </AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <PreviewStatCard title="Tổng dòng" value={batch.totalRows} />
          <PreviewStatCard title="Hợp lệ" value={batch.successRows} tone="success" />
          <PreviewStatCard title="Có lỗi" value={batch.errorRows} tone="destructive" />
        </div>

        <PreviewRowTable
          rows={rows}
          totalRows={batch.totalRows}
          validRows={batch.successRows}
          invalidRows={batch.errorRows}
          selectedRowKey={
            selectedRow ? `${selectedRow.rowNo}-${selectedRow.containerNo ?? "unknown"}` : null
          }
          onSelectRow={setSelectedRow}
        />

        <PreviewRowDetailSheet
          row={selectedRow}
          open={!!selectedRow}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedRow(null)
            }
          }}
        />
      </div>
    </DashboardLayout>
  )
}
