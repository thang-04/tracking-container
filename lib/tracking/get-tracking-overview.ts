import { getPortContainerCounts } from "@/lib/containers/get-port-container-counts"
import { getVehicles } from "@/lib/fleet/get-vehicles"
import { getPorts } from "@/lib/master-data/get-ports"
import { getRoutes } from "@/lib/master-data/get-routes"
import { buildTrackingViewModel } from "@/lib/tracking/build-tracking-view-model"
import type { TrackingOverview, TrackingOverviewOptions } from "@/lib/tracking/types"
import { getLatestPositions } from "@/lib/tracking/get-latest-positions"
import { getActiveVoyages } from "@/lib/transport/get-active-voyages"

export async function getTrackingOverview(options?: TrackingOverviewOptions): Promise<TrackingOverview> {
  const [ports, routes, vehicles, voyages, latestPositions, portContainerCounts] = await Promise.all([
    getPorts(),
    getRoutes(),
    getVehicles(),
    getActiveVoyages(),
    getLatestPositions(),
    getPortContainerCounts(),
  ])

  return buildTrackingViewModel({
    options,
    ports,
    routes,
    vehicles,
    voyages,
    latestPositions,
    portContainerCounts,
  })
}
