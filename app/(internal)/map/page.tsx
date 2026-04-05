import { TrackingScreen } from "@/components/tracking/tracking-screen"
import { getTrackingOverview } from "@/lib/tracking/get-tracking-overview"

export const dynamic = "force-dynamic"

export default async function MapPage() {
  const overview = await getTrackingOverview({ mode: "full" })

  return <TrackingScreen overview={overview} />
}
