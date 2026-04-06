function readStringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
}

/** .xlsx / .xlsm la ZIP; neu ten file mat duoi .xlsx van phai doc duoc. */
function isZipArchiveStart(bytes: Uint8Array) {
  return (
    bytes.length >= 4 &&
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
    (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08)
  )
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
    const lower = fileName.toLowerCase()
    const bytes = new Uint8Array(await fileValue.arrayBuffer())

    const looksOfficeOpenXmlByName =
      lower.endsWith(".xlsx") ||
      lower.endsWith(".xlsm") ||
      lower.endsWith(".xlsb")

    if (looksOfficeOpenXmlByName || isZipArchiveStart(bytes)) {
      return {
        format: "xlsx" as const,
        text: null,
        bytes,
        fileName,
        errors: [] as string[],
      }
    }

    return {
      format: "csv" as const,
      text: new TextDecoder("utf-8", { fatal: false }).decode(bytes),
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
    errors: ["Vui lòng chọn file CSV hoặc Excel để kiểm tra."],
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
    errors: ["Vui lòng dán nội dung EDI hoặc tải file .edi/.txt."],
  }
}
