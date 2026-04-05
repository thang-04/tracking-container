"use client"

import { useMemo, useState } from "react"
import { Download, Package, Search } from "lucide-react"

import { ContainerCreateDialog } from "@/components/containers/container-create-dialog"
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
import type { ContainerFormOptions } from "@/lib/containers/container-master-data"
import {
  buildContainerDirectoryStats,
  filterContainerDirectoryItems,
  getContainerStatusMeta,
  type ContainerDirectoryFilterStatus,
  type ContainerDirectoryItem,
} from "@/lib/containers/container-view-model"
import { cn } from "@/lib/utils"

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
  formOptions,
}: {
  containers: ContainerDirectoryItem[]
  formOptions: ContainerFormOptions
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
      title="Quan ly container"
      description="Theo doi container, trang thai hien tai va dich den tu du lieu that"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Tong container" value={stats.total} />
          <StatCard title="Tai bai cang bien" value={stats.atSeaportYard} />
          <StatCard title="Dang hanh trinh" value={stats.inTransit} />
          <StatCard title="Tai bai cang can" value={stats.atDryportYard} />
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base font-medium">Danh sach container</CardTitle>
                <p className="text-sm text-muted-foreground">
                  `Them container` va `Import CSV/Excel/EDI` dang ghi truc tiep vao
                  Supabase. `Xuat file` se mo sau.
                </p>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="w-full bg-secondary pl-9 md:w-72"
                    placeholder="Tim theo ma, hang tau, khach hang, tuyen..."
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
                    <SelectValue placeholder="Trang thai" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tat ca trang thai</SelectItem>
                    <SelectItem value="new">Moi tao</SelectItem>
                    <SelectItem value="at_seaport_yard">Tai bai cang bien</SelectItem>
                    <SelectItem value="on_barge">Da xep len sa lan</SelectItem>
                    <SelectItem value="in_transit">Dang hanh trinh</SelectItem>
                    <SelectItem value="at_dryport_yard">Tai bai cang can</SelectItem>
                    <SelectItem value="released">Da giai phong</SelectItem>
                    <SelectItem value="hold">Dang giu</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" disabled>
                  <Download className="size-4" />
                </Button>
                <ContainerImportDialog formOptions={formOptions} />
                <ContainerCreateDialog formOptions={formOptions} />
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
                  <EmptyTitle>Chua co container trong co so du lieu</EmptyTitle>
                  <EmptyDescription>
                    Ban co the them thu cong hoac import CSV/Excel/EDI. Khi insert
                    thanh cong, danh sach va KPI se tu dong cap nhat tai day.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : filteredContainers.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                Khong co container phu hop voi bo loc hien tai.
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Ma container</TableHead>
                        <TableHead>Loai</TableHead>
                        <TableHead>Trang thai</TableHead>
                        <TableHead>Vi tri</TableHead>
                        <TableHead>Dich den</TableHead>
                        <TableHead>Tuyen</TableHead>
                        <TableHead>ETA</TableHead>
                        <TableHead>Trong luong</TableHead>
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
                                  {container.shippingLineLabel ?? "Chua gan hang tau"}
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
                              {container.routeLabel ?? "Chua gan tuyen"}
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
                  Hien thi {filteredContainers.length} trong {containers.length} container.
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
