import { DashboardLayout } from "@/components/dashboard-layout"
import { KPICard } from "@/components/dashboard/kpi-card"
import { OperationsChart } from "@/components/dashboard/operations-chart"
import { EfficiencyChart } from "@/components/dashboard/efficiency-chart"
import { MapPreview } from "@/components/dashboard/map-preview"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { Package, Truck, Ship, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  return (
    <DashboardLayout
      title="Bảng điều khiển"
      description="Tổng quan hoạt động cảng và logistics"
    >
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Tổng Container"
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
          title="Xe tải sẵn sàng"
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

      {/* Charts Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <OperationsChart />
        <EfficiencyChart />
      </div>

      {/* Map and Activity Row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <MapPreview />
        <RecentActivity />
      </div>
    </DashboardLayout>
  )
}
