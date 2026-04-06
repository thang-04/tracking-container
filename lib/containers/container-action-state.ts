
export type ContainerImportPreviewRow = {
  rowNo: number
  containerNo: string
  containerTypeCode: string
  rawData: Record<string, string | null>
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
  sourceSummary?: string
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

export type ContainerImportSubmitActionState = {
  status: "idle" | "error"
  message?: string
  issues?: string[]
}

export const initialContainerImportSubmitActionState: ContainerImportSubmitActionState = {
  status: "idle",
}
