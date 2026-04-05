function readStringValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === "string" ? value : ""
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

export async function readCsvImportSourcePayload(formData: FormData) {
  const fileValue = formData.get("csvFile")

  if (fileValue instanceof File && fileValue.size > 0) {
    return {
      text: await fileValue.text(),
      fileName: fileValue.name || "containers.csv",
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
    fileName: "containers.csv",
    errors: ["Vui long chon file CSV de kiem tra."],
  }
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
