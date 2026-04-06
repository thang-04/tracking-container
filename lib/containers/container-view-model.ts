export type ContainerDirectoryStatus =
  | "new"
  | "at_seaport_yard"
  | "on_barge"
  | "in_transit"
  | "at_dryport_yard"
  | "released"
  | "hold"

export type ContainerDirectoryFilterStatus = ContainerDirectoryStatus | "all"

export type ContainerDirectoryItem = {
  id: string
  containerNo: string
  typeLabel: string
  status: ContainerDirectoryStatus
  statusLabel: string
  locationLabel: string
  destinationLabel: string
  etaLabel: string
  weightLabel: string
  shippingLineLabel: string | null
  customerLabel: string | null
  routeLabel: string | null
  categoryLabel: string | null
  vStateLabel: string | null
  tStateLabel: string | null
  customsStatusLabel: string | null
  billNo: string | null
  sealNo: string | null
}

const CONTAINER_STATUS_META: Record<
  ContainerDirectoryStatus,
  { label: string; className: string }
> = {
  new: {
    label: "Mới tạo",
    className: "bg-muted text-muted-foreground",
  },
  at_seaport_yard: {
    label: "Tại bãi cảng biển",
    className: "bg-primary/10 text-primary",
  },
  on_barge: {
    label: "Đã xếp lên sà lan",
    className: "bg-accent/10 text-accent",
  },
  in_transit: {
    label: "Đang hành trình",
    className: "bg-warning/10 text-warning",
  },
  at_dryport_yard: {
    label: "Tại bãi cảng cạn",
    className: "bg-success/10 text-success",
  },
  released: {
    label: "Đã giải phóng",
    className: "bg-success/10 text-success",
  },
  hold: {
    label: "Đang giữ",
    className: "bg-destructive/10 text-destructive",
  },
}

export function getContainerStatusMeta(status: ContainerDirectoryStatus) {
  return CONTAINER_STATUS_META[status]
}

export function buildContainerDirectoryStats(items: ContainerDirectoryItem[]) {
  return {
    total: items.length,
    atSeaportYard: items.filter((item) => item.status === "at_seaport_yard").length,
    onBarge: items.filter((item) => item.status === "on_barge").length,
    inTransit: items.filter((item) => item.status === "in_transit").length,
    atDryportYard: items.filter((item) => item.status === "at_dryport_yard").length,
    released: items.filter((item) => item.status === "released").length,
    hold: items.filter((item) => item.status === "hold").length,
  }
}

export function filterContainerDirectoryItems(
  items: ContainerDirectoryItem[],
  filters: {
    searchTerm: string
    status: ContainerDirectoryFilterStatus
  },
) {
  const searchTerm = filters.searchTerm.trim().toLowerCase()

  return items.filter((item) => {
    const haystack = [
      item.containerNo,
      item.typeLabel,
      item.locationLabel,
      item.destinationLabel,
      item.shippingLineLabel ?? "",
      item.customerLabel ?? "",
      item.routeLabel ?? "",
      item.billNo ?? "",
      item.sealNo ?? "",
      item.categoryLabel ?? "",
      item.tStateLabel ?? "",
      item.vStateLabel ?? "",
    ]
      .join(" ")
      .toLowerCase()

    const matchesSearch = searchTerm.length === 0 || haystack.includes(searchTerm)
    const matchesStatus = filters.status === "all" || item.status === filters.status

    return matchesSearch && matchesStatus
  })
}
