"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  initialContainerImportActionState,
  initialContainerImportSubmitActionState,
  initialCreateContainerActionState,
  type ContainerImportActionState,
  type ContainerImportSubmitActionState,
  type CreateContainerActionState,
  type CreateContainerFieldName,
} from "@/lib/containers/container-action-state"
import {
  getContainerWorkflowReferenceData,
  toContainerImportValidationContext,
} from "@/lib/containers/container-master-data"
import {
  parseEdiContainerRows,
  parseSpreadsheetContainerRows,
  validateContainerImportRows,
  type ParsedContainerImportRow,
} from "@/lib/containers/container-import"
import {
  readCsvImportSourcePayload,
  readEdiImportSourcePayload,
} from "@/lib/containers/container-import-source"
import {
  importContainerImportPreviewBatch,
  persistContainerImportPreviewBatch,
  persistManualContainer,
} from "@/lib/containers/container-persistence"
import { isLocalAuthMockEnabled } from "@/lib/auth/mock-auth"
import { requireInternalAccess } from "@/lib/auth/server"

function readStringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

function createManualContainerRow(formData: FormData): ParsedContainerImportRow {
  const locationMode = readStringValue(formData, "locationMode") || "none"
  const hasYardLocation = locationMode === "yard"

  return {
    rowNo: 1,
    sourceType: "csv",
    rawData: {},
    data: {
      containerNo: readStringValue(formData, "containerNo") || null,
      containerTypeCode: readStringValue(formData, "containerTypeCode") || null,
      customerCode: readStringValue(formData, "customerCode") || null,
      routeCode: readStringValue(formData, "routeCode") || null,
      shippingLineCode: readStringValue(formData, "shippingLineCode") || null,
      grossWeightKg: readStringValue(formData, "grossWeightKg") || null,
      eta: readStringValue(formData, "eta") || null,
      billNo: readStringValue(formData, "billNo") || null,
      sealNo: readStringValue(formData, "sealNo") || null,
      currentPortCode: readStringValue(formData, "currentPortCode") || null,
      currentYardCode: hasYardLocation ? readStringValue(formData, "currentYardCode") || null : null,
      currentBlockCode: hasYardLocation ? readStringValue(formData, "currentBlockCode") || null : null,
      currentSlotCode: hasYardLocation ? readStringValue(formData, "currentSlotCode") || null : null,
      statusHint: null,
      note: readStringValue(formData, "note") || null,
    },
  }
}

function mapIssueToField(issue: string): CreateContainerFieldName | null {
  const normalized = issue.toLowerCase()

  if (normalized.includes("container_no")) {
    return "containerNo"
  }

  if (normalized.includes("container_type_code")) {
    return "containerTypeCode"
  }

  if (normalized.includes("customer_code")) {
    return "customerCode"
  }

  if (normalized.includes("route_code")) {
    return "routeCode"
  }

  if (normalized.includes("shipping_line_code")) {
    return "shippingLineCode"
  }

  if (normalized.includes("gross_weight_kg")) {
    return "grossWeightKg"
  }

  if (normalized.includes("eta")) {
    return "eta"
  }

  if (normalized.includes("current_port_code")) {
    return "currentPortCode"
  }

  if (normalized.includes("current_yard_code")) {
    return "currentYardCode"
  }

  if (normalized.includes("current_block_code")) {
    return "currentBlockCode"
  }

  if (normalized.includes("current_slot_code") || normalized.includes("slot")) {
    return "currentSlotCode"
  }

  return null
}

function buildCreateContainerErrorState(
  issues: string[],
  message = "Không thể tạo container với dữ liệu hiện tại.",
): CreateContainerActionState {
  const fieldErrors: Partial<Record<CreateContainerFieldName, string>> = {}

  for (const issue of issues) {
    const fieldName = mapIssueToField(issue)

    if (fieldName && !fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue
    }
  }

  return {
    status: "error",
    message,
    issues,
    fieldErrors,
  }
}

function buildImportErrorState(
  message: string,
  issues: string[] = [],
  source?: {
    text?: string | null
    fileName?: string
    summary?: string
  },
): ContainerImportActionState {
  return {
    status: "error",
    message,
    issues,
    sourceText: source?.text ?? undefined,
    sourceFileName: source?.fileName ?? undefined,
    sourceSummary: source?.summary,
  }
}

export async function createContainerAction(
  _previousState: CreateContainerActionState = initialCreateContainerActionState,
  formData: FormData,
): Promise<CreateContainerActionState> {
  const auth = await requireInternalAccess()

  if (isLocalAuthMockEnabled()) {
    return buildCreateContainerErrorState([], "Chế độ mock local không hỗ trợ tạo container.")
  }

  const referenceData = await getContainerWorkflowReferenceData()
  const validationContext = {
    ...toContainerImportValidationContext(referenceData),
    requireCustomerCode: true,
    requireRouteCode: true,
  }
  const validation = validateContainerImportRows(
    [createManualContainerRow(formData)],
    validationContext,
  )

  const row = validation.rows[0]

  if (!row || !row.isValid || !row.resolved) {
    return buildCreateContainerErrorState(
      row?.errors ?? ["Không đọc được dữ liệu từ form tạo container."],
    )
  }

  try {
    const container = await persistManualContainer(row.resolved, {
      actorUserId: auth.userId,
    })

    revalidatePath("/containers")

    return {
      status: "success",
      message: `Đã tạo container ${container.containerNo}.`,
    }
  } catch (error) {
    return buildCreateContainerErrorState(
      ["Dữ liệu vừa thay đổi trong hệ thống. Vui lòng kiểm tra lại và thử lại."],
      error instanceof Error ? error.message : "Không thể tạo container.",
    )
  }
}

export async function startContainerImportPreviewAction(
  _previousState: ContainerImportActionState = initialContainerImportActionState,
  formData: FormData,
): Promise<ContainerImportActionState> {
  const auth = await requireInternalAccess()

  const mode = readStringValue(formData, "mode") === "edi" ? "edi" : "csv"
  let fileName = mode === "edi" ? "edi-inline.txt" : "containers.csv"
  let parsed:
    | ReturnType<typeof parseSpreadsheetContainerRows>
    | (ReturnType<typeof parseEdiContainerRows> & {
        persistedText: string
        sourceSummary: string
      })
    | null = null

  if (mode === "csv") {
    const spreadsheetPayload = await readCsvImportSourcePayload(formData)
    fileName = spreadsheetPayload.fileName

    if (spreadsheetPayload.errors.length > 0) {
      return buildImportErrorState(
        spreadsheetPayload.errors[0] ?? "Không đọc được file import.",
        spreadsheetPayload.errors,
        { fileName },
      )
    }

    if (spreadsheetPayload.format === "xlsx") {
      if (!spreadsheetPayload.bytes) {
        return buildImportErrorState("Không đọc được file Excel.", [], { fileName })
      }

      parsed = parseSpreadsheetContainerRows(spreadsheetPayload.fileName, spreadsheetPayload.bytes)
    } else if (spreadsheetPayload.text) {
      parsed = parseSpreadsheetContainerRows(spreadsheetPayload.fileName, spreadsheetPayload.text)
    }
  } else {
    const ediPayload = await readEdiImportSourcePayload(formData)
    fileName = ediPayload.fileName

    if (ediPayload.errors.length > 0) {
      return buildImportErrorState(
        ediPayload.errors[0] ?? "Vui lòng dán nội dung EDI hoặc tải file .edi/.txt.",
        ediPayload.errors,
        { fileName },
      )
    }

    if (ediPayload.text) {
      parsed = {
        ...parseEdiContainerRows(ediPayload.text),
        persistedText: ediPayload.text,
        sourceSummary: `EDI: ${ediPayload.fileName}`,
      }
    }
  }

  if (!parsed) {
    return buildImportErrorState("Không đọc được nội dung import.", [], { fileName })
  }

  if (parsed.errors.length > 0) {
    return buildImportErrorState(parsed.errors[0] ?? "Không đọc được nội dung import.", parsed.errors, {
      fileName,
      text: mode === "edi" ? parsed.persistedText : null,
      summary: parsed.sourceSummary,
    })
  }

  const referenceData = await getContainerWorkflowReferenceData()
  const validation = validateContainerImportRows(
    parsed.rows,
    toContainerImportValidationContext(referenceData),
  )

  const batch = await persistContainerImportPreviewBatch(validation.rows, {
    sourceMode: mode,
    fileName,
    uploadedBy: auth.userId,
    note: parsed.sourceSummary,
  })

  redirect(`/containers/import/${batch.id}`)
}

export async function previewOrImportContainersAction(
  previousState: ContainerImportActionState = initialContainerImportActionState,
  formData: FormData,
): Promise<ContainerImportActionState> {
  return startContainerImportPreviewAction(previousState, formData)
}

export async function importContainerImportPreviewBatchAction(
  _previousState: ContainerImportSubmitActionState = initialContainerImportSubmitActionState,
  formData: FormData,
): Promise<ContainerImportSubmitActionState> {
  const auth = await requireInternalAccess()

  const batchId = readStringValue(formData, "batchId")

  if (!batchId) {
    return {
      status: "error",
      message: "Thiếu mã batch preview.",
    }
  }

  try {
    await importContainerImportPreviewBatch(batchId, {
      uploadedBy: auth.userId,
    })

    revalidatePath("/containers")
    redirect("/containers")
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "Không thể nhập dữ liệu từ batch preview.",
    }
  }
}
