export type CreateContainerFieldName =
  | "containerNo"
  | "containerTypeCode"
  | "customerCode"
  | "routeCode"
  | "shippingLineCode"
  | "grossWeightKg"
  | "eta"
  | "billNo"
  | "sealNo"
  | "currentPortCode"
  | "currentYardCode"
  | "currentBlockCode"
  | "currentSlotCode"
  | "note"

export type CreateContainerActionState = {
  status: "idle" | "error" | "success"
  message?: string
  issues?: string[]
  fieldErrors?: Partial<Record<CreateContainerFieldName, string>>
}

export const initialCreateContainerActionState: CreateContainerActionState = {
  status: "idle",
}

export type ContainerImportPreviewRow = {
  rowNo: number
  containerNo: string
  containerTypeCode: string
  customerCode: string
  routeCode: string
  shippingLineCode: string | null
  currentPortCode: string | null
  currentYardCode: string | null
  currentBlockCode: string | null
  currentSlotCode: string | null
  isValid: boolean
  errors: string[]
}

export type ContainerImportActionState = {
  status: "idle" | "error" | "preview" | "success"
  message?: string
  issues?: string[]
  sourceText?: string
  sourceFileName?: string
  summary?: {
    totalRows: number
    validRows: number
    invalidRows: number
  }
  rows?: ContainerImportPreviewRow[]
}

export const initialContainerImportActionState: ContainerImportActionState = {
  status: "idle",
}
