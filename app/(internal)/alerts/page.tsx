import { getAlertDirectory } from "@/lib/alerts/get-alert-directory"

import { AlertsPageClient } from "./alerts-page-client"

export const dynamic = "force-dynamic"

export default async function AlertsPage() {
  const alerts = await getAlertDirectory()

  return <AlertsPageClient alerts={alerts} />
}
