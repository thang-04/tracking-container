import { getContainerFormOptions } from "@/lib/containers/container-master-data"
import { getContainerDirectory } from "@/lib/containers/get-container-directory"
import { getOptionalPrismaClient } from "@/lib/prisma"

import { ContainersPageClient } from "./containers-page-client"

async function getVesselVoyages() {
  const prisma = getOptionalPrismaClient()
  if (!prisma) return []
  
  const voyages = await prisma.voyage.findMany({
    select: {
      code: true,
      vehicle: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  return voyages.map(v => ({
    voyageCode: v.code,
    vesselName: v.vehicle.name
  }))
}

export const dynamic = "force-dynamic"

export default async function ContainersPage() {
  const [containers, formOptions, vesselVoyages] = await Promise.all([
    getContainerDirectory(),
    getContainerFormOptions(),
    getVesselVoyages(),
  ])

  return <ContainersPageClient containers={containers} formOptions={formOptions} vesselVoyages={vesselVoyages} />
}
