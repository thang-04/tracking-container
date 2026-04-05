import { Settings2 } from "lucide-react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ModuleEmptyState } from "@/components/internal/module-empty-state"
import { getUnsupportedModuleState } from "@/lib/modules/module-empty-state"

export default function SettingsPage() {
  const state = getUnsupportedModuleState("settings")

  return (
    <DashboardLayout
      title="Cài đặt"
      description="Các biểu mẫu cấu hình thật sẽ xuất hiện khi backend settings sẵn sàng"
    >
      <ModuleEmptyState
        icon={Settings2}
        title={state.title}
        description={state.description}
        reason={state.reason}
      />
    </DashboardLayout>
  )
}
