import * as XLSX from "xlsx"

import {
  CONTAINER_IMPORT_HEADERS,
  CONTAINER_IMPORT_REQUIRED_HEADERS,
  type CanonicalContainerImportRow,
  type ContainerImportHeader,
  type ContainerImportValidationContext,
  type ContainerStatusHint,
  type ContainerImportValidationResult,
  type ParsedContainerImportRow,
  type ResolvedContainerMutationInput,
  type ValidatedContainerImportRow,
} from "./container-mutation-types.ts"

function normalizeHeader(value: string) {
  return value.trim().toLowerCase()
}

function normalizeText(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeCode(value: string | null | undefined) {
  const trimmed = normalizeText(value)
  return trimmed ? trimmed.toUpperCase() : null
}

function normalizeStatusHint(value: string | null | undefined): ContainerStatusHint | null {
  const normalized = normalizeCode(value)

  switch (normalized) {
    case "YARD":
      return "yard"
    case "NEW":
      return "new"
    case "AT_SEAPORT_YARD":
      return "at_seaport_yard"
    case "AT_DRYPORT_YARD":
      return "at_dryport_yard"
    case "ON_BARGE":
      return "on_barge"
    case "IN_TRANSIT":
      return "in_transit"
    case "RELEASED":
      return "released"
    case "HOLD":
      return "hold"
    default:
      return null
  }
}

function normalizeContainerImportRow(
  input: Partial<Record<ContainerImportHeader, string | null>>,
): CanonicalContainerImportRow {
  return {
    containerNo: normalizeCode(input.container_no),
    containerTypeCode: normalizeCode(input.container_type_code),
    customerCode: normalizeCode(input.customer_code),
    routeCode: normalizeCode(input.route_code),
    shippingLineCode: normalizeCode(input.shipping_line_code),
    grossWeightKg: normalizeText(input.gross_weight_kg),
    eta: normalizeText(input.eta),
    billNo: normalizeText(input.bill_no),
    sealNo: normalizeText(input.seal_no),
    currentPortCode: normalizeCode(input.current_port_code),
    currentYardCode: normalizeCode(input.current_yard_code),
    currentBlockCode: normalizeCode(input.current_block_code),
    currentSlotCode: normalizeCode(input.current_slot_code),
    statusHint: normalizeStatusHint(input.status_hint),
    note: normalizeText(input.note),
  }
}

function parseCsvMatrix(text: string) {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ""
  let inQuotes = false

  const normalized = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index]
    const nextChar = normalized[index + 1]

    if (char === "\"") {
      if (inQuotes && nextChar === "\"") {
        currentCell += "\""
        index += 1
      } else {
        inQuotes = !inQuotes
      }

      continue
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentCell)
      currentCell = ""
      continue
    }

    if (char === "\n" && !inQuotes) {
      currentRow.push(currentCell)
      rows.push(currentRow)
      currentRow = []
      currentCell = ""
      continue
    }

    currentCell += char
  }

  currentRow.push(currentCell)
  rows.push(currentRow)

  return rows.filter((row) => row.some((cell) => cell.trim().length > 0))
}

function createEmptyParseResult() {
  return {
    rows: [] as ParsedContainerImportRow[],
    errors: [] as string[],
  }
}

const DISCHARGE_SHEET_REQUIRED_HEADERS = [
  "Unit Nbr",
  "Type ISO",
  "T-State",
  "Position",
  "Line Op",
  "Weight (kg)",
  "POD",
] as const

const ISO_TYPE_ALIASES = new Map<string, string>([
  ["20GP", "20GP"],
  ["22G1", "20GP"],
  ["40GP", "40GP"],
  ["42G1", "40GP"],
  ["40HC", "40HC"],
  ["45G0", "40HC"],
  ["45G1", "40HC"],
])

const POD_PORT_ALIASES = new Map<string, string>([
  ["VNHHP", "PORT-HPC"],
])

/** Kich thuoc (cot "Container Size" tren Sheet1 tom tat) -> ma loai container noi bo */
const CONTAINER_SIZE_TO_TYPE = new Map<string, string>([
  ["20", "20GP"],
  ["40", "40HC"],
  ["45", "40HC"],
])

const PORT_STATUS_HINT_ALIASES = new Map<string, ContainerStatusHint>([
  ["PORT-HPC", "at_seaport_yard"],
  ["PORT-HCM", "at_seaport_yard"],
  ["PORT-HNI", "at_dryport_yard"],
  ["PORT-BDU", "at_dryport_yard"],
])

type SpreadsheetContainerParseResult = {
  rows: ParsedContainerImportRow[]
  errors: string[]
  persistedText: string
  template: "csv" | "excel-discharge-list" | "excel-sheet1-summary"
  sheetName: string | null
  sourceSummary: string
}

function serializeRowsToCanonicalCsv(rows: ParsedContainerImportRow[]) {
  const headerLine = CONTAINER_IMPORT_HEADERS.join(",")
  const dataLines = rows.map((row) =>
    CONTAINER_IMPORT_HEADERS.map((header) => {
      const value =
        header === "status_hint"
          ? row.data.statusHint
          : row.rawData[header] ?? (row.data as Record<string, string | null>)[header]

      if (!value) {
        return ""
      }

      if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, "\"\"")}"`
      }

      return value
    }).join(","),
  )

  return [headerLine, ...dataLines].join("\n")
}

function toWorksheetMatrix(worksheet: XLSX.WorkSheet) {
  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(worksheet, {
    header: 1,
    raw: false,
    defval: "",
  })

  return rows.map((row) => row.map((cell) => `${cell ?? ""}`.trim()))
}

const DISCHARGE_HEADER_SCAN_MAX_ROWS = 50
const SHEET1_HEADER_SCAN_MAX_ROWS = 40

function findDischargeSheet(workbook: XLSX.WorkBook) {
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName]

    if (!worksheet) {
      continue
    }

    const matrix = toWorksheetMatrix(worksheet)

    for (
      let rowIndex = 0;
      rowIndex < Math.min(matrix.length, DISCHARGE_HEADER_SCAN_MAX_ROWS);
      rowIndex += 1
    ) {
      const row = matrix[rowIndex] ?? []
      const headerSet = new Set(row)

      if (DISCHARGE_SHEET_REQUIRED_HEADERS.every((header) => headerSet.has(header))) {
        return {
          sheetName,
          headerRowIndex: rowIndex,
          matrix,
        }
      }
    }
  }

  return null
}

/**
 * Sheet tom tat (vi du "Sheet1" trong FINAL DISCHARGE LIST): hang tieu de co
 * "Container no" + "Container Size", khac voi bang UnitFacilityVisit day du.
 */
function findSheet1SummarySheet(workbook: XLSX.WorkBook) {
  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName]

    if (!worksheet) {
      continue
    }

    const matrix = toWorksheetMatrix(worksheet)

    for (
      let rowIndex = 0;
      rowIndex < Math.min(matrix.length, SHEET1_HEADER_SCAN_MAX_ROWS);
      rowIndex += 1
    ) {
      const row = matrix[rowIndex] ?? []
      const normalizedCells = row.map((cell) => normalizeHeader(cell)).filter(Boolean)
      const headerSet = new Set(normalizedCells)

      if (headerSet.has("container no") && headerSet.has("container size")) {
        return {
          sheetName,
          headerRowIndex: rowIndex,
          matrix,
        }
      }
    }
  }

  return null
}

function parseFlexibleDateToIsoDate(value: string | null | undefined) {
  const trimmed = normalizeText(value)

  if (!trimmed) {
    return null
  }

  const matchSlash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+\d{1,2}:\d{2}(?::\d{2})?)?$/)

  if (matchSlash) {
    const day = Number(matchSlash[1])
    const month = Number(matchSlash[2])
    const year = Number(matchSlash[3])

    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    }
  }

  const parsed = new Date(trimmed)

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10)
  }

  return null
}

function buildSheet1RowNote(sourceRow: Record<string, string | null>) {
  const noteParts = [
    sourceRow["Container Status (Empty / Full)"]
      ? `Trang thai cont: ${sourceRow["Container Status (Empty / Full)"]}`
      : null,
    sourceRow["Container type"] ? `Loai hang: ${sourceRow["Container type"]}` : null,
    sourceRow["Vessel Code"] ? `Vessel Code: ${sourceRow["Vessel Code"]}` : null,
    sourceRow["Vessel Name"] ? `Tau: ${sourceRow["Vessel Name"]}` : null,
    sourceRow["Voyage"] ? `Chuyen: ${sourceRow["Voyage"]}` : null,
    sourceRow["Invoice Description"]
      ? `Mo ta hoa don: ${sourceRow["Invoice Description"]}`
      : null,
  ].filter(Boolean)

  return noteParts.join(" | ") || null
}

function pickDischargeBillNo(sourceRow: Record<string, string | null>) {
  return (
    normalizeText(sourceRow["RLH"]) ??
    normalizeText(sourceRow["RDH"]) ??
    normalizeText(sourceRow["I/B Actual Visit"])
  )
}

function parseSheet1SummarySpreadsheetRows(
  fileName: string,
  sheet1: {
    sheetName: string
    headerRowIndex: number
    matrix: string[][]
  },
  options: {
    customerCode: string
    routeCode: string
  },
): SpreadsheetContainerParseResult {
  const customerCode = normalizeCode(options.customerCode)
  const routeCode = normalizeCode(options.routeCode)
  const headerRow = sheet1.matrix[sheet1.headerRowIndex] ?? []
  const dataRows = sheet1.matrix.slice(sheet1.headerRowIndex + 1)
  const parsedRows: ParsedContainerImportRow[] = []

  for (const row of dataRows) {
    const sourceRow = Object.fromEntries(
      headerRow.map((header, index) => [header, normalizeText(row[index] ?? null)]),
    ) as Record<string, string | null>

    const containerNo = normalizeCode(sourceRow["Container no"])

    if (!containerNo) {
      continue
    }

    const sizeToken = normalizeText(sourceRow["Container Size"])
    const sizeKey = sizeToken ? normalizeCode(sizeToken) : null
    const mappedType = sizeKey ? (CONTAINER_SIZE_TO_TYPE.get(sizeKey) ?? null) : null
    const containerTypeCode = mappedType ?? sizeKey
    const etaIso = parseFlexibleDateToIsoDate(sourceRow["Departure Date"])
    const invoiceNo = normalizeText(sourceRow["Invoice Number"])
    const amountRaw = normalizeText(sourceRow["Invoice Amount"])
    const note = buildSheet1RowNote(sourceRow)
    const noteWithInvoice =
      invoiceNo && amountRaw
        ? [note, `Hoa don: ${invoiceNo} | So tien: ${amountRaw}`].filter(Boolean).join(" | ")
        : note

    const canonicalRawData: Record<string, string | null> = {
      ...sourceRow,
      container_no: containerNo,
      container_type_code: containerTypeCode,
      customer_code: customerCode,
      route_code: routeCode,
      shipping_line_code: null,
      gross_weight_kg: null,
      eta: etaIso,
      bill_no: invoiceNo,
      seal_no: null,
      current_port_code: null,
      current_yard_code: null,
      current_block_code: null,
      current_slot_code: null,
      status_hint: null,
      note: noteWithInvoice,
    }

    parsedRows.push({
      rowNo: parsedRows.length + 1,
      sourceType: "csv",
      rawData: canonicalRawData,
      data: normalizeContainerImportRow(canonicalRawData),
    })
  }

  if (parsedRows.length === 0) {
    return {
      rows: [],
      errors: ["Sheet tom tat khong co dong container hop le (can cot Container no)."],
      persistedText: "",
      template: "excel-sheet1-summary",
      sheetName: sheet1.sheetName,
      sourceSummary: `Excel tom tat | Sheet: ${sheet1.sheetName}`,
    }
  }

  return {
    rows: parsedRows,
    errors: [],
    persistedText: serializeRowsToCanonicalCsv(parsedRows),
    template: "excel-sheet1-summary",
    sheetName: sheet1.sheetName,
    sourceSummary: `Excel tom tat | Sheet: ${sheet1.sheetName}`,
  }
}

function buildDischargeRowNote(sourceRow: Record<string, string | null>) {
  const noteParts = [
    sourceRow["Category"] ? `Category: ${sourceRow["Category"]}` : null,
    sourceRow["V-State"] ? `V-State: ${sourceRow["V-State"]}` : null,
    sourceRow["T-State"] ? `T-State: ${sourceRow["T-State"]}` : null,
    sourceRow["Position"] ? `Position: ${sourceRow["Position"]}` : null,
    sourceRow["POD"] ? `POD: ${sourceRow["POD"]}` : null,
    sourceRow["RLH"] ? `RLH: ${sourceRow["RLH"]}` : null,
    sourceRow["RDH"] ? `RDH: ${sourceRow["RDH"]}` : null,
    sourceRow["I/B Actual Visit"] ? `I/B Actual Visit: ${sourceRow["I/B Actual Visit"]}` : null,
    sourceRow["O/B Actual Visit"] ? `O/B Actual Visit: ${sourceRow["O/B Actual Visit"]}` : null,
    sourceRow["Frght Kind"] ? `Frght Kind: ${sourceRow["Frght Kind"]}` : null,
    sourceRow["Reqs Power"] ? `Reqs Power: ${sourceRow["Reqs Power"]}` : null,
    sourceRow["Is OOG"] ? `Is OOG: ${sourceRow["Is OOG"]}` : null,
    sourceRow["Temp Required (C)"]
      ? `Temp Required (C): ${sourceRow["Temp Required (C)"]}`
      : null,
    sourceRow["IMDG"] ? `IMDG: ${sourceRow["IMDG"]}` : null,
    sourceRow["Hazardous?"] ? `Hazardous?: ${sourceRow["Hazardous?"]}` : null,
    sourceRow["Stow"] ? `Stow: ${sourceRow["Stow"]}` : null,
    sourceRow["Grp"] ? `Grp: ${sourceRow["Grp"]}` : null,
  ].filter(Boolean)

  return noteParts.join(" | ") || null
}

function parseDischargeSpreadsheetRows(
  fileName: string,
  fileBytes: Uint8Array,
  options: {
    customerCode: string
    routeCode: string
  },
): SpreadsheetContainerParseResult {
  const normalizedCustomerCode = normalizeCode(options.customerCode)
  const normalizedRouteCode = normalizeCode(options.routeCode)

  if (!normalizedCustomerCode || !normalizedRouteCode) {
    const errors: string[] = []

    if (!normalizedCustomerCode) {
      errors.push("Phai chon khach hang cho file Excel discharge list.")
    }

    if (!normalizedRouteCode) {
      errors.push("Phai chon tuyen cho file Excel discharge list.")
    }

    return {
      rows: [],
      errors,
      persistedText: "",
      template: "excel-discharge-list",
      sheetName: null,
      sourceSummary: `Excel discharge list: ${fileName}`,
    }
  }

  const customerCode = normalizedCustomerCode
  const routeCode = normalizedRouteCode

  const workbook = XLSX.read(fileBytes, { type: "buffer" })
  const dischargeSheet = findDischargeSheet(workbook)

  if (!dischargeSheet) {
    const sheet1 = findSheet1SummarySheet(workbook)

    if (sheet1) {
      return parseSheet1SummarySpreadsheetRows(fileName, sheet1, {
        customerCode,
        routeCode,
      })
    }

    return {
      rows: [],
      errors: [
        "Khong tim thay sheet hop le: can bang discharge (Unit Nbr, Type ISO, T-State, Position, Line Op, Weight (kg), POD) hoac bang tom tat (Container no, Container Size).",
      ],
      persistedText: "",
      template: "excel-discharge-list",
      sheetName: null,
      sourceSummary: `Excel: ${fileName}`,
    }
  }

  const headerRow = dischargeSheet.matrix[dischargeSheet.headerRowIndex] ?? []
  const dataRows = dischargeSheet.matrix.slice(dischargeSheet.headerRowIndex + 1)
  const parsedRows: ParsedContainerImportRow[] = []

  for (const row of dataRows) {
    const sourceRow = Object.fromEntries(
      headerRow.map((header, index) => [header, normalizeText(row[index] ?? null)]),
    ) as Record<string, string | null>

    if (!sourceRow["Unit Nbr"]) {
      continue
    }

    const typeIso = normalizeCode(sourceRow["Type ISO"])
    const currentPortCode = normalizeCode(sourceRow["POD"])
    const mappedPortCode = currentPortCode
      ? (POD_PORT_ALIASES.get(currentPortCode) ?? currentPortCode)
      : null
    const statusHint =
      normalizeCode(sourceRow["T-State"]) === "YARD"
        ? (mappedPortCode
            ? (PORT_STATUS_HINT_ALIASES.get(mappedPortCode) ?? "yard")
            : "yard")
        : null

    const canonicalRawData: Record<string, string | null> = {
      ...sourceRow,
      container_no: normalizeCode(sourceRow["Unit Nbr"]),
      container_type_code: typeIso ? (ISO_TYPE_ALIASES.get(typeIso) ?? typeIso) : null,
      customer_code: customerCode,
      route_code: routeCode,
      shipping_line_code: normalizeCode(sourceRow["Line Op"]),
      gross_weight_kg: normalizeText(sourceRow["Weight (kg)"]?.replace(/,/g, "").trim()),
      seal_no: normalizeText(sourceRow["Seal Nbr1"]),
      bill_no: pickDischargeBillNo(sourceRow),
      current_port_code: mappedPortCode,
      status_hint: statusHint,
      note: buildDischargeRowNote(sourceRow),
    }

    parsedRows.push({
      rowNo: parsedRows.length + 1,
      sourceType: "csv",
      rawData: canonicalRawData,
      data: normalizeContainerImportRow(canonicalRawData),
    })
  }

  if (parsedRows.length === 0) {
    return {
      rows: [],
      errors: ["Sheet discharge list khong co dong du lieu hop le."],
      persistedText: "",
      template: "excel-discharge-list",
      sheetName: dischargeSheet.sheetName,
      sourceSummary: `Excel discharge list | Sheet: ${dischargeSheet.sheetName}`,
    }
  }

  return {
    rows: parsedRows,
    errors: [],
    persistedText: serializeRowsToCanonicalCsv(parsedRows),
    template: "excel-discharge-list",
    sheetName: dischargeSheet.sheetName,
    sourceSummary: `Excel discharge list | Sheet: ${dischargeSheet.sheetName}`,
  }
}

export function parseSpreadsheetContainerRows(
  fileName: string,
  source: string | Uint8Array,
  options: {
    customerCode?: string | null
    routeCode?: string | null
  } = {},
): SpreadsheetContainerParseResult {
  if (typeof source === "string") {
    const parsed = parseCsvContainerRows(source)

    return {
      rows: parsed.rows,
      errors: parsed.errors,
      persistedText: source,
      template: "csv",
      sheetName: null,
      sourceSummary: `CSV template: ${fileName}`,
    }
  }

  return parseDischargeSpreadsheetRows(fileName, source, {
    customerCode: options.customerCode ?? "",
    routeCode: options.routeCode ?? "",
  })
}

export function parseCsvContainerRows(text: string) {
  const result = createEmptyParseResult()
  const matrix = parseCsvMatrix(text)

  if (matrix.length === 0) {
    result.errors.push("CSV khong co du lieu.")
    return result
  }

  const rawHeaders = matrix[0] ?? []
  const headers = rawHeaders.map(normalizeHeader)
  const headerSet = new Set(headers)
  const missingHeaders = CONTAINER_IMPORT_REQUIRED_HEADERS.filter(
    (header) => !headerSet.has(header),
  )

  if (missingHeaders.length > 0) {
    result.errors.push(`CSV thieu cot bat buoc: ${missingHeaders.join(", ")}`)
    return result
  }

  const unknownHeaders = headers.filter(
    (header): header is string =>
      !CONTAINER_IMPORT_HEADERS.includes(header as ContainerImportHeader),
  )

  if (unknownHeaders.length > 0) {
    result.errors.push(`CSV co cot khong duoc ho tro: ${unknownHeaders.join(", ")}`)
    return result
  }

  const dataRows = matrix.slice(1)

  for (const row of dataRows) {
    const rawData = {} as Partial<Record<ContainerImportHeader, string | null>>

    headers.forEach((header, index) => {
      rawData[header as ContainerImportHeader] = normalizeText(row[index] ?? null)
    })

    if (Object.values(rawData).every((value) => value === null)) {
      continue
    }

    result.rows.push({
      rowNo: result.rows.length + 1,
      sourceType: "csv",
      rawData,
      data: normalizeContainerImportRow(rawData),
    })
  }

  return result
}

export function parseEdiContainerRows(text: string) {
  const result = createEmptyParseResult()
  const segments = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/'/g, "\n")
    .split("\n")
    .map((segment) => segment.trim())
    .filter(Boolean)

  let currentRow: Partial<Record<ContainerImportHeader, string | null>> | null = null

  const flushCurrentRow = () => {
    if (!currentRow) {
      return
    }

    result.rows.push({
      rowNo: result.rows.length + 1,
      sourceType: "edi",
      rawData: currentRow,
      data: normalizeContainerImportRow(currentRow),
    })
    currentRow = null
  }

  for (const segment of segments) {
    const [tag, ...parts] = segment.split("+")
    const normalizedTag = tag?.toUpperCase()

    if (normalizedTag === "EQD") {
      flushCurrentRow()
      currentRow = {
        container_no: parts[0] ?? null,
        container_type_code: parts[1] ?? null,
      }
      continue
    }

    if (normalizedTag === "UNT") {
      flushCurrentRow()
      continue
    }

    if (!currentRow) {
      continue
    }

    if (normalizedTag === "RFF") {
      const [qualifier, value] = (parts[0] ?? "").split(":")

      if (qualifier === "CU") {
        currentRow.customer_code = value ?? null
      }

      if (qualifier === "RT") {
        currentRow.route_code = value ?? null
      }

      if (qualifier === "BM") {
        currentRow.bill_no = value ?? null
      }

      continue
    }

    if (normalizedTag === "TDT") {
      currentRow.shipping_line_code = parts[0] ?? null
      continue
    }

    if (normalizedTag === "MEA") {
      const [qualifier, value] = (parts[0] ?? "").split(":")

      if (qualifier === "WT") {
        currentRow.gross_weight_kg = value ?? null
      }

      continue
    }

    if (normalizedTag === "DTM") {
      const [qualifier, value] = (parts[0] ?? "").split(":")

      if (qualifier === "ETA") {
        currentRow.eta = value ?? null
      }

      continue
    }

    if (normalizedTag === "LOC") {
      const [qualifier, value] = (parts[0] ?? "").split(":")

      if (qualifier === "P") {
        currentRow.current_port_code = value ?? null
      }

      if (qualifier === "Y") {
        currentRow.current_yard_code = value ?? null
      }

      if (qualifier === "B") {
        currentRow.current_block_code = value ?? null
      }

      if (qualifier === "S") {
        currentRow.current_slot_code = value ?? null
      }

      continue
    }

    if (normalizedTag === "SEL") {
      currentRow.seal_no = parts[0] ?? null
      continue
    }

    if (normalizedTag === "FTX") {
      currentRow.note = parts.join("+") || null
    }
  }

  flushCurrentRow()

  if (result.rows.length === 0) {
    result.errors.push("EDI khong co record hop le.")
  }

  return result
}

function buildLookupMap<T extends { code: string }>(items: readonly T[]) {
  return new Map(items.map((item) => [item.code.toUpperCase(), item]))
}

function parseOptionalDate(value: string | null) {
  if (!value) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function parseOptionalPositiveNumber(value: string | null) {
  if (!value) {
    return null
  }

  const normalized = value.replace(/,/g, "")
  const parsed = Number(normalized)
  return Number.isFinite(parsed) && parsed > 0 ? normalized : null
}

function resolveContainerImportRow(
  row: ParsedContainerImportRow,
  context: ContainerImportValidationContext,
  duplicateContainerNos: Set<string>,
  existingContainerNos: Set<string>,
  occupiedSlotIds: Set<string>,
) {
  const errors: string[] = []
  const containerTypesByCode = buildLookupMap(context.containerTypes)
  const customersByCode = buildLookupMap(context.customers)
  const shippingLinesByCode = buildLookupMap(context.shippingLines)
  const routesByCode = buildLookupMap(context.routes)
  const portsByCode = buildLookupMap(context.ports)
  const yardsByCode = new Map<string, Array<(typeof context.yards)[number]>>()
  context.yards.forEach((item) => {
    const key = item.code.toUpperCase()
    const current = [...(yardsByCode.get(key) ?? [])]
    current.push(item)
    yardsByCode.set(key, current)
  })

  const containerNo = row.data.containerNo
  const containerType = row.data.containerTypeCode
    ? containerTypesByCode.get(row.data.containerTypeCode)
    : null
  const customer = row.data.customerCode
    ? customersByCode.get(row.data.customerCode)
    : null
  const route = row.data.routeCode ? routesByCode.get(row.data.routeCode) : null
  const shippingLine = row.data.shippingLineCode
    ? shippingLinesByCode.get(row.data.shippingLineCode)
    : null
  const explicitPort = row.data.currentPortCode
    ? portsByCode.get(row.data.currentPortCode)
    : null
  const matchingYards = row.data.currentYardCode
    ? (yardsByCode.get(row.data.currentYardCode) ?? []).filter(
        (item) => !explicitPort || item.portId === explicitPort.id,
      )
    : []
  const yard = matchingYards[0] ?? null
  const block =
    row.data.currentBlockCode && yard
      ? context.blocks.find(
          (item) =>
            item.isActive &&
            item.yardId === yard.id &&
            item.code.toUpperCase() === row.data.currentBlockCode,
        ) ?? null
      : null
  const slot =
    row.data.currentSlotCode && block
      ? context.slots.find(
          (item) =>
            item.isActive &&
            item.blockId === block.id &&
            item.code.toUpperCase() === row.data.currentSlotCode,
        ) ?? null
      : null

  if (!containerNo) {
    errors.push("Container_no la bat buoc.")
  } else {
    if (duplicateContainerNos.has(containerNo)) {
      errors.push("Container_no bi trung lap trong file.")
    }

    if (existingContainerNos.has(containerNo)) {
      errors.push("Container_no da ton tai trong he thong.")
    }
  }

  if (!row.data.containerTypeCode) {
    errors.push("Container_type_code la bat buoc.")
  } else if (!containerType || !containerType.isActive) {
    errors.push("Container_type_code khong hop le.")
  }

  if (!row.data.customerCode) {
    errors.push("Customer_code la bat buoc.")
  } else if (!customer || !customer.isActive) {
    errors.push("Customer_code khong hop le.")
  }

  if (!row.data.routeCode) {
    errors.push("Route_code la bat buoc.")
  } else if (!route || !route.isActive) {
    errors.push("Route_code khong hop le.")
  }

  if (row.data.shippingLineCode && (!shippingLine || !shippingLine.isActive)) {
    errors.push("Shipping_line_code khong hop le.")
  }

  const parsedWeight = parseOptionalPositiveNumber(row.data.grossWeightKg)
  if (row.data.grossWeightKg && !parsedWeight) {
    errors.push("Gross_weight_kg phai la so duong.")
  }

  const parsedEta = parseOptionalDate(row.data.eta)
  if (row.data.eta && !parsedEta) {
    errors.push("Eta khong hop le.")
  }

  const hasAnyYardLocation =
    !!row.data.currentYardCode || !!row.data.currentBlockCode || !!row.data.currentSlotCode

  if (hasAnyYardLocation) {
    if (!row.data.currentYardCode || !row.data.currentBlockCode || !row.data.currentSlotCode) {
      errors.push("Phai cung cap du yard, block, slot.")
    }
  }

  if (row.data.currentPortCode && (!explicitPort || !explicitPort.isActive)) {
    errors.push("Current_port_code khong hop le.")
  }

  if (row.data.currentYardCode && matchingYards.length > 1) {
    errors.push("Current_yard_code khong xac dinh duoc trong port hien tai.")
  }

  if (row.data.currentYardCode && (!yard || !yard.isActive)) {
    errors.push("Current_yard_code khong hop le.")
  }

  if (row.data.currentBlockCode) {
    if (!block || !block.isActive) {
      errors.push("Current_block_code khong hop le.")
    } else if (yard && block.yardId !== yard.id) {
      errors.push("Block khong thuoc yard da chon.")
    }
  }

  if (row.data.currentSlotCode) {
    if (!slot || !slot.isActive) {
      errors.push("Current_slot_code khong hop le.")
    } else if (block && slot.blockId !== block.id) {
      errors.push("Slot khong thuoc block da chon.")
    } else if (occupiedSlotIds.has(slot.id)) {
      errors.push("Slot dang co container khac chiem.")
    }
  }

  let resolvedStatus: ResolvedContainerMutationInput["currentStatus"] = "new"
  let resolvedPortId: string | null = explicitPort?.id ?? null

  if (yard) {
    const yardPort = context.ports.find((port) => port.id === yard.portId) ?? null

    if (!yardPort || !yardPort.isActive) {
      errors.push("Port cua yard khong hop le.")
    } else {
      resolvedPortId = yardPort.id
      resolvedStatus =
        yardPort.portType === "seaport" ? "at_seaport_yard" : "at_dryport_yard"

      if (explicitPort && explicitPort.id !== yardPort.id) {
        errors.push("Current_port_code phai khop voi port cua yard.")
      }
    }
  } else if (row.data.statusHint) {
    switch (row.data.statusHint) {
      case "yard":
        if (!explicitPort || !explicitPort.isActive) {
          errors.push("Status_hint `yard` can current_port_code hop le.")
        } else {
          resolvedStatus =
            explicitPort.portType === "seaport" ? "at_seaport_yard" : "at_dryport_yard"
        }
        break
      case "new":
      case "at_seaport_yard":
      case "at_dryport_yard":
      case "on_barge":
      case "in_transit":
      case "released":
      case "hold":
        resolvedStatus = row.data.statusHint
        break
      default:
        errors.push("Status_hint khong hop le.")
        break
    }
  }

  const resolved =
    errors.length === 0 && containerNo && containerType && customer && route
      ? {
          containerNo,
          containerTypeId: containerType.id,
          customerId: customer.id,
          routeId: route.id,
          shippingLineId: shippingLine?.id ?? null,
          currentStatus: resolvedStatus,
          customsStatus: "pending" as const,
          currentPortId: resolvedPortId,
          currentYardId: yard?.id ?? null,
          currentBlockId: block?.id ?? null,
          currentSlotId: slot?.id ?? null,
          eta: parsedEta,
          grossWeightKg: parsedWeight,
          billNo: row.data.billNo,
          sealNo: row.data.sealNo,
          note: row.data.note,
        }
      : null

  return {
    ...row,
    errors,
    isValid: errors.length === 0,
    resolved,
  } satisfies ValidatedContainerImportRow
}

export function validateContainerImportRows(
  rows: ParsedContainerImportRow[],
  context: ContainerImportValidationContext,
): ContainerImportValidationResult {
  const duplicateCounts = new Map<string, number>()

  rows.forEach((row) => {
    if (!row.data.containerNo) {
      return
    }

    duplicateCounts.set(
      row.data.containerNo,
      (duplicateCounts.get(row.data.containerNo) ?? 0) + 1,
    )
  })

  const duplicateContainerNos = new Set(
    [...duplicateCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([containerNo]) => containerNo),
  )

  const existingContainerNos = new Set(
    context.existingContainerNos.map((containerNo) => containerNo.toUpperCase()),
  )
  const occupiedSlotIds = new Set(context.occupiedSlotIds)

  const validatedRows = rows.map((row) =>
    resolveContainerImportRow(
      row,
      context,
      duplicateContainerNos,
      existingContainerNos,
      occupiedSlotIds,
    ),
  )

  const validRows = validatedRows.filter((row) => row.isValid).length

  return {
    rows: validatedRows,
    summary: {
      totalRows: validatedRows.length,
      validRows,
      invalidRows: validatedRows.length - validRows,
    },
  }
}

export type {
  ContainerImportValidationContext,
  ContainerImportValidationResult,
  ParsedContainerImportRow,
  ResolvedContainerMutationInput,
  ValidatedContainerImportRow,
} from "./container-mutation-types.ts"
