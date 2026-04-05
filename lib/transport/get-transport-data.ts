import { getOptionalPrismaClient } from "@/lib/prisma"

export type VehicleData = {
  id: string
  code: string
  name: string
  driver: string // Using `note` or mock for now as `driver` isn't in Vehicle schema specifically
  status: "available" | "assigned" | "in-transit" | "maintenance"
  capacity: string
  currentLocation: string
  type: "truck" | "barge"
}

export type TransportContainerData = {
  id: string
  containerId: string
  origin: string
  destination: string
  weight: string
  priority: "high" | "medium" | "low"
  suggestedTransport?: "truck" | "barge" | "both"
}

export async function getVehicles(): Promise<VehicleData[]> {
  const prisma = getOptionalPrismaClient()
  if (!prisma) return []

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return vehicles.map(v => {
    // Map status
    let mappedStatus: "available" | "assigned" | "in-transit" | "maintenance" = "available"
    if (v.status === "in_use") mappedStatus = "in-transit"
    else if (v.status === "maintenance") mappedStatus = "maintenance"
    else mappedStatus = "available"

    return {
      id: v.id,
      code: v.code,
      name: v.name,
      driver: "Tài xế/Thuyền trưởng", // Mock driver as DB doesn't have driver field yet
      status: mappedStatus,
      capacity: v.capacityTeu ? `${v.capacityTeu} TEU` : (v.capacityWeightKg ? `${v.capacityWeightKg} kg` : "Không rõ"),
      currentLocation: v.currentLat && v.currentLng ? `${v.currentLat}, ${v.currentLng}` : "Chưa cập nhật",
      type: v.vehicleType === "barge" ? "barge" : "truck",
    }
  })
}

export async function getPendingTransportContainers(): Promise<TransportContainerData[]> {
  const prisma = getOptionalPrismaClient()
  if (!prisma) return []

  // Fetch containers that are new, at_seaport_yard, or at_dryport_yard without an active voyage
  const containers = await prisma.container.findMany({
    where: {
      currentStatus: {
        in: ['new', 'at_seaport_yard', 'at_dryport_yard']
      },
      currentVoyageId: null // Not assigned to a voyage yet
    },
    include: {
      currentPort: true,
      currentYard: true,
      route: {
        include: { destinationPort: true, originPort: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50 // Limit to 50 for pending list
  })

  return containers.map(c => {
    let origin = "Chưa rõ"
    if (c.currentYard) origin = c.currentYard.name
    else if (c.currentPort) origin = c.currentPort.name
    else if (c.route?.originPort) origin = c.route.originPort.name

    let destination = c.route?.destinationPort?.name || "Chưa xác định"

    return {
      id: c.id,
      containerId: c.containerNo,
      origin,
      destination,
      weight: c.grossWeightKg ? `${c.grossWeightKg} kg` : "Không rõ",
      priority: "medium", // Default priority
      suggestedTransport: "barge" // Since DB only supports barges so far
    }
  })
}
