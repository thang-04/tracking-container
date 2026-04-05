import { Scale } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ModuleEmptyState } from "@/components/internal/module-empty-state"
import { getUnsupportedModuleState } from "@/lib/modules/module-empty-state"

export default function AHPPage() {
  const state = getUnsupportedModuleState("ahp")

  return (
    <DashboardLayout
      title="Hỗ trợ quyết định AHP"
      description="Màn phân tích quyết định này đang chờ mô hình và engine thật"
    >
      <ModuleEmptyState
        icon={Scale}
        title={state.title}
        description={state.description}
        reason={state.reason}
      />
    </DashboardLayout>
  )
}
