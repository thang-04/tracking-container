import { VoyageLoadStatus, VoyageStatus } from "@/lib/generated/prisma/enums"
import { getOptionalPrismaClient } from "@/lib/prisma"

type ActiveVoyageRecord = {
  id: string
  code: string
  vehicleId: string
  routeId: string
  status: "draft" | "planned" | "loading" | "departed" | "arrived" | "cancelled"
  eta: string | null
  etd: string | null
  currentLat: number | null
  currentLng: number | null
  updatedAt: string
  routeName: string
  checkpointName: string | null
  containers: {
    id: string
    containerNo: string
    loadStatus: "planned" | "loaded" | "unloaded"
  }[]
}

const ACTIVE_VOYAGE_STATUSES: VoyageStatus[] = [
  VoyageStatus.loading,
  VoyageStatus.departed,
  VoyageStatus.planned,
]

const ACTIVE_LOAD_STATUSES: VoyageLoadStatus[] = [
  VoyageLoadStatus.planned,
  VoyageLoadStatus.loaded,
]

export async function getActiveVoyages(): Promise<ActiveVoyageRecord[]> {
  const prisma = getOptionalPrismaClient()

  if (!prisma) {
    return []
  }

  const voyages = await prisma.voyage.findMany({
    where: {
      status: {
        in: ACTIVE_VOYAGE_STATUSES,
      },
    },
    orderBy: { updatedAt: "desc" },
    include: {
      route: {
        select: {
          name: true,
        },
      },
      currentCheckpoint: {
        select: {
          name: true,
        },
      },
      voyageContainers: {
        where: {
          loadStatus: {
            in: ACTIVE_LOAD_STATUSES,
          },
        },
        orderBy: [{ sequenceNo: "asc" }, { createdAt: "asc" }],
        select: {
          loadStatus: true,
          container: {
            select: {
              id: true,
              containerNo: true,
            },
          },
        },
      },
    },
  })

  return voyages.map((voyage) => ({
    id: voyage.id,
    code: voyage.code,
    vehicleId: voyage.vehicleId,
    routeId: voyage.routeId,
    status: voyage.status,
    eta: voyage.eta?.toISOString() ?? null,
    etd: voyage.etd?.toISOString() ?? null,
    currentLat: voyage.currentLat === null ? null : Number(voyage.currentLat),
    currentLng: voyage.currentLng === null ? null : Number(voyage.currentLng),
    updatedAt: voyage.updatedAt.toISOString(),
    routeName: voyage.route.name,
    checkpointName: voyage.currentCheckpoint?.name ?? null,
    containers: voyage.voyageContainers.map((item) => ({
      id: item.container.id,
      containerNo: item.container.containerNo,
      loadStatus: item.loadStatus,
    })),
  }))
}
