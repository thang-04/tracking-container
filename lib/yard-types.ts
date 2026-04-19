// Container Yard Management Types - TOS-like System
// Format: [Block][Bay][Row][Tier] - e.g., A01-03-03-01

// Container status in yard
export type ContainerStatus = "empty" | "in_use" | "customs_hold" | "dangerous_goods"

// Container discharge status flow from BAPLIE
export type DischargeStatus = 
  | "planned"      // Từ BAPLIE - chưa dỡ
  | "on_vessel"    // Đang trên tàu
  | "discharging"  // Đang dỡ
  | "discharged"   // Đã dỡ - cần cấp vị trí bãi
  | "in_yard"      // Đã vào bãi
  | "gate_out"     // Đã xuất cổng

// Container special types
export type SpecialType = "normal" | "reefer" | "dg" | "oog" | "empty"

export interface Container {
  id: string
  containerNo: string
  sizeType: "20GP" | "40GP" | "40HC" | "20RF" | "40RF" | "45HC"
  flowType?: "IMPORT" | "EXPORT"
  status: ContainerStatus
  dischargeStatus: DischargeStatus
  dwellDays: number
  tripId?: string
  shipper?: string
  consignee?: string
  weight?: number       // kg
  sealNo?: string
  etd?: Date            // Estimated Time of Departure
  eta?: Date            // Estimated Time of Arrival
  destination?: string
  carrier?: string
  pod?: string          // Port of Discharge
  specialType?: SpecialType
  // BAPLIE position on vessel
  vesselBay?: number
  vesselRow?: number
  vesselTier?: number
  // Yard position
  yardPosition?: string  // Block-Bay-Row-Tier
}

export interface TierSlot {
  tier: number // 1-based, 01 = bottom
  container: Container | null
}

export interface Stack {
  block: string
  bay: number
  row: number
  tiers: TierSlot[]
  maxTiers: number
}

export interface YardBlock {
  id: string
  name: string
  type: "Import" | "Export" | "Empty" | "Reefer" | "DG" | "Hold" | "Inspection"
  bays: number
  rows: number
  maxTiers: number
  stacks: Stack[]
}

export interface YardStats {
  totalCapacity: number
  usedCapacity: number
  emptySlots: number
  occupancyRate: number
}

// BAPLIE vessel information (Import)
export interface Vessel {
  id: string
  name: string
  voyageNo: string
  version: number
  eta: Date
  etd: Date
  status: "approaching" | "berthed" | "discharging" | "completed" | "departed"
  containers: Container[]
  totalContainers: number
  dischargedCount: number
}

// MOVINS export container with load sequence
export interface ExportContainer extends Container {
  loadSequence: number  // Lower = load first (on TOP), Higher = load last (at BOTTOM)
  vesselTargetBay?: number
  vesselTargetRow?: number
  vesselTargetTier?: number
  exportStatus: ExportStatus
  plannedYardPosition?: string
}

// Export container status flow
export type ExportStatus = 
  | "received"      // Nhận từ MOVINS
  | "planned"       // Đã lên kế hoạch bãi
  | "in_yard"       // Đang trong bãi
  | "ready_load"    // Sẵn sàng xếp
  | "loading"       // Đang xếp
  | "loaded"        // Đã xếp lên tàu

// MOVINS vessel information (Export)
export interface ExportVessel {
  id: string
  name: string
  voyageNo: string
  version: number
  eta: Date
  etd: Date
  status: "planning" | "receiving" | "ready" | "loading" | "completed" | "departed"
  containers: ExportContainer[]
  totalContainers: number
  loadedCount: number
  pods: string[]  // Unique PODs for grouping
}

// Export status labels (Vietnamese)
export const exportStatusLabels: Record<ExportStatus, string> = {
  received: "Đã nhận",
  planned: "Đã lập kế hoạch",
  in_yard: "Trong bãi",
  ready_load: "Sẵn sàng",
  loading: "Đang xếp",
  loaded: "Đã xếp",
}

// Export status colors for UI
export const exportStatusColors: Record<ExportStatus, { bg: string; border: string; text: string }> = {
  received: {
    bg: "bg-slate-500/20",
    border: "border-slate-500/40",
    text: "text-slate-400",
  },
  planned: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/40",
    text: "text-blue-400",
  },
  in_yard: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
  },
  ready_load: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/40",
    text: "text-yellow-400",
  },
  loading: {
    bg: "bg-orange-500/20",
    border: "border-orange-500/40",
    text: "text-orange-400",
  },
  loaded: {
    bg: "bg-purple-500/20",
    border: "border-purple-500/40",
    text: "text-purple-400",
  },
}

// Status color mapping per specification
export const statusColors: Record<ContainerStatus, { bg: string; border: string; text: string }> = {
  empty: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
  },
  in_use: {
    bg: "bg-blue-500/30",
    border: "border-blue-500/50",
    text: "text-blue-400",
  },
  customs_hold: {
    bg: "bg-yellow-500/30",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
  },
  dangerous_goods: {
    bg: "bg-red-500/30",
    border: "border-red-500/50",
    text: "text-red-400",
  },
}

// Discharge status labels (Vietnamese)
export const dischargeStatusLabels: Record<DischargeStatus, string> = {
  planned: "Kế hoạch",
  on_vessel: "Trên tàu",
  discharging: "Đang dỡ",
  discharged: "Đã dỡ",
  in_yard: "Trong bãi",
  gate_out: "Xuất cổng",
}

// Discharge status colors for UI
export const dischargeStatusColors: Record<DischargeStatus, { bg: string; border: string; text: string }> = {
  planned: {
    bg: "bg-slate-500/20",
    border: "border-slate-500/40",
    text: "text-slate-400",
  },
  on_vessel: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/40",
    text: "text-blue-400",
  },
  discharging: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/40",
    text: "text-yellow-400",
  },
  discharged: {
    bg: "bg-orange-500/20",
    border: "border-orange-500/40",
    text: "text-orange-400",
  },
  in_yard: {
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/40",
    text: "text-emerald-400",
  },
  gate_out: {
    bg: "bg-purple-500/20",
    border: "border-purple-500/40",
    text: "text-purple-400",
  },
}

export const statusLabels: Record<ContainerStatus, string> = {
  empty: "Trống",
  in_use: "Đang sử dụng",
  customs_hold: "Giữ hải quan",
  dangerous_goods: "Hàng nguy hiểm",
}

export const blockTypeLabels: Record<YardBlock["type"], string> = {
  Import: "Nhập",
  Export: "Xuất",
  Empty: "Rỗng",
  Reefer: "Lạnh",
  DG: "Hàng nguy hiểm",
  Hold: "Giữ",
  Inspection: "Kiểm tra",
}

// Generate position code: A01-03-03-01
export function getPositionCode(block: string, bay: number, row: number, tier: number): string {
  return `${block}-${String(bay).padStart(2, "0")}-${String(row).padStart(2, "0")}-${String(tier).padStart(2, "0")}`
}

// Parse position code
export function parsePositionCode(code: string): { block: string; bay: number; row: number; tier: number } | null {
  const parts = code.split("-")
  if (parts.length < 4) return null
  return {
    block: parts[0],
    bay: parseInt(parts[1], 10),
    row: parseInt(parts[2], 10),
    tier: parseInt(parts[3], 10),
  }
}

// Calculate stack status based on containers
export function getStackStatus(stack: Stack): ContainerStatus {
  const containers = stack.tiers.filter(t => t.container !== null)
  if (containers.length === 0) return "empty"
  
  // Priority: DG > Customs Hold > In Use
  const hasDG = containers.some(t => t.container?.status === "dangerous_goods")
  if (hasDG) return "dangerous_goods"
  
  const hasHold = containers.some(t => t.container?.status === "customs_hold")
  if (hasHold) return "customs_hold"
  
  return "in_use"
}

// Get container count in stack
export function getStackContainerCount(stack: Stack): number {
  return stack.tiers.filter(t => t.container !== null).length
}

// Calculate rehandle count for a container in stack
export function calculateRehandleForContainer(stack: Stack, targetTier: number): number {
  const containers = stack.tiers.filter(t => t.container !== null && t.tier > targetTier)
  return containers.length
}
