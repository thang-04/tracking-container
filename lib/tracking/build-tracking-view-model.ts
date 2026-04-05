import type { TrackingOverview, TrackingOverviewOptions, TrackingRoute, TrackingVehicle } from "@/lib/tracking/types"
import { projectMapPoint } from "@/lib/tracking/project-map-point"
import { selectActiveVoyage } from "@/lib/tracking/select-active-voyage"

type PortRecord = Awaited<ReturnType<typeof import("@/lib/master-data/get-ports").getPorts>>[number]
type RouteRecord = Awaited<ReturnType<typeof import("@/lib/master-data/get-routes").getRoutes>>[number]
type VehicleRecord = Awaited<ReturnType<typeof import("@/lib/fleet/get-vehicles").getVehicles>>[number]
type VoyageRecord = Awaited<ReturnType<typeof import("@/lib/transport/get-active-voyages").getActiveVoyages>>[number]
type LatestPositionRecord = Awaited<ReturnType<typeof import("@/lib/tracking/get-latest-positions").getLatestPositions>>[number]
type PortContainerCount = Awaited<ReturnType<typeof import("@/lib/containers/get-port-container-counts").getPortContainerCounts>>[number]

type BuildTrackingOverviewInput = {
  options?: TrackingOverviewOptions
  ports: PortRecord[]
  routes: RouteRecord[]
  vehicles: VehicleRecord[]
  voyages: VoyageRecord[]
  latestPositions: LatestPositionRecord[]
  portContainerCounts: PortContainerCount[]
}

export function buildTrackingViewModel({
  options,
  ports,
  routes,
  vehicles,
  voyages,
  latestPositions,
  portContainerCounts,
}: BuildTrackingOverviewInput): TrackingOverview {
  const mode = options?.mode ?? "full"
  const containerCountByPortId = new Map(portContainerCounts.map((item) => [item.portId, item.count]))
  const latestPositionByVehicleId = new Map(latestPositions.map((item) => [item.vehicleId, item]))
  const voyagesByVehicleId = voyages.reduce<Map<string, VoyageRecord[]>>((map, voyage) => {
    const items = map.get(voyage.vehicleId) ?? []
    items.push(voyage)
    map.set(voyage.vehicleId, items)
    return map
  }, new Map())

  const locations = ports.map((port) => {
    const point = projectMapPoint(port.lat, port.lng)

    return {
      id: port.id,
      code: port.code,
      name: port.name,
      portType: port.portType,
      lat: port.lat,
      lng: port.lng,
      x: point.x,
      y: point.y,
      containerCount: containerCountByPortId.get(port.id) ?? 0,
    }
  })

  const trackingRoutes: TrackingRoute[] = routes
    .map((route) => {
      const pointsSource = route.checkpoints.length > 0
        ? route.checkpoints.map((checkpoint) => ({
            name: checkpoint.name,
            lat: checkpoint.lat,
            lng: checkpoint.lng,
          }))
        : [route.originPort, route.destinationPort]
            .filter((port): port is typeof port & { lat: number; lng: number } => port.lat !== null && port.lng !== null)
            .map((port) => ({
              name: port.name,
              lat: port.lat,
              lng: port.lng,
            }))

      if (pointsSource.length < 2) {
        return null
      }

      return {
        id: route.id,
        code: route.code,
        name: route.name,
        originPortId: route.originPort.id,
        destinationPortId: route.destinationPort.id,
        points: pointsSource.map((point) => {
          const projected = projectMapPoint(point.lat, point.lng)

          return {
            name: point.name,
            lat: point.lat,
            lng: point.lng,
            x: projected.x,
            y: projected.y,
          }
        }),
      }
    })
    .filter((route): route is TrackingRoute => route !== null)

  const trackingVehicles: TrackingVehicle[] = vehicles
    .map((vehicle) => {
      const latestPosition = latestPositionByVehicleId.get(vehicle.id) ?? null
      const activeVoyage = selectActiveVoyage(voyagesByVehicleId.get(vehicle.id) ?? [])
      const lat = latestPosition?.lat ?? activeVoyage?.currentLat ?? vehicle.currentLat
      const lng = latestPosition?.lng ?? activeVoyage?.currentLng ?? vehicle.currentLng

      if (lat === null || lng === null) {
        return null
      }

      const projected = projectMapPoint(lat, lng)

      return {
        id: vehicle.id,
        code: vehicle.code,
        name: vehicle.name,
        vehicleType: vehicle.vehicleType,
        status: vehicle.status,
        lat,
        lng,
        x: projected.x,
        y: projected.y,
        speed: latestPosition?.speed ?? null,
        recordedAt: latestPosition?.recordedAt ?? null,
        routeName: activeVoyage?.routeName ?? null,
        manifestCount: activeVoyage?.containers.length ?? 0,
        eta: activeVoyage?.eta ?? null,
        voyageStatus: activeVoyage?.status ?? null,
        checkpointName: activeVoyage?.checkpointName ?? null,
        containers: (activeVoyage?.containers ?? []).slice(0, 3),
      }
    })
    .filter((vehicle): vehicle is TrackingVehicle => vehicle !== null)

  const vehicleLimit = mode === "preview" ? options?.vehicleLimit ?? 3 : undefined
  const routeLimit = mode === "preview" ? options?.routeLimit ?? 2 : undefined

  return {
    mode,
    generatedAt: new Date().toISOString(),
    hasData: locations.length > 0 || trackingRoutes.length > 0 || trackingVehicles.length > 0,
    locations,
    routes: routeLimit === undefined ? trackingRoutes : trackingRoutes.slice(0, routeLimit),
    vehicles: vehicleLimit === undefined ? trackingVehicles : trackingVehicles.slice(0, vehicleLimit),
  }
}
