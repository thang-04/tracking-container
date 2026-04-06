"use client"

import Link from "next/link"
import { useActionState, useMemo, useState } from "react"
import { ArrowLeft, CircleAlert, LoaderCircle, Search } from "lucide-react"
import { useFormStatus } from "react-dom"

import { importContainerImportPreviewBatchAction } from "@/app/actions/containers"
import {
  initialContainerImportSubmitActionState,
  type ContainerImportSubmitActionState,
} from "@/lib/containers/container-action-state"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { getContainerImportPreviewBatch } from "@/lib/containers/container-persistence"
import { cn } from "@/lib/utils"

type ContainerImportPreviewBatch = NonNullable<
  Awaited<ReturnType<typeof getContainerImportPreviewBatch>>
>

type PreviewRow = ContainerImportPreviewBatch["rows"][number]
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

function ImportSubmitButton({
  canImport,
}: {
  canImport: boolean
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending || !canImport}>
      {pending ? (
        <>
          <LoaderCircle className="size-4 animate-spin" />
          Đang nhập
        </>
      ) : (
        "Nhập dữ liệu"
      )}
    </Button>
  )
}

function ImportBatchActionForm({
  batchId,
  canImport,
}: {
  batchId: string
  canImport: boolean
}) {
  const [state, formAction] = useActionState(
    importContainerImportPreviewBatchAction,
    initialContainerImportSubmitActionState,
  )

  return (
    <div className="space-y-3">
      {state.status === "error" ? (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <CircleAlert className="size-4" />
          <AlertTitle>Không thể nhập batch preview</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <form action={formAction} className="flex justify-end">
        <input type="hidden" name="batchId" value={batchId} />
        <ImportSubmitButton canImport={canImport} />
      </form>
    </div>
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

function PreviewRowTable({
  rows,
  totalRows,
  validRows,
  invalidRows,
}: {
  rows: PreviewRow[]
  totalRows: number
  validRows: number
  invalidRows: number
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [rowFilter, setRowFilter] = useState<RowFilter>("all")

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
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Dòng</TableHead>
                  <TableHead>Container</TableHead>
                  <TableHead>Thông tin</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Lỗi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow
                    key={`${row.rowNo}-${row.containerNo ?? "unknown"}`}
                    className={cn(!row.isValid && "bg-destructive/5")}
                  >
                    <TableCell className="align-top whitespace-normal font-medium">
                      {row.rowNo}
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <div className="space-y-1">
                        <p className="font-mono font-medium">{formatText(row.containerNo)}</p>
                        <p className="text-xs text-muted-foreground">
                          Bill: {formatText(row.billNo)} | Seal: {formatText(row.sealNo)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <div className="space-y-1 text-sm">
                        <p>Loại: {formatText(row.containerTypeCode)}</p>
                        <p>Khách: {formatText(row.customerCode)}</p>
                        <p>Tuyến: {formatText(row.routeCode)}</p>
                        <p>Hãng tàu: {formatText(row.shippingLineCode)}</p>
                        {row.note ? <p className="text-xs text-muted-foreground">Ghi chú: {row.note}</p> : null}
                      </div>
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <div className="space-y-2 text-sm">
                        <p>{formatLocation(row)}</p>
                        <p className="text-xs text-muted-foreground">
                          POD: {formatText(row.currentPortCode)}
                        </p>
                        {row.statusHint ? (
                          <Badge variant="outline" className="w-fit">
                            {getStatusHintLabel(row.statusHint)}
                          </Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="align-top whitespace-normal text-sm text-muted-foreground">
                      {formatDateTime(row.eta)}
                    </TableCell>
                    <TableCell className="align-top whitespace-normal">
                      <Badge variant={row.isValid ? "secondary" : "destructive"}>
                        {row.isValid ? "Hợp lệ" : "Có lỗi"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md align-top whitespace-normal text-sm text-muted-foreground">
                      {row.errors.length ? row.errors.join(" | ") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ContainerImportPageClient({
  preview,
}: {
  preview: ContainerImportPreviewBatch
}) {
  const sourceModeLabel = getSourceModeLabel(preview.batch.sourceMode)
  const batchStatusMeta = getBatchStatusMeta(preview.batch.status)
  const canImport =
    preview.batch.status === "validated" &&
    preview.batch.totalRows > 0 &&
    preview.batch.errorRows === 0

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
                Xem trước {preview.batch.batchNo}
              </h1>
              <p className="max-w-3xl text-sm text-muted-foreground">
                {preview.batch.fileName} · {preview.batch.totalRows} dòng · {preview.batch.successRows} hợp lệ ·{" "}
                {preview.batch.errorRows} lỗi
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

            <ImportBatchActionForm batchId={preview.batch.id} canImport={canImport} />
          </div>
        </div>

        {preview.batch.note ? (
          <Alert className="border-border/60 bg-muted/30">
            <CircleAlert className="size-4" />
            <AlertTitle>Thông tin nguồn</AlertTitle>
            <AlertDescription>{preview.batch.note}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <PreviewStatCard title="Tổng dòng" value={preview.batch.totalRows} />
          <PreviewStatCard title="Hợp lệ" value={preview.batch.successRows} tone="success" />
          <PreviewStatCard title="Có lỗi" value={preview.batch.errorRows} tone="destructive" />
        </div>

        <div>
          {preview.batch.errorRows > 0 ? (
            <Alert variant="destructive" className="mb-4 border-destructive/30 bg-destructive/10">
              <CircleAlert className="size-4" />
              <AlertTitle>Cần xử lý trước khi nhập</AlertTitle>
              <AlertDescription>
                Batch này còn {preview.batch.errorRows} dòng lỗi. Hệ thống sẽ không cho nhập cho đến khi
                batch sạch lỗi.
              </AlertDescription>
            </Alert>
          ) : preview.batch.status === "imported" ? (
            <Alert className="mb-4 border-success/20 bg-success/10">
              <CircleAlert className="size-4" />
              <AlertTitle>Batch đã được nhập</AlertTitle>
              <AlertDescription>
                Batch này đã được nhập trước đó. Bảng bên dưới chỉ để xem lại dữ liệu.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-4 border-primary/20 bg-primary/5">
              <CircleAlert className="size-4" />
              <AlertTitle>Sẵn sàng nhập</AlertTitle>
              <AlertDescription>
                Bạn có thể rà soát dữ liệu ở bảng bên dưới rồi bấm Nhập dữ liệu để ghi vào hệ thống.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <PreviewRowTable
          rows={preview.rows}
          totalRows={preview.batch.totalRows}
          validRows={preview.batch.successRows}
          invalidRows={preview.batch.errorRows}
        />
      </div>
    </DashboardLayout>
  )
}
