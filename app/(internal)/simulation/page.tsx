import { getSimulationData } from "@/lib/simulation/get-simulation-data"
import { SimulationClient } from "./simulation-client"

export const dynamic = "force-dynamic"

export default async function SimulationPage() {
  const data = await getSimulationData()

  return (
    <SimulationClient
      routes={data.routes}
      defaultContainers={data.defaultContainers}
      defaultTrucks={data.defaultTrucks}
      defaultDemandVariability={data.defaultDemandVariability}
    />
  )
}
