import { DashboardLayout } from "@/components/dashboard-layout"
import { EfficiencyChart } from "@/components/dashboard/efficiency-chart"
import { KPICard } from "@/components/dashboard/kpi-card"
import { LiveTrackingPreview } from "@/components/dashboard/live-tracking-preview"
import { OperationsChart } from "@/components/dashboard/operations-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { getDashboardOverview } from "@/lib/dashboard/get-dashboard-overview"
import { getTrackingOverview } from "@/lib/tracking/get-tracking-overview"
import { Package, Ship, TrendingUp, Truck } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const [dashboard, overview] = await Promise.all([
    getDashboardOverview(),
    getTrackingOverview({ mode: "preview", vehicleLimit: 3, routeLimit: 2 }),
  ])

  return (
    <DashboardLayout title="Bảng điều khiển" description="Tổng quan hoạt động cảng và logistics">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title={dashboard.kpis.totalContainers.title}
          value={dashboard.kpis.totalContainers.value}
          change={dashboard.kpis.totalContainers.change}
          changeType={dashboard.kpis.totalContainers.changeType}
          icon={Package}
          iconColor="bg-primary/10 text-primary"
        />
        <KPICard
          title={dashboard.kpis.activeShipments.title}
          value={dashboard.kpis.activeShipments.value}
          change={dashboard.kpis.activeShipments.change}
          changeType={dashboard.kpis.activeShipments.changeType}
          icon={Ship}
          iconColor="bg-accent/10 text-accent"
        />
        <KPICard
          title={dashboard.kpis.availableVehicles.title}
          value={dashboard.kpis.availableVehicles.value}
          change={dashboard.kpis.availableVehicles.change}
          changeType={dashboard.kpis.availableVehicles.changeType}
          icon={Truck}
          iconColor="bg-warning/10 text-warning"
        />
        <KPICard
          title={dashboard.kpis.efficiency.title}
          value={dashboard.kpis.efficiency.value}
          change={dashboard.kpis.efficiency.change}
          changeType={dashboard.kpis.efficiency.changeType}
          icon={TrendingUp}
          iconColor="bg-success/10 text-success"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <OperationsChart data={dashboard.operations} />
        <EfficiencyChart data={dashboard.routeEfficiency} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <LiveTrackingPreview overview={overview} />
        <RecentActivity activities={dashboard.recentActivities} />
      </div>
    </DashboardLayout>
  )
}
