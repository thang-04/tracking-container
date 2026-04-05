import { getOptionalPrismaClient } from "@/lib/prisma"

type PortRecord = {
  id: string
  code: string
  name: string
  portType: "seaport" | "dryport"
  lat: number
  lng: number
}

export async function getPorts(): Promise<PortRecord[]> {
  const prisma = getOptionalPrismaClient()

  if (!prisma) {
    return []
  }

  const ports = await prisma.port.findMany({
    where: {
      isActive: true,
      lat: { not: null },
      lng: { not: null },
    },
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      portType: true,
      lat: true,
      lng: true,
    },
  })

  return ports.map((port) => ({
    id: port.id,
    code: port.code,
    name: port.name,
    portType: port.portType,
    lat: Number(port.lat),
    lng: Number(port.lng),
  }))
}
