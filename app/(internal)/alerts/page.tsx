import { getAlerts } from "@/lib/alerts/get-alerts"
import { AlertsClient } from "./alerts-client"

export const dynamic = "force-dynamic"

export default async function AlertsPage() {
  const alerts = await getAlerts()

  return (
    <AlertsClient initialAlerts={alerts} />
  )
}
