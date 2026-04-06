"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import {
  initialContainerImportActionState,
  initialContainerImportSubmitActionState,
  type ContainerImportActionState,
  type ContainerImportSubmitActionState,
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
} from "@/lib/containers/container-persistence"
import { isLocalAuthMockEnabled } from "@/lib/auth/mock-auth"
import { requireInternalAccess } from "@/lib/auth/server"

function readStringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
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

  if (validation.summary.validRows === 0) {
    return buildImportErrorState(
      "Không thể nhập dữ liệu: Tất cả bản ghi trong file đều đã tồn tại trên hệ thống hoặc chứa lỗi không thể khắc phục.",
      ["Vui lòng kiểm tra lại file. Không có bản ghi mới nào hợp lệ để tạo bản xem trước."],
      {
        fileName,
        text: mode === "edi" ? parsed.persistedText : null,
        summary: parsed.sourceSummary,
      }
    )
  }

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
