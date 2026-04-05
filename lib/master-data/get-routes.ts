import prisma from "@/lib/prisma"

type RouteCheckpointRecord = {
  id: string
  name: string
  seqNo: number
  lat: number
  lng: number
}

type RouteRecord = {
  id: string
  code: string
  name: string
  originPort: {
    id: string
    name: string
    lat: number | null
    lng: number | null
  }
  destinationPort: {
    id: string
    name: string
    lat: number | null
    lng: number | null
  }
  checkpoints: RouteCheckpointRecord[]
}

export async function getRoutes(): Promise<RouteRecord[]> {
  const routes = await prisma.route.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      originPort: {
        select: {
          id: true,
          name: true,
          lat: true,
          lng: true,
        },
      },
      destinationPort: {
        select: {
          id: true,
          name: true,
          lat: true,
          lng: true,
        },
      },
      checkpoints: {
        orderBy: { seqNo: "asc" },
        select: {
          id: true,
          name: true,
          seqNo: true,
          lat: true,
          lng: true,
        },
      },
    },
  })

  return routes.map((route) => ({
    id: route.id,
    code: route.code,
    name: route.name,
    originPort: {
      id: route.originPort.id,
      name: route.originPort.name,
      lat: route.originPort.lat === null ? null : Number(route.originPort.lat),
      lng: route.originPort.lng === null ? null : Number(route.originPort.lng),
    },
    destinationPort: {
      id: route.destinationPort.id,
      name: route.destinationPort.name,
      lat: route.destinationPort.lat === null ? null : Number(route.destinationPort.lat),
      lng: route.destinationPort.lng === null ? null : Number(route.destinationPort.lng),
    },
    checkpoints: route.checkpoints.map((checkpoint) => ({
      id: checkpoint.id,
      name: checkpoint.name,
      seqNo: checkpoint.seqNo,
      lat: Number(checkpoint.lat),
      lng: Number(checkpoint.lng),
    })),
  }))
}
