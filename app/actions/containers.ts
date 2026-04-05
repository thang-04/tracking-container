"use server"

import { revalidatePath } from "next/cache"

import {
  initialContainerImportActionState,
  initialCreateContainerActionState,
  type ContainerImportActionState,
  type ContainerImportPreviewRow,
  type CreateContainerActionState,
  type CreateContainerFieldName,
} from "@/lib/containers/container-action-state"
import {
  getContainerWorkflowReferenceData,
  toContainerImportValidationContext,
} from "@/lib/containers/container-master-data"
import {
  parseCsvContainerRows,
  parseEdiContainerRows,
  validateContainerImportRows,
  type ParsedContainerImportRow,
} from "@/lib/containers/container-import"
import {
  readCsvImportSourcePayload,
  readEdiImportSourcePayload,
} from "@/lib/containers/container-import-source"
import {
  persistImportedContainerBatch,
  persistManualContainer,
  persistRejectedContainerImportBatch,
} from "@/lib/containers/container-persistence"
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
      currentYardCode: hasYardLocation
        ? readStringValue(formData, "currentYardCode") || null
        : null,
      currentBlockCode: hasYardLocation
        ? readStringValue(formData, "currentBlockCode") || null
        : null,
      currentSlotCode: hasYardLocation
        ? readStringValue(formData, "currentSlotCode") || null
        : null,
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
  message = "Khong the tao container voi du lieu hien tai.",
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

function buildPreviewRows(rows: ReturnType<typeof validateContainerImportRows>["rows"]) {
  return rows.map(
    (row) =>
      ({
        rowNo: row.rowNo,
        containerNo: row.data.containerNo ?? "",
        containerTypeCode: row.data.containerTypeCode ?? "",
        customerCode: row.data.customerCode ?? "",
        routeCode: row.data.routeCode ?? "",
        shippingLineCode: row.data.shippingLineCode,
        currentPortCode: row.data.currentPortCode,
        currentYardCode: row.data.currentYardCode,
        currentBlockCode: row.data.currentBlockCode,
        currentSlotCode: row.data.currentSlotCode,
        isValid: row.isValid,
        errors: row.errors,
      }) satisfies ContainerImportPreviewRow,
  )
}

function buildImportErrorState(
  message: string,
  issues: string[] = [],
  source?: {
    text: string | null
    fileName: string
  },
): ContainerImportActionState {
  return {
    status: "error",
    message,
    issues,
    sourceText: source?.text ?? undefined,
    sourceFileName: source?.text ? source.fileName : undefined,
  }
}

export async function createContainerAction(
  _previousState: CreateContainerActionState = initialCreateContainerActionState,
  formData: FormData,
): Promise<CreateContainerActionState> {
  const auth = await requireInternalAccess()
  const referenceData = await getContainerWorkflowReferenceData()
  const validationContext = toContainerImportValidationContext(referenceData)
  const validation = validateContainerImportRows(
    [createManualContainerRow(formData)],
    validationContext,
  )

  const row = validation.rows[0]

  if (!row || !row.isValid || !row.resolved) {
    return buildCreateContainerErrorState(
      row?.errors ?? ["Khong doc duoc du lieu tu form tao container."],
    )
  }

  try {
    const container = await persistManualContainer(row.resolved, {
      actorUserId: auth.userId,
    })

    revalidatePath("/containers")

    return {
      status: "success",
      message: `Da tao container ${container.containerNo}.`,
    }
  } catch (error) {
    return buildCreateContainerErrorState(
      ["Du lieu vua thay doi trong he thong. Vui long kiem tra lai va thu lai."],
      error instanceof Error ? error.message : "Khong the tao container.",
    )
  }
}

export async function previewOrImportContainersAction(
  _previousState: ContainerImportActionState = initialContainerImportActionState,
  formData: FormData,
): Promise<ContainerImportActionState> {
  const auth = await requireInternalAccess()
  const intent = readStringValue(formData, "intent") === "import" ? "import" : "preview"
  const mode = readStringValue(formData, "mode") === "edi" ? "edi" : "csv"
  const inputPayload =
    mode === "csv"
      ? await readCsvImportSourcePayload(formData)
      : await readEdiImportSourcePayload(formData)

  if (inputPayload.errors.length > 0 || !inputPayload.text) {
    return buildImportErrorState(
      inputPayload.errors[0] ?? "Khong doc duoc file import.",
      inputPayload.errors,
    )
  }

  const parsed =
    mode === "csv"
      ? parseCsvContainerRows(inputPayload.text)
      : parseEdiContainerRows(inputPayload.text)

  if (parsed.errors.length > 0) {
    if (intent === "import") {
      await persistRejectedContainerImportBatch([], {
        sourceMode: mode,
        fileName: inputPayload.fileName,
        uploadedBy: auth.userId,
        note: parsed.errors.join(" | "),
      })
    }

    return buildImportErrorState(
      parsed.errors[0] ?? "Khong doc duoc noi dung import.",
      parsed.errors,
      {
        text: inputPayload.text,
        fileName: inputPayload.fileName,
      },
    )
  }

  const referenceData = await getContainerWorkflowReferenceData()
  const validation = validateContainerImportRows(
    parsed.rows,
    toContainerImportValidationContext(referenceData),
  )

  const previewState: ContainerImportActionState = {
    status: "preview",
    message:
      validation.summary.invalidRows > 0
        ? "Can sua het loi truoc khi nhap du lieu."
        : "Du lieu hop le. Ban co the nhap vao he thong.",
    sourceText: inputPayload.text,
    sourceFileName: inputPayload.fileName,
    summary: validation.summary,
    rows: buildPreviewRows(validation.rows),
    issues:
      validation.summary.invalidRows > 0
        ? validation.rows.flatMap((row) => row.errors).slice(0, 5)
        : undefined,
  }

  if (intent === "preview") {
    return previewState
  }

  if (validation.summary.invalidRows > 0) {
    await persistRejectedContainerImportBatch(validation.rows, {
      sourceMode: mode,
      fileName: inputPayload.fileName,
      uploadedBy: auth.userId,
      note: "Import blocked because validation errors remain.",
    })

    return previewState
  }

  try {
    const result = await persistImportedContainerBatch(validation.rows, {
      sourceMode: mode,
      fileName: inputPayload.fileName,
      uploadedBy: auth.userId,
    })

    revalidatePath("/containers")

    return {
      status: "success",
      message: `Da import ${result.importedCount} container tu ${inputPayload.fileName}.`,
    }
  } catch (error) {
    await persistRejectedContainerImportBatch(validation.rows, {
      sourceMode: mode,
      fileName: inputPayload.fileName,
      uploadedBy: auth.userId,
      note: error instanceof Error ? error.message : "Import transaction failed.",
    })

    return {
      ...previewState,
      status: "error",
      message: "Import that bai do du lieu vua thay doi. Vui long kiem tra lai va thu lai.",
    }
  }
}
