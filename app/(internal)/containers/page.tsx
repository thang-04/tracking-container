import { getAllContainers } from "@/lib/containers/get-all-containers"
import { getShippingLines } from "@/lib/master-data/get-shipping-lines"
import { getContainerTypes } from "@/lib/master-data/get-container-types"
import { getPorts } from "@/lib/master-data/get-ports"
import { getYards } from "@/lib/master-data/get-yards"
import { ContainersClient } from "./containers-client"

export const dynamic = "force-dynamic"

export default async function ContainersPage() {
  const [containers, shippingLines, containerTypes, ports, yards] = await Promise.all([
    getAllContainers(),
    getShippingLines(),
    getContainerTypes(),
    getPorts(),
    getYards(),
  ])

  return (
    <ContainersClient 
      initialContainers={containers}
      shippingLines={shippingLines}
      containerTypes={containerTypes}
      ports={ports}
      yards={yards}
    />
  )
}
