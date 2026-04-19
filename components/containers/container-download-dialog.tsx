"use client"

import { useMemo, useState } from "react"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ContainerDirectoryItem } from "@/lib/containers/container-view-model"

type ContainerDownloadColumn = {
  key: string
  label: string
  getValue: (item: ContainerDirectoryItem) => string
}

type ContainerDownloadDialogProps = {
  containers: ContainerDirectoryItem[]
  unknownVesselLabel: string
}

function toCsvCell(value: string) {
  const escaped = value.replace(/"/g, '""')
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped
}

function getContainerVesselKey(item: ContainerDirectoryItem, unknownVesselLabel: string) {
  return `${item.vesselName ?? unknownVesselLabel}|||${item.voyageCode ?? ""}`
}

function downloadTextFile(content: string, fileName: string) {
  const blob = new Blob([`\uFEFF${content}`], {
    type: "text/csv;charset=utf-8",
  })
  const downloadUrl = URL.createObjectURL(blob)
  const anchor = document.createElement("a")

  anchor.href = downloadUrl
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(downloadUrl)
}

function formatFileTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
}

export function ContainerDownloadDialog({
  containers,
  unknownVesselLabel,
}: ContainerDownloadDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedVesselKeys, setSelectedVesselKeys] = useState<string[]>([])
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>([
    "containerNo",
    "vesselName",
    "voyageCode",
    "statusLabel",
    "locationLabel",
    "destinationLabel",
    "etaLabel",
  ])

  const columns = useMemo<ContainerDownloadColumn[]>(
    () => [
      {
        key: "containerNo",
        label: "Mã container",
        getValue: (item) => item.containerNo,
      },
      {
        key: "vesselName",
        label: "Tên sà lan",
        getValue: (item) => item.vesselName ?? unknownVesselLabel,
      },
      {
        key: "voyageCode",
        label: "Mã chuyến",
        getValue: (item) => item.voyageCode ?? "",
      },
      {
        key: "statusLabel",
        label: "Trạng thái",
        getValue: (item) => item.statusLabel,
      },
      {
        key: "locationLabel",
        label: "Vị trí hiện tại",
        getValue: (item) => item.locationLabel,
      },
      {
        key: "destinationLabel",
        label: "Đích đến",
        getValue: (item) => item.destinationLabel,
      },
      {
        key: "typeLabel",
        label: "Loại container",
        getValue: (item) => item.typeLabel,
      },
      {
        key: "customerLabel",
        label: "Khách hàng",
        getValue: (item) => item.customerLabel ?? "",
      },
      {
        key: "routeLabel",
        label: "Tuyến",
        getValue: (item) => item.routeLabel ?? "",
      },
      {
        key: "ibActualVisit",
        label: "I/B Actual Visit",
        getValue: (item) => item.ibActualVisit ?? "",
      },
      {
        key: "billNo",
        label: "Bill No",
        getValue: (item) => item.billNo ?? "",
      },
      {
        key: "sealNo",
        label: "Seal No",
        getValue: (item) => item.sealNo ?? "",
      },
      {
        key: "etaLabel",
        label: "ETA",
        getValue: (item) => item.etaLabel,
      },
      {
        key: "weightLabel",
        label: "Trọng lượng",
        getValue: (item) => item.weightLabel,
      },
    ],
    [unknownVesselLabel],
  )

  const vesselOptions = useMemo(() => {
    const grouped = new Map<
      string,
      { key: string; vesselName: string; voyageCode: string | null; count: number }
    >()

    containers.forEach((item) => {
      const key = getContainerVesselKey(item, unknownVesselLabel)
      const current = grouped.get(key)

      if (!current) {
        grouped.set(key, {
          key,
          vesselName: item.vesselName ?? unknownVesselLabel,
          voyageCode: item.voyageCode ?? null,
          count: 1,
        })
        return
      }

      current.count += 1
      grouped.set(key, current)
    })

    return [...grouped.values()].sort((a, b) => {
      const vesselSort = a.vesselName.localeCompare(b.vesselName, "vi")
      if (vesselSort !== 0) {
        return vesselSort
      }
      return (a.voyageCode ?? "").localeCompare(b.voyageCode ?? "", "vi")
    })
  }, [containers, unknownVesselLabel])

  const selectedColumns = useMemo(
    () => columns.filter((column) => selectedColumnKeys.includes(column.key)),
    [columns, selectedColumnKeys],
  )

  const selectedVesselKeySet = useMemo(
    () => new Set(selectedVesselKeys),
    [selectedVesselKeys],
  )

  const containersToExport = useMemo(() => {
    if (selectedVesselKeys.length === 0) {
      return containers
    }

    return containers.filter((item) =>
      selectedVesselKeySet.has(getContainerVesselKey(item, unknownVesselLabel)),
    )
  }, [containers, selectedVesselKeySet, selectedVesselKeys.length, unknownVesselLabel])

  const previewRows = useMemo(() => containersToExport.slice(0, 8), [containersToExport])
  const previewTableMinWidth = Math.max(selectedColumns.length, 1) * 180

  const toggleColumn = (columnKey: string, checked: boolean) => {
    setSelectedColumnKeys((current) => {
      if (checked) {
        if (current.includes(columnKey)) {
          return current
        }
        return [...current, columnKey]
      }

      return current.filter((key) => key !== columnKey)
    })
  }

  const toggleVessel = (vesselKey: string, checked: boolean) => {
    setSelectedVesselKeys((current) => {
      if (checked) {
        if (current.includes(vesselKey)) {
          return current
        }
        return [...current, vesselKey]
      }

      return current.filter((key) => key !== vesselKey)
    })
  }

  const handleDownload = () => {
    if (selectedColumns.length === 0 || containersToExport.length === 0) {
      return
    }

    const header = selectedColumns.map((column) => toCsvCell(column.label)).join(",")
    const rows = containersToExport.map((item) =>
      selectedColumns.map((column) => toCsvCell(column.getValue(item))).join(","),
    )

    const csv = [header, ...rows].join("\n")
    const fileName = `containers-export-${formatFileTimestamp(new Date())}.csv`

    downloadTextFile(csv, fileName)
    setOpen(false)
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Download className="mr-2 size-4" />
        Tải dữ liệu
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95vh] w-[95vw] overflow-hidden p-0 sm:max-w-7xl">
          <div className="flex h-full max-h-[95vh] flex-col">
            <DialogHeader className="border-b border-border/60 px-6 py-4">
              <DialogTitle>Tải dữ liệu container</DialogTitle>
              <DialogDescription>
                Chọn sà lan và cột dữ liệu cần tải. Hệ thống sẽ hiển thị xem trước trước khi xuất CSV.
              </DialogDescription>
            </DialogHeader>

            <div className="grid flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[1.3fr_1fr]">
              <div className="space-y-3 overflow-hidden rounded-md border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Sà lan</p>
                  <div className="flex items-center gap-2 text-xs">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setSelectedVesselKeys(vesselOptions.map((item) => item.key))}
                    >
                      Chọn tất cả
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => setSelectedVesselKeys([])}
                    >
                      Bỏ chọn
                    </Button>
                  </div>
                </div>

                <ScrollArea className="h-72 rounded border border-border/50">
                  <div className="space-y-2 p-3">
                    {vesselOptions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa có dữ liệu sà lan.</p>
                    ) : (
                      vesselOptions.map((item) => (
                        <label
                          key={item.key}
                          className="flex cursor-pointer items-start gap-2 rounded-md border border-border/40 p-2 hover:bg-muted/40"
                        >
                          <Checkbox
                            checked={selectedVesselKeys.includes(item.key)}
                            onCheckedChange={(checked) => toggleVessel(item.key, checked === true)}
                            className="mt-0.5"
                          />
                          <span className="text-sm text-foreground">
                            {item.vesselName}
                            {item.voyageCode ? ` - ${item.voyageCode}` : ""}
                            <span className="ml-1 text-xs text-muted-foreground">({item.count})</span>
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <p className="text-xs text-muted-foreground">
                  Đang chọn {selectedVesselKeys.length === 0 ? "tất cả sà lan" : `${selectedVesselKeys.length} sà lan`}
                </p>
              </div>

              <div className="space-y-3 overflow-hidden rounded-md border border-border/60 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Cột dữ liệu</p>
                  <span className="text-xs text-muted-foreground">
                    {selectedColumns.length}/{columns.length} cột
                  </span>
                </div>

                <ScrollArea className="h-72 rounded border border-border/50">
                  <div className="space-y-2 p-3">
                    {columns.map((column) => (
                      <label
                        key={column.key}
                        className="flex cursor-pointer items-start gap-2 rounded-md border border-border/40 p-2 hover:bg-muted/40"
                      >
                        <Checkbox
                          checked={selectedColumnKeys.includes(column.key)}
                          onCheckedChange={(checked) => toggleColumn(column.key, checked === true)}
                          className="mt-0.5"
                        />
                        <span className="text-sm text-foreground">{column.label}</span>
                      </label>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>

            <div className="space-y-3 border-t border-border/60 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <p className="font-medium text-foreground">Preview</p>
                <p className="text-xs text-muted-foreground">
                  {containersToExport.length} dòng sẽ tải xuống
                  {containersToExport.length > previewRows.length
                    ? ` (đang xem ${previewRows.length} dòng đầu)`
                    : ""}
                </p>
              </div>

              <p className="text-xs text-muted-foreground">
                Kéo ngang để xem đầy đủ các cột.
              </p>

              <div className="max-h-80 overflow-auto rounded-md border border-border/60">
                <Table style={{ minWidth: previewTableMinWidth }}>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {selectedColumns.map((column) => (
                        <TableHead key={column.key} className="min-w-[180px]">
                          {column.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedColumns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={1} className="py-6 text-center text-sm text-muted-foreground">
                          Chọn ít nhất 1 cột để xem preview.
                        </TableCell>
                      </TableRow>
                    ) : previewRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={selectedColumns.length} className="py-6 text-center text-sm text-muted-foreground">
                          Không có dữ liệu theo lựa chọn hiện tại.
                        </TableCell>
                      </TableRow>
                    ) : (
                      previewRows.map((item) => (
                        <TableRow key={item.id}>
                          {selectedColumns.map((column) => (
                            <TableCell key={`${item.id}-${column.key}`} className="min-w-[180px]">
                              {column.getValue(item) || "--"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <DialogFooter className="border-t border-border/60 px-4 py-3 sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Định dạng file: CSV (UTF-8)
              </p>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>
                <Button
                  type="button"
                  onClick={handleDownload}
                  disabled={selectedColumns.length === 0 || containersToExport.length === 0}
                >
                  <Download className="mr-2 size-4" />
                  Tải xuống
                </Button>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
