import { DashboardLayout } from "@/components/dashboard-layout"
import { EfficiencyChart } from "@/components/dashboard/efficiency-chart"
import { KPICard } from "@/components/dashboard/kpi-card"
import { LiveTrackingPreview } from "@/components/dashboard/live-tracking-preview"
import { OperationsChart } from "@/components/dashboard/operations-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { getTrackingOverview } from "@/lib/tracking/get-tracking-overview"
import { Package, Ship, TrendingUp, Truck } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const overview = await getTrackingOverview({ mode: "preview", vehicleLimit: 3, routeLimit: 2 })

  return (
    <DashboardLayout title="Bảng điều khiển" description="Tổng quan hoạt động cảng và logistics">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Tổng container"
          value="1,284"
          change="+12% so với tháng trước"
          changeType="positive"
          icon={Package}
          iconColor="bg-primary/10 text-primary"
        />
        <KPICard
          title="Lô hàng đang vận chuyển"
          value="156"
          change="+8% so với tuần trước"
          changeType="positive"
          icon={Ship}
          iconColor="bg-accent/10 text-accent"
        />
        <KPICard
          title="Xe sẵn sàng"
          value="42"
          change="85% đội xe sẵn sàng"
          changeType="neutral"
          icon={Truck}
          iconColor="bg-warning/10 text-warning"
        />
        <KPICard
          title="Tỷ lệ hiệu quả"
          value="94.2%"
          change="+2.1% cải thiện"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-success/10 text-success"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <OperationsChart />
        <EfficiencyChart />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <LiveTrackingPreview overview={overview} />
        <RecentActivity />
      </div>
    </DashboardLayout>
  )
}
