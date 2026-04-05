function readStringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

export type SpreadsheetImportSourcePayload =
  | {
      format: "csv"
      text: string
      bytes: null
      fileName: string
      errors: string[]
    }
  | {
      format: "xlsx"
      text: null
      bytes: Uint8Array
      fileName: string
      errors: string[]
    }
  | {
      format: "csv"
      text: null
      bytes: null
      fileName: string
      errors: string[]
    }

function readPersistedSourcePayload(formData: FormData) {
  const text = readStringValue(formData, "persistedSourceText").trim()
  const fileName = readStringValue(formData, "persistedFileName").trim()

  if (!text) {
    return null
  }

  return {
    text,
    fileName: fileName || "preview.txt",
  }
}

export async function readCsvImportSourcePayload(
  formData: FormData,
): Promise<SpreadsheetImportSourcePayload> {
  const fileValue = formData.get("csvFile")

  if (fileValue instanceof File && fileValue.size > 0) {
    const fileName = fileValue.name || "containers.csv"

    if (fileName.toLowerCase().endsWith(".xlsx")) {
      return {
        format: "xlsx" as const,
        text: null,
        bytes: new Uint8Array(await fileValue.arrayBuffer()),
        fileName,
        errors: [] as string[],
      }
    }

    return {
      format: "csv" as const,
      text: await fileValue.text(),
      bytes: null,
      fileName,
      errors: [] as string[],
    }
  }

  const persisted = readPersistedSourcePayload(formData)

  if (persisted) {
    return {
      format: "csv" as const,
      text: persisted.text,
      bytes: null,
      fileName: persisted.fileName,
      errors: [] as string[],
    }
  }

  return {
    format: "csv" as const,
    text: null,
    bytes: null,
    fileName: "containers.csv",
    errors: ["Vui long chon file CSV hoac Excel de kiem tra."],
  } satisfies SpreadsheetImportSourcePayload
}

export async function readEdiImportSourcePayload(formData: FormData) {
  const rawText = readStringValue(formData, "ediText").trim()

  if (rawText.length > 0) {
    return {
      text: rawText,
      fileName: "edi-inline.txt",
      errors: [] as string[],
    }
  }

  const fileValue = formData.get("ediFile")

  if (fileValue instanceof File && fileValue.size > 0) {
    return {
      text: await fileValue.text(),
      fileName: fileValue.name || "edi-upload.txt",
      errors: [] as string[],
    }
  }

  const persisted = readPersistedSourcePayload(formData)

  if (persisted) {
    return {
      text: persisted.text,
      fileName: persisted.fileName,
      errors: [] as string[],
    }
  }

  return {
    text: null,
    fileName: "edi-inline.txt",
    errors: ["Vui long paste noi dung EDI hoac tai file .edi/.txt."],
  }
}
