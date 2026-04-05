import { FileText } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ModuleEmptyState } from "@/components/internal/module-empty-state"
import { getUnsupportedModuleState } from "@/lib/modules/module-empty-state"

export default function CustomsPage() {
  const state = getUnsupportedModuleState("customs")

  return (
    <DashboardLayout
      title="Hoạt động hải quan"
      description="Module này đang chờ backend và schema nghiệp vụ"
    >
      <ModuleEmptyState
        icon={FileText}
        title={state.title}
        description={state.description}
        reason={state.reason}
      />
    </DashboardLayout>
  )
}
