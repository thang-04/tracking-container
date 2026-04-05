export type TrackingMode = "full" | "preview"

export interface TrackingOverviewOptions {
  mode?: TrackingMode
  vehicleLimit?: number
  routeLimit?: number
}

export interface TrackingLocation {
  id: string
  code: string
  name: string
  portType: "seaport" | "dryport"
  lat: number
  lng: number
  x: number
  y: number
  containerCount: number
}

export interface TrackingRoutePoint {
  lat: number
  lng: number
  x: number
  y: number
  name: string
}

export interface TrackingRoute {
  id: string
  code: string
  name: string
  originPortId: string
  destinationPortId: string
  points: TrackingRoutePoint[]
}

export interface TrackingContainerSummary {
  id: string
  containerNo: string
  loadStatus: "planned" | "loaded" | "unloaded"
}

export interface TrackingVehicle {
  id: string
  code: string
  name: string
  vehicleType: "barge"
  status: "available" | "maintenance" | "in_use"
  lat: number
  lng: number
  x: number
  y: number
  speed: number | null
  recordedAt: string | null
  routeName: string | null
  manifestCount: number
  eta: string | null
  voyageStatus: "draft" | "planned" | "loading" | "departed" | "arrived" | "cancelled" | null
  checkpointName: string | null
  containers: TrackingContainerSummary[]
}

export interface TrackingOverview {
  mode: TrackingMode
  generatedAt: string
  hasData: boolean
  locations: TrackingLocation[]
  routes: TrackingRoute[]
  vehicles: TrackingVehicle[]
}
