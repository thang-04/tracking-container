import {
  CONTAINER_IMPORT_HEADERS,
  CONTAINER_IMPORT_REQUIRED_HEADERS,
  type CanonicalContainerImportRow,
  type ContainerImportHeader,
  type ContainerImportValidationContext,
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
