import { Plus, Ship } from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getTransportOverview } from "@/lib/transport/get-transport-overview"
import {
  buildTransportSummary,
  getVehicleStatusMeta,
  getVoyageStatusMeta,
} from "@/lib/transport/transport-view-model"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

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

export default async function TransportPage() {
  const overview = await getTransportOverview()
  const summary = buildTransportSummary(overview)

  return (
    <DashboardLayout
      title="Điều độ vận tải"
      description="Đội sà lan, chuyến đang chạy và container chờ phân công"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Tổng sà lan" value={summary.totalVehicles} />
          <StatCard title="Sẵn sàng khai thác" value={summary.availableVehicles} />
          <StatCard title="Chuyến hoạt động" value={summary.activeVoyages} />
          <StatCard title="Container chờ phân công" value={summary.pendingContainers} />
          <StatCard title="Container trong manifest" value={summary.assignedContainers} />
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground">
            Tạo phương tiện, tạo chuyến và phân công tự động sẽ được bật khi server actions cho vận tải hoàn tất.
          </p>
          <Button disabled>
            <Plus className="mr-2 size-4" />
            Tạo sà lan
          </Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Container chờ phân công
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overview.pendingContainers.length === 0 ? (
                <Empty className="border border-dashed border-border bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Ship />
                    </EmptyMedia>
                    <EmptyTitle>Không có container chờ phân công</EmptyTitle>
                    <EmptyDescription>
                      Container đủ điều kiện nhưng chưa gán `current_voyage_id` sẽ hiển thị tại đây.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Mã container</TableHead>
                        <TableHead>Điểm đi</TableHead>
                        <TableHead>Điểm đến</TableHead>
                        <TableHead>Trọng lượng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overview.pendingContainers.map((container) => (
                        <TableRow key={container.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono font-medium">
                            {container.containerNo}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {container.originLabel}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {container.destinationLabel}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {container.weightLabel}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {container.statusLabel}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base font-medium">Đội sà lan</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.vehicles.length === 0 ? (
                <Empty className="border border-dashed border-border bg-muted/20">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <Ship />
                    </EmptyMedia>
                    <EmptyTitle>Chưa có sà lan trong hệ thống</EmptyTitle>
                    <EmptyDescription>
                      Bảng `vehicles` hiện chưa có record kiểu `barge`.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="overflow-hidden rounded-lg border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Mã</TableHead>
                        <TableHead>Tên</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Sức chở</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {overview.vehicles.map((vehicle) => {
                        const statusMeta = getVehicleStatusMeta(vehicle.status)

                        return (
                          <TableRow key={vehicle.id} className="hover:bg-muted/30">
                            <TableCell className="font-mono font-medium">
                              {vehicle.code}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <p>{vehicle.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {vehicle.locationLabel}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={cn("border-transparent", statusMeta.className)}>
                                {statusMeta.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {vehicle.capacityLabel}
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
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-medium">Chuyến gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            {overview.voyages.length === 0 ? (
              <Empty className="border border-dashed border-border bg-muted/20">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Ship />
                  </EmptyMedia>
                  <EmptyTitle>Chưa có chuyến nào trong hệ thống</EmptyTitle>
                  <EmptyDescription>
                    Khi bảng `voyages` có dữ liệu thật, lịch chuyến và manifest sẽ hiển thị tại đây.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Mã chuyến</TableHead>
                      <TableHead>Tuyến</TableHead>
                      <TableHead>Sà lan</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Manifest</TableHead>
                      <TableHead>ETD</TableHead>
                      <TableHead>ETA</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {overview.voyages.map((voyage) => {
                      const statusMeta = getVoyageStatusMeta(voyage.status)

                      return (
                        <TableRow key={voyage.id} className="hover:bg-muted/30">
                          <TableCell className="font-mono font-medium">
                            {voyage.code}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <div className="space-y-1">
                              <p>{voyage.routeLabel}</p>
                              {voyage.checkpointLabel ? (
                                <p className="text-xs text-muted-foreground">
                                  Checkpoint: {voyage.checkpointLabel}
                                </p>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {voyage.vehicleLabel}
                          </TableCell>
                          <TableCell>
                            <Badge className={cn("border-transparent", statusMeta.className)}>
                              {statusMeta.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {voyage.manifestCount}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {voyage.etdLabel}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {voyage.etaLabel}
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
      </div>
    </DashboardLayout>
  )
}
