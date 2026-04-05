import prisma from "@/lib/prisma"

type VehicleRecord = {
  id: string
  code: string
  name: string
  vehicleType: "barge"
  status: "available" | "maintenance" | "in_use"
  currentLat: number | null
  currentLng: number | null
  updatedAt: string
}

export async function getVehicles(): Promise<VehicleRecord[]> {
  const vehicles = await prisma.vehicle.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      vehicleType: true,
      status: true,
      currentLat: true,
      currentLng: true,
      updatedAt: true,
    },
  })

  return vehicles.map((vehicle) => ({
    id: vehicle.id,
    code: vehicle.code,
    name: vehicle.name,
    vehicleType: vehicle.vehicleType,
    status: vehicle.status,
    currentLat: vehicle.currentLat === null ? null : Number(vehicle.currentLat),
    currentLng: vehicle.currentLng === null ? null : Number(vehicle.currentLng),
    updatedAt: vehicle.updatedAt.toISOString(),
  }))
}
