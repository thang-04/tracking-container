"use client"

import { useMemo, useState } from "react"
import { Download, Package, Plus, Search, Upload } from "lucide-react"

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
import { cn } from "@/lib/utils"
import {
  buildContainerDirectoryStats,
  filterContainerDirectoryItems,
  getContainerStatusMeta,
  type ContainerDirectoryFilterStatus,
  type ContainerDirectoryItem,
} from "@/lib/containers/container-view-model"

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

export function ContainersPageClient({
  containers,
}: {
  containers: ContainerDirectoryItem[]
}) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] =
    useState<ContainerDirectoryFilterStatus>("all")

  const stats = useMemo(
    () => buildContainerDirectoryStats(containers),
    [containers],
  )
  const filteredContainers = useMemo(
    () =>
      filterContainerDirectoryItems(containers, {
        searchTerm,
        status: statusFilter,
      }),
    [containers, searchTerm, statusFilter],
  )

  return (
    <DashboardLayout
      title="Quản lý container"
      description="Theo dõi container, trạng thái hiện tại và đích đến từ dữ liệu thật"
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
                <p className="text-sm text-muted-foreground">
                  `Thêm container`, `Import EDI` và `Xuất file` sẽ được bật khi các workflow ghi thật hoàn tất.
                </p>
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
                <Button variant="outline" disabled>
                  <Upload className="mr-2 size-4" />
                  Import EDI
                </Button>
                <Button disabled>
                  <Plus className="mr-2 size-4" />
                  Thêm container
                </Button>
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
                  <EmptyDescription>
                    Khi bảng `containers` có record thật từ nhập tay hoặc EDI, danh sách và KPI sẽ tự hiển thị tại đây.
                  </EmptyDescription>
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
                        <TableHead>Loại</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Vị trí</TableHead>
                        <TableHead>Đích đến</TableHead>
                        <TableHead>Tuyến</TableHead>
                        <TableHead>ETA</TableHead>
                        <TableHead>Trọng lượng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContainers.map((container) => {
                        const statusMeta = getContainerStatusMeta(container.status)

                        return (
                          <TableRow key={container.id} className="hover:bg-muted/30">
                            <TableCell>
                              <div className="space-y-1">
                                <p className="font-mono font-medium">{container.containerNo}</p>
                                <p className="text-xs text-muted-foreground">
                                  {container.shippingLineLabel ?? "Chưa gán hãng tàu"}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>{container.typeLabel}</TableCell>
                            <TableCell>
                              <Badge className={cn("border-transparent", statusMeta.className)}>
                                {statusMeta.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {container.locationLabel}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {container.destinationLabel}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {container.routeLabel ?? "Chưa gán tuyến"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {container.etaLabel}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {container.weightLabel}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                <div className="pt-4 text-sm text-muted-foreground">
                  Hiển thị {filteredContainers.length} trong {containers.length} container.
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
