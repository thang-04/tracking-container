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

/** 
 * Chuẩn hóa mã (code): viết hoa, xóa khoảng trắng. 
 * Đặc biệt xử lý các placeholder phổ biến như '-', 'N/A', 'NONE' thành null.
 */
const CODE_PLACEHOLDERS = new Set(["-", "N/A", "NONE", "NULL", "UNDEFINED", "(BLANK)", "---"])

function normalizeCode(value: string | null | undefined) {
  const trimmed = normalizeText(value)
  if (!trimmed) return null
  const upper = trimmed.toUpperCase()
  if (CODE_PLACEHOLDERS.has(upper)) return null
  return upper
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
    // Chuẩn hóa các trường mới
    category: normalizeText(input.category),
    vState: normalizeText(input.v_state),
    tState: normalizeText(input.t_state),
    stow: normalizeText(input.stow),
    grp: normalizeText(input.grp),
    sealNo2: normalizeText(input.seal_no2),
    frghtKind: normalizeText(input.frght_kind),
    obActualVisit: normalizeText(input.ob_actual_visit),
    reqsPower: normalizeText(input.reqs_power),
    tempRequiredC: normalizeText(input.temp_required_c),
    rlh: normalizeText(input.rlh),
    rdh: normalizeText(input.rdh),
    isOog: normalizeText(input.is_oog),
    imdg: normalizeText(input.imdg),
    hazardous: normalizeText(input.hazardous),
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
  "Category",
  "T-State",
  "Line Op",
  "I/B Actual Visit",
  "POD",
] as const

/** Các tên cột thay thế phổ biến cho mẫu Discharge List */
const HEADER_ALIASES: Record<string, string[]> = {
  "Unit Nbr": ["Unit Nbr", "Container No", "Container Number", "Unit ID"],
  "Type ISO": ["Type ISO", "ISO Type", "Container Type"],
  "Line Op": ["Line Op", "Line", "Shipping Line", "Operator"],
  "Weight (kg)": ["Weight (kg)", "Weight", "Gross Weight"],
  "POD": ["POD", "Port of Discharge", "Port"],
  "I/B Actual Visit": ["I/B Actual Visit", "Voyage", "Inbound Voyage", "IB Voyage", "Visit ID"],
  "Seal Nbr1": ["Seal Nbr1", "Seal No", "Seal Number"],
  "Position": ["Position", "Yard Position", "Slot"],
  "Frght Kind": ["Frght Kind", "Cargo Type", "Freight Kind"],
  "Seal Nbr2": ["Seal Nbr2", "Seal No 2"],
  "O/B Actual Visit": ["O/B Actual Visit", "Outbound Voyage", "OB Voyage"],
  "V-State": ["V-State", "System State"],
  "T-State": ["T-State", "Operational State", "Transport State"],
  "Stow": ["Stow", "Stowage"],
  "Grp": ["Grp", "Group"],
  "Reqs Power": ["Reqs Power", "Power Required"],
  "Temp Required (C)": ["Temp Required (C)", "Temperature"],
  "IMDG": ["IMDG", "IMO Class"],
  "Hazardous?": ["Hazardous?", "Hazardous"],
  "Is OOG": ["Is OOG", "OOG"],
}

const ISO_TYPE_ALIASES = new Map<string, string>([
  // Ánh xạ các mã ISO quốc tế phổ biến về các loại container cơ bản trong hệ thống
  ["22G1", "20GP"],
  ["42G1", "40GP"],
  ["42R1", "40RE"],
  ["22R1", "20RE"],
  ["45R1", "40RE"],
])

const POD_PORT_ALIASES = new Map<string, string>([
  ["VNHHP", "PORT-HPC"],
])

/** Kich thuoc (cot "Container Size" tren Sheet1 tom tat) -> ma loai container noi bo */
const CONTAINER_SIZE_TO_TYPE = new Map<string, string>([
  ["20", "20GP"],
  ["40", "40HC"],
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

/** Cot CSV noi bo (snake_case) -> truong canonical (camelCase) de serialize dung. */
const CONTAINER_IMPORT_HEADER_TO_DATA_KEY = {
  container_no: "containerNo",
  container_type_code: "containerTypeCode",
  customer_code: "customerCode",
  route_code: "routeCode",
  shipping_line_code: "shippingLineCode",
  gross_weight_kg: "grossWeightKg",
  eta: "eta",
  bill_no: "billNo",
  seal_no: "sealNo",
  current_port_code: "currentPortCode",
  current_yard_code: "currentYardCode",
  current_block_code: "currentBlockCode",
  current_slot_code: "currentSlotCode",
  status_hint: "statusHint",
  note: "note",
  // Mapping các trường mới
  category: "category",
  v_state: "vState",
  t_state: "tState",
  stow: "stow",
  grp: "grp",
  seal_no2: "sealNo2",
  frght_kind: "frghtKind",
  ob_actual_visit: "obActualVisit",
  reqs_power: "reqsPower",
  temp_required_c: "tempRequiredC",
  rlh: "rlh",
  rdh: "rdh",
  is_oog: "isOog",
  imdg: "imdg",
  hazardous: "hazardous",
} satisfies Record<ContainerImportHeader, keyof CanonicalContainerImportRow>

function getSerializedImportCell(row: ParsedContainerImportRow, header: ContainerImportHeader) {
  const raw = row.rawData[header]

  if (raw != null && String(raw).trim() !== "") {
    return String(raw).trim()
  }

  const dataKey = CONTAINER_IMPORT_HEADER_TO_DATA_KEY[header]
  const value = row.data[dataKey]

  if (value == null || value === "") {
    return ""
  }

  return String(value)
}

function serializeRowsToCanonicalCsv(rows: ParsedContainerImportRow[]) {
  const headerLine = CONTAINER_IMPORT_HEADERS.join(",")
  const dataLines = rows.map((row) =>
    CONTAINER_IMPORT_HEADERS.map((header) => {
      const value = getSerializedImportCell(row, header)

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
    if (!worksheet) continue

    const matrix = toWorksheetMatrix(worksheet)

    for (
      let rowIndex = 0;
      rowIndex < Math.min(matrix.length, DISCHARGE_HEADER_SCAN_MAX_ROWS);
      rowIndex += 1
    ) {
      const row = matrix[rowIndex] ?? []
      const headerSet = new Set(row.map((cell) => cell.trim()))

      // Kiểm tra xem dòng này có chứa đủ các cột bắt buộc (hoặc các tên thay thế của chúng) hay không
      const hasAllRequired = DISCHARGE_SHEET_REQUIRED_HEADERS.every((req) => {
        const aliases = HEADER_ALIASES[req] || [req]
        return aliases.some((alias) => headerSet.has(alias))
      })

      if (hasAllRequired) {
        // Tạo map từ tên chuẩn sang index trong row thực tế
        const headerMap = new Map<string, number>()
        
        // Map các cột bắt buộc
        DISCHARGE_SHEET_REQUIRED_HEADERS.forEach((req) => {
          const aliases = HEADER_ALIASES[req] || [req]
          const index = row.findIndex((cell) => aliases.includes(cell.trim()))
          if (index !== -1) headerMap.set(req, index)
        })

        // Bổ sung các cột không bắt buộc vào map nếu tồn tại
        const optionalHeaders = [
          "Weight (kg)", "Position", "Seal Nbr1", "Frght Kind", "RLH", "RDH",
          "O/B Actual Visit", "V-State", "Stow", "Grp", "Reqs Power",
          "Temp Required (C)", "IMDG", "Hazardous?", "Is OOG", "Category"
        ]
        optionalHeaders.forEach((opt) => {
          const aliases = HEADER_ALIASES[opt] || [opt]
          const index = row.findIndex((cell) => aliases.some(a => cell.trim() === a))
          if (index !== -1) headerMap.set(opt, index)
        })

        return {
          sheetName,
          headerRowIndex: rowIndex,
          matrix,
          headerMap,
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
  // Chỉ lấy những ghi chú mang tính mô tả thực tế, không lấy các trường kỹ thuật đã được mapping
  const noteParts = [
    sourceRow["Invoice Description"] ? `Mô tả hóa đơn: ${sourceRow["Invoice Description"]}` : null,
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

function buildDischargeRowNote(sourceRow: Record<string, string | null>) {
  // Trả về ghi chú gốc từ file Excel nếu có, không tự ý gộp các trường khác vào gây rối
  return sourceRow["Note"] || null
}

function parseSheet1SummarySpreadsheetRows(
  fileName: string,
  sheet1: {
    sheetName: string
    headerRowIndex: number
    matrix: string[][]
  },
): SpreadsheetContainerParseResult {
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
        ? [note, 'H?a ??n: ' + invoiceNo + ' | S? ti?n: ' + amountRaw].filter(Boolean).join(" | ")
        : note

    const normalizedRow: Partial<Record<ContainerImportHeader, string | null>> = {
      container_no: containerNo,
      container_type_code: containerTypeCode,
      customer_code: null,
      route_code: null,
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
      rawData: sourceRow,
      data: normalizeContainerImportRow(normalizedRow),
    })
  }

  if (parsedRows.length === 0) {
    return {
      rows: [],
      errors: ["Sheet tóm tắt không có dòng container hợp lệ (cần cột Container no)."],
      persistedText: "",
      template: "excel-sheet1-summary",
      sheetName: sheet1.sheetName,
      sourceSummary: "Excel tóm tắt | Sheet: " + sheet1.sheetName,
    }
  }

  return {
    rows: parsedRows,
    errors: [],
    persistedText: serializeRowsToCanonicalCsv(parsedRows),
    template: "excel-sheet1-summary",
    sheetName: sheet1.sheetName,
    sourceSummary: 'Excel t?m t?t | Sheet: ' + sheet1.sheetName,
  }
}

function parseDischargeSpreadsheetRows(
  fileName: string,
  fileBytes: Uint8Array,
): SpreadsheetContainerParseResult {
  const workbook = XLSX.read(fileBytes, { type: "buffer" })
  const dischargeSheet = findDischargeSheet(workbook)

  if (!dischargeSheet) {
    const sheet1 = findSheet1SummarySheet(workbook)

    if (sheet1) {
      return parseSheet1SummarySpreadsheetRows(fileName, sheet1)
    }

    return {
      rows: [],
      errors: [
        "Không tìm thấy sheet hợp lệ: cần bảng discharge (Unit Nbr, Type ISO, T-State, Line Op, POD, v.v.) hoặc bảng tóm tắt (Container no, Container Size).",
      ],
      persistedText: "",
      template: "excel-discharge-list",
      sheetName: null,
      sourceSummary: "Excel: " + fileName,
    }
  }

  const { matrix, headerRowIndex, headerMap } = dischargeSheet
  const headerRow = matrix[headerRowIndex] ?? []
  const dataRows = matrix.slice(headerRowIndex + 1)
  const parsedRows: ParsedContainerImportRow[] = []

  // Hàm tiện ích để lấy dữ liệu từ row dựa trên header chuẩn
  const getValue = (row: string[], header: string) => {
    const index = headerMap.get(header)
    return index !== undefined ? normalizeText(row[index] ?? null) : null
  }

  for (const row of dataRows) {
    const unitNbr = getValue(row, "Unit Nbr")
    if (!unitNbr) continue

    // Lấy toàn bộ sourceRow để lưu vào rawData và build note
    const sourceRow = Object.fromEntries(
      headerRow.map((header, index) => [header, normalizeText(row[index] ?? null)]),
    ) as Record<string, string | null>

    const typeIso = normalizeCode(getValue(row, "Type ISO"))
    const currentPortCode = normalizeCode(getValue(row, "POD"))
    const mappedPortCode = currentPortCode
      ? (POD_PORT_ALIASES.get(currentPortCode) ?? currentPortCode)
      : null
    
    // Ánh xạ trạng thái
    const tState = normalizeCode(getValue(row, "T-State"))
    const statusHint = tState === "YARD"
      ? (mappedPortCode ? (PORT_STATUS_HINT_ALIASES.get(mappedPortCode) ?? "yard") : "yard")
      : null

    const normalizedRow: Partial<Record<ContainerImportHeader, string | null>> = {
      container_no: normalizeCode(unitNbr),
      container_type_code: typeIso ? (ISO_TYPE_ALIASES.get(typeIso) ?? typeIso) : null,
      customer_code: null,
      route_code: null,
      shipping_line_code: normalizeCode(getValue(row, "Line Op")),
      gross_weight_kg: normalizeText(getValue(row, "Weight (kg)")?.replace(/,/g, "").trim()),
      eta: null,
      bill_no: normalizeText(getValue(row, "I/B Actual Visit")),
      seal_no: normalizeText(getValue(row, "Seal Nbr1")),
      current_port_code: mappedPortCode,
      current_yard_code: null,
      current_block_code: null,
      current_slot_code: normalizeText(getValue(row, "Position")),
      status_hint: statusHint,
      note: buildDischargeRowNote(sourceRow),
      // Trích xuất các trường mới
      category: normalizeText(getValue(row, "Category")),
      v_state: normalizeText(getValue(row, "V-State")),
      t_state: normalizeText(getValue(row, "T-State")),
      stow: normalizeText(getValue(row, "Stow")),
      grp: normalizeText(getValue(row, "Grp")),
      seal_no2: normalizeText(getValue(row, "Seal Nbr2")),
      frght_kind: normalizeText(getValue(row, "Frght Kind")),
      ob_actual_visit: normalizeText(getValue(row, "O/B Actual Visit")),
      reqs_power: normalizeText(getValue(row, "Reqs Power")),
      temp_required_c: normalizeText(getValue(row, "Temp Required (C)")),
      rlh: normalizeText(getValue(row, "RLH")),
      rdh: normalizeText(getValue(row, "RDH")),
      is_oog: normalizeText(getValue(row, "Is OOG")),
      imdg: normalizeText(getValue(row, "IMDG")),
      hazardous: normalizeText(getValue(row, "Hazardous?")),
    }

    parsedRows.push({
      rowNo: parsedRows.length + 1,
      sourceType: "csv",
      rawData: sourceRow,
      data: normalizeContainerImportRow(normalizedRow),
    })
  }

  if (parsedRows.length === 0) {
    return {
      rows: [],
      errors: ["Sheet discharge list không có dòng dữ liệu hợp lệ."],
      persistedText: "",
      template: "excel-discharge-list",
      sheetName: dischargeSheet.sheetName,
      sourceSummary: "Excel danh sách dỡ hàng | Sheet: " + dischargeSheet.sheetName,
    }
  }

  return {
    rows: parsedRows,
    errors: [],
    persistedText: serializeRowsToCanonicalCsv(parsedRows),
    template: "excel-discharge-list",
    sheetName: dischargeSheet.sheetName,
    sourceSummary: "Excel danh sách dỡ hàng | Sheet: " + dischargeSheet.sheetName,
  }
}

export function parseSpreadsheetContainerRows(
  fileName: string,
  source: string | Uint8Array,
): SpreadsheetContainerParseResult {
  if (typeof source === "string") {
    const parsed = parseCsvContainerRows(source)

    return {
      rows: parsed.rows,
      errors: parsed.errors,
      persistedText: source,
      template: "csv",
      sheetName: null,
      sourceSummary: `CSV mẫu: ${fileName}`,
    }
  }

  return parseDischargeSpreadsheetRows(fileName, source)
}

export function parseCsvContainerRows(text: string) {
  const result = createEmptyParseResult()
  const matrix = parseCsvMatrix(text)

  if (matrix.length === 0) {
    result.errors.push("CSV không có dữ liệu.")
    return result
  }

  const rawHeaders = matrix[0] ?? []
  const headers = rawHeaders.map(normalizeHeader)
  const headerSet = new Set(headers)
  const missingHeaders = CONTAINER_IMPORT_REQUIRED_HEADERS.filter(
    (header) => !headerSet.has(header),
  )

  if (missingHeaders.length > 0) {
    result.errors.push(`CSV thiếu cột bắt buộc: ${missingHeaders.join(", ")}`)
    return result
  }

  const unknownHeaders = headers.filter(
    (header): header is string =>
      !CONTAINER_IMPORT_HEADERS.includes(header as ContainerImportHeader),
  )

  if (unknownHeaders.length > 0) {
    result.errors.push(`CSV có cột không được hỗ trợ: ${unknownHeaders.join(", ")}`)
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
    result.errors.push("EDI không có record hợp lệ.")
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

export function resolveContainerImportRow(
  row: ParsedContainerImportRow,
  context: ContainerImportValidationContext,
  duplicateContainerNos: Set<string>,
  existingContainerNos: Set<string>,
  occupiedSlotIds: Set<string>,
) {
  const errors: string[] = []
  const warnings: string[] = []
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
  const requireCustomerCode = context.requireCustomerCode ?? false
  const requireRouteCode = context.requireRouteCode ?? false
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
    errors.push("Số container là bắt buộc.")
  } else {
    if (duplicateContainerNos.has(containerNo)) {
      errors.push("Số container bị trùng lặp trong file.")
    }

    if (existingContainerNos.has(containerNo)) {
      errors.push("Số container đã tồn tại trong hệ thống.")
    }
  }

  if (!row.data.containerTypeCode) {
    errors.push("Loại container là bắt buộc.")
  } else if (!containerType || !containerType.isActive) {
    warnings.push(`Sẽ tự động tạo loại container mới: [${row.data.containerTypeCode}]`)
  }

  if (row.data.shippingLineCode && (!shippingLine || !shippingLine.isActive)) {
    warnings.push(`Sẽ tự động tạo hãng tàu mới: [${row.data.shippingLineCode}]`)
  }

  if (row.data.customerCode) {
    if (!customer || !customer.isActive) {
      warnings.push(`Sẽ tự động tạo chủ hàng mới: [${row.data.customerCode}]`)
    }
  } else if (requireCustomerCode) {
    errors.push("Chủ hàng là bắt buộc.")
  }

  if (row.data.routeCode) {
    if (!route || !route.isActive) {
      errors.push("Tuyến đường không hợp lệ.")
    }
  } else if (requireRouteCode) {
    errors.push("Tuyến đường là bắt buộc.")
  }



  const parsedWeight = parseOptionalPositiveNumber(row.data.grossWeightKg)
  if (row.data.grossWeightKg && !parsedWeight) {
    errors.push("Trọng lượng phải là số dương.")
  }

  const parsedEta = parseOptionalDate(row.data.eta)
  if (row.data.eta && !parsedEta) {
    errors.push("ETA không hợp lệ.")
  }

  const hasAnyYardLocation =
    !!row.data.currentYardCode || !!row.data.currentBlockCode || !!row.data.currentSlotCode

  if (hasAnyYardLocation) {
    if (!row.data.currentYardCode || !row.data.currentBlockCode || !row.data.currentSlotCode) {
      // Chuyển thành Warning: Hiện tại chúng ta cho phép nhập Position thô mà chưa cần khớp Master Data
      // errors.push("Phải cung cấp đủ yard, block, slot.")
    }
  }

  if (row.data.currentPortCode && (!explicitPort || !explicitPort.isActive)) {
    warnings.push(`Sẽ tự động tạo cảng mới: [${row.data.currentPortCode}]`)
  }

  if (row.data.currentYardCode && matchingYards.length > 1) {
    errors.push("Bãi không xác định được trong cảng hiện tại.")
  }

  if (row.data.currentYardCode && (!yard || !yard.isActive)) {
    // errors.push("Bãi không hợp lệ.")
  }

  if (row.data.currentBlockCode) {
    if (!block || !block.isActive) {
      // errors.push("Block không hợp lệ.")
    } else if (yard && block.yardId !== yard.id) {
      // errors.push("Block không thuộc bãi đã chọn.")
    }
  }

  if (row.data.currentSlotCode) {
    if (!slot || !slot.isActive) {
      // errors.push("Vị trí (Slot) không hợp lệ.")
    } else if (block && slot.blockId !== block.id) {
      // errors.push("Vị trí không thuộc block đã chọn.")
    } else if (occupiedSlotIds.has(slot.id)) {
      errors.push("Vị trí đang có container khác chiếm chỗ.")
    }
  }

  let resolvedStatus: ResolvedContainerMutationInput["currentStatus"] = "new"
  let resolvedPortId: string | null = explicitPort?.id ?? null

  if (yard) {
    const yardPort = context.ports.find((port) => port.id === yard.portId) ?? null

    if (!yardPort || !yardPort.isActive) {
      errors.push("Port của yard không hợp lệ.")
    } else {
      resolvedPortId = yardPort.id
      resolvedStatus =
        yardPort.portType === "seaport" ? "at_seaport_yard" : "at_dryport_yard"

      if (explicitPort && explicitPort.id !== yardPort.id) {
        // errors.push("Current_port_code phải khớp với port của yard.")
      }
    }
  } else if (row.data.statusHint) {
    switch (row.data.statusHint) {
      case "yard":
        if (!explicitPort || !explicitPort.isActive) {
          // Nới lỏng: Nếu không có cảng hợp lệ, vẫn cho phép ở trạng thái yard (mặc định seaport)
          resolvedStatus = "at_seaport_yard"
          // errors.push("Status_hint `yard` cần current_port_code hợp lệ.")
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
        errors.push("Status_hint không hợp lệ.")
        break
    }
  }

  // Tiện ích parse boolean
  const parseBool = (val: string | null | undefined) => {
    if (!val) return null
    const v = val.toLowerCase()
    return v === "true" || v === "yes" || v === "y" || v === "o" || v === "1"
  }

  const resolved =
    errors.length === 0 && containerNo && containerType
      ? {
          containerNo,
          containerTypeId: containerType.id,
          customerId: customer?.id ?? null,
          routeId: route?.id ?? null,
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
          // Gán các trường mới
          category: row.data.category,
          vState: row.data.vState,
          tState: row.data.tState,
          stow: row.data.stow,
          grp: row.data.grp,
          sealNo2: row.data.sealNo2,
          frghtKind: row.data.frghtKind,
          obActualVisit: row.data.obActualVisit,
          reqsPower: parseBool(row.data.reqsPower),
          tempRequiredC: row.data.tempRequiredC,
          rlh: row.data.rlh,
          rdh: row.data.rdh,
          isOog: parseBool(row.data.isOog),
          imdg: row.data.imdg,
          hazardous: parseBool(row.data.hazardous),
        }
      : null

  return {
    ...row,
    errors,
    warnings,
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
