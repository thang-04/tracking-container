import { getPorts } from "@/lib/master-data/get-ports"

export type SimulationRoute = {
  id: string
  name: string
}

export async function getSimulationData() {
  const ports = await getPorts()
  
  // Create some logical routes for simulation selection
  const routes: SimulationRoute[] = [
    { id: "all", name: "Tất cả tuyến" },
    { id: "hp-hn", name: "Hải Phòng - Hà Nội" },
    { id: "dn-hcm", name: "Đà Nẵng - TP.HCM" },
    { id: "hp-dn", name: "Hải Phòng - Đà Nẵng" },
  ]

  return {
    routes,
    defaultContainers: 50,
    defaultTrucks: 20,
    defaultDemandVariability: 30,
  }
}
