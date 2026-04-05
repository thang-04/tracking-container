import { getVehicles, getPendingTransportContainers } from "@/lib/transport/get-transport-data"
import { getRoutes } from "@/lib/master-data/get-routes"
import { TransportClient } from "./transport-client"

export const dynamic = "force-dynamic"

export default async function TransportPage() {
  const [vehicles, pendingContainers, routes] = await Promise.all([
    getVehicles(),
    getPendingTransportContainers(),
    getRoutes(),
  ])

  return (
    <TransportClient 
      initialVehicles={vehicles} 
      initialContainers={pendingContainers} 
      routes={routes}
    />
  )
}
