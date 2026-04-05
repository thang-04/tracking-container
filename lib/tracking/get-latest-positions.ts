import prisma from "@/lib/prisma"

type LatestPositionRecord = {
  id: string
  vehicleId: string
  voyageId: string | null
  lat: number
  lng: number
  speed: number | null
  recordedAt: string
}

export async function getLatestPositions(): Promise<LatestPositionRecord[]> {
  const positions = await prisma.trackingPosition.findMany({
    orderBy: [{ vehicleId: "asc" }, { recordedAt: "desc" }],
    select: {
      id: true,
      vehicleId: true,
      voyageId: true,
      lat: true,
      lng: true,
      speed: true,
      recordedAt: true,
    },
  })

  const latestByVehicle = new Map<string, LatestPositionRecord>()

  for (const position of positions) {
    if (latestByVehicle.has(position.vehicleId)) {
      continue
    }

    latestByVehicle.set(position.vehicleId, {
      id: position.id,
      vehicleId: position.vehicleId,
      voyageId: position.voyageId,
      lat: Number(position.lat),
      lng: Number(position.lng),
      speed: position.speed === null ? null : Number(position.speed),
      recordedAt: position.recordedAt.toISOString(),
    })
  }

  return [...latestByVehicle.values()]
}
