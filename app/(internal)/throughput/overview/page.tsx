"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ThroughputOverview } from "@/components/throughput/throughput-overview"

export default function ThroughputOverviewPage() {
  return (
    <DashboardLayout title="" description="">
      <ThroughputOverview />
    </DashboardLayout>
  )
}
