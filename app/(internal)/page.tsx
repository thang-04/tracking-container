import { DashboardLayout } from "@/components/dashboard-layout"
import { EfficiencyChart } from "@/components/dashboard/efficiency-chart"
import { KPICard } from "@/components/dashboard/kpi-card"
import { OperationsChart } from "@/components/dashboard/operations-chart"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { getDashboardOverview } from "@/lib/dashboard/get-dashboard-overview"
import { Package, Ship, TrendingUp, Truck } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const dashboard = await getDashboardOverview()

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

      <div className="mt-6">
        <RecentActivity activities={dashboard.recentActivities} />
      </div>
    </DashboardLayout>
  )
}
