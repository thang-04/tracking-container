export type TransportVehicleStatus = "available" | "maintenance" | "in_use"
export type TransportVoyageStatus =
  | "draft"
  | "planned"
  | "loading"
  | "departed"
  | "arrived"
  | "cancelled"

export type TransportVehicleItem = {
  id: string
  code: string
  name: string
  status: TransportVehicleStatus
  statusLabel: string
  capacityLabel: string
  locationLabel: string
  updatedAtLabel: string
}

export type TransportVoyageItem = {
  id: string
  code: string
  status: TransportVoyageStatus
  statusLabel: string
  routeLabel: string
  vehicleLabel: string
  etaLabel: string
  etdLabel: string
  checkpointLabel: string | null
  manifestCount: number
}

export type TransportPendingContainerItem = {
  id: string
  containerNo: string
  originLabel: string
  destinationLabel: string
  weightLabel: string
  statusLabel: string
}

const VEHICLE_STATUS_META: Record<
  TransportVehicleStatus,
  { label: string; className: string }
> = {
  available: {
    label: "Sẵn sàng",
    className: "bg-success/10 text-success",
  },
  maintenance: {
    label: "Bảo dưỡng",
    className: "bg-destructive/10 text-destructive",
  },
  in_use: {
    label: "Đang khai thác",
    className: "bg-warning/10 text-warning",
  },
}

const VOYAGE_STATUS_META: Record<
  TransportVoyageStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Nháp",
    className: "bg-muted text-muted-foreground",
  },
  planned: {
    label: "Kế hoạch",
    className: "bg-primary/10 text-primary",
  },
  loading: {
    label: "Đang xếp hàng",
    className: "bg-warning/10 text-warning",
  },
  departed: {
    label: "Đã rời bến",
    className: "bg-accent/10 text-accent",
  },
  arrived: {
    label: "Đã đến",
    className: "bg-success/10 text-success",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-destructive/10 text-destructive",
  },
}

export function getVehicleStatusMeta(status: TransportVehicleStatus) {
  return VEHICLE_STATUS_META[status]
}

export function getVoyageStatusMeta(status: TransportVoyageStatus) {
  return VOYAGE_STATUS_META[status]
}

export function buildTransportSummary(input: {
  vehicles: TransportVehicleItem[]
  voyages: TransportVoyageItem[]
  pendingContainers: TransportPendingContainerItem[]
}) {
  return {
    totalVehicles: input.vehicles.length,
    availableVehicles: input.vehicles.filter(
      (vehicle) => vehicle.status === "available",
    ).length,
    activeVoyages: input.voyages.filter((voyage) =>
      ["planned", "loading", "departed"].includes(voyage.status),
    ).length,
    pendingContainers: input.pendingContainers.length,
    assignedContainers: input.voyages.reduce(
      (total, voyage) => total + voyage.manifestCount,
      0,
    ),
  }
}
