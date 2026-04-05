import { TrendingUp } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ModuleEmptyState } from "@/components/internal/module-empty-state"
import { getUnsupportedModuleState } from "@/lib/modules/module-empty-state"

export default function SimulationPage() {
  const state = getUnsupportedModuleState("simulation")

  return (
    <DashboardLayout
      title="Mô phỏng & Lập kế hoạch"
      description="Màn mô phỏng chỉ được mở lại khi có engine tính toán thật"
    >
      <ModuleEmptyState
        icon={TrendingUp}
        title={state.title}
        description={state.description}
        reason={state.reason}
      />
    </DashboardLayout>
  )
}
