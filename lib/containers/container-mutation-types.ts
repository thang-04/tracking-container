export const CONTAINER_IMPORT_REQUIRED_HEADERS = [
  "container_no",
  "container_type_code",
] as const

export const CONTAINER_IMPORT_OPTIONAL_HEADERS = [
  "customer_code",
  "route_code",
  "shipping_line_code",
  "gross_weight_kg",
  "eta",
  "bill_no",
  "seal_no",
  "current_port_code",
  "current_yard_code",
  "current_block_code",
  "current_slot_code",
  "status_hint",
  "note",
] as const

export const CONTAINER_IMPORT_HEADERS = [
  ...CONTAINER_IMPORT_REQUIRED_HEADERS,
  ...CONTAINER_IMPORT_OPTIONAL_HEADERS,
] as const

export type ContainerImportHeader = (typeof CONTAINER_IMPORT_HEADERS)[number]

export type ContainerWorkflowStatus =
  | "new"
  | "at_seaport_yard"
  | "on_barge"
  | "in_transit"
  | "at_dryport_yard"
  | "released"
  | "hold"

export type ContainerWorkflowCustomsStatus = "pending" | "cleared" | "hold"
export type ContainerStatusHint = ContainerWorkflowStatus | "yard"

export type ContainerMutationSource = "manual" | "edi"

export type CanonicalContainerImportRow = {
  containerNo: string | null
  containerTypeCode: string | null
  customerCode: string | null
  routeCode: string | null
  shippingLineCode: string | null
  grossWeightKg: string | null
  eta: string | null
  billNo: string | null
  sealNo: string | null
  currentPortCode: string | null
  currentYardCode: string | null
  currentBlockCode: string | null
  currentSlotCode: string | null
  statusHint: ContainerStatusHint | null
  note: string | null
}

export type ParsedContainerImportRow = {
  rowNo: number
  sourceType: "csv" | "edi"
  rawData: Record<string, string | null>
  data: CanonicalContainerImportRow
}

export type ContainerImportValidationContext = {
  containerTypes: ReadonlyArray<{
    id: string
    code: string
    isActive: boolean
  }>
  customers: ReadonlyArray<{
    id: string
    code: string
    isActive: boolean
  }>
  shippingLines: ReadonlyArray<{
    id: string
    code: string
    isActive: boolean
  }>
  routes: ReadonlyArray<{
    id: string
    code: string
    isActive: boolean
    originPortId: string
    destinationPortId: string
  }>
  ports: ReadonlyArray<{
    id: string
    code: string
    portType: "seaport" | "dryport"
    isActive: boolean
  }>
  yards: ReadonlyArray<{
    id: string
    code: string
    portId: string
    isActive: boolean
  }>
  blocks: ReadonlyArray<{
    id: string
    code: string
    yardId: string
    isActive: boolean
  }>
  slots: ReadonlyArray<{
    id: string
    code: string
    blockId: string
    isActive: boolean
  }>
  existingContainerNos: readonly string[]
  occupiedSlotIds: readonly string[]
  requireCustomerCode?: boolean
  requireRouteCode?: boolean
}

export type ResolvedContainerMutationInput = {
  containerNo: string
  containerTypeId: string
  customerId: string | null
  routeId: string | null
  shippingLineId: string | null
  currentStatus: ContainerWorkflowStatus
  customsStatus: ContainerWorkflowCustomsStatus
  currentPortId: string | null
  currentYardId: string | null
  currentBlockId: string | null
  currentSlotId: string | null
  eta: Date | null
  grossWeightKg: string | null
  billNo: string | null
  sealNo: string | null
  note: string | null
}

export type ValidatedContainerImportRow = ParsedContainerImportRow & {
  errors: string[]
  isValid: boolean
  resolved: ResolvedContainerMutationInput | null
}

export type ContainerImportValidationResult = {
  rows: ValidatedContainerImportRow[]
  summary: {
    totalRows: number
    validRows: number
    invalidRows: number
  }
}
