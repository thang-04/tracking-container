import { randomUUID } from "node:crypto"
import type { Prisma } from "../generated/prisma/client.ts"

import {
  fromContainerImportPreviewStorageRow,
  toContainerImportPreviewStorageRow,
} from "./container-import-preview.ts"
import {
  getContainerWorkflowReferenceData,
  toContainerImportValidationContext,
} from "./container-master-data.ts"
import {
  validateContainerImportRows,
  resolveContainerImportRow,
} from "./container-import.ts"
import type {
  ContainerMutationSource,
  ParsedContainerImportRow,
  ResolvedContainerMutationInput,
  ValidatedContainerImportRow,
} from "./container-mutation-types.ts"

export function buildContainerMutationPlan(
  input: ResolvedContainerMutationInput,
  options: {
    mutationSource: ContainerMutationSource
    actorUserId: string | null
    now: Date
    ediBatchId?: string
  },
) {
  const eventSourceType = (options.mutationSource === "manual" ? "user" : "edi") as
    | "user"
    | "edi"

  const container = {
    containerNo: input.containerNo,
    containerTypeId: input.containerTypeId,
    customerId: input.customerId,
    routeId: input.routeId,
    shippingLineId: input.shippingLineId,
    currentStatus: input.currentStatus,
    customsStatus: input.customsStatus,
    currentPortId: input.currentPortId,
    currentYardId: input.currentYardId,
    currentBlockId: input.currentBlockId,
    currentSlotId: input.currentSlotId,
    eta: input.eta,
    grossWeightKg: input.grossWeightKg,
    billNo: input.billNo,
    sealNo: input.sealNo,
    sealNo2: input.sealNo2,
    note: input.note,
    // Các trường mới từ 7 nhóm dữ liệu
    category: input.category,
    vState: input.vState,
    tState: input.tState,
    stow: input.stow,
    grp: input.grp,
    frghtKind: input.frghtKind,
    obActualVisit: input.obActualVisit,
    reqsPower: input.reqsPower,
    tempRequiredC: input.tempRequiredC,
    rlh: input.rlh,
    rdh: input.rdh,
    isOog: input.isOog,
    imdg: input.imdg,
    hazardous: input.hazardous,
    sourceType: options.mutationSource,
    ediBatchId: options.ediBatchId ?? null,
    lastEventAt: options.now,
  }

  const events: Array<{
    eventType: "created" | "edi_imported" | "yard_in"
    eventTime: Date
    fromStatus: ResolvedContainerMutationInput["currentStatus"] | null
    toStatus: ResolvedContainerMutationInput["currentStatus"] | null
    fromSlotId: string | null
    toSlotId: string | null
    voyageId: string | null
    description: string
    sourceType: "user" | "edi"
    actorUserId: string | null
    metadata: Prisma.InputJsonValue | null
  }> = [
    {
      eventType: options.mutationSource === "manual" ? "created" : "edi_imported",
      eventTime: options.now,
      fromStatus: null,
      toStatus: "new" as const,
      fromSlotId: null,
      toSlotId: null,
      voyageId: null,
      description:
        options.mutationSource === "manual"
          ? "Container được tạo thủ công."
          : "Container được nhập từ batch EDI.",
      sourceType: eventSourceType,
      actorUserId: options.actorUserId,
      metadata: null,
    },
  ]

  if (input.currentYardId && input.currentBlockId && input.currentSlotId) {
    events.push({
      eventType: "yard_in" as const,
      eventTime: options.now,
      fromStatus: "new" as const,
      toStatus: input.currentStatus,
      fromSlotId: null,
      toSlotId: input.currentSlotId,
      voyageId: null,
      description: "Container đã vào bãi.",
      sourceType: eventSourceType,
      actorUserId: options.actorUserId,
      metadata: null,
    })
  }

  return {
    container,
    events,
  }
}

function buildBatchIdentity(input: {
  sourceMode: "csv" | "edi"
  fileName: string
  now: Date
}) {
  const stamp = input.now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)
  const suffix = randomUUID().slice(0, 8).toUpperCase()

  return {
    batchNo: `EDI-${stamp}-${suffix}`,
    fileName: input.fileName,
    filePath: `mvp-imports/${input.sourceMode}/${stamp}-${suffix}-${input.fileName}`,
  }
}

function normalizeNullableUuid(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const normalized = value.trim()
  const isUuidLike = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    normalized,
  )

  return isUuidLike ? normalized : null
}

function buildPreviewBatchIdentity(input: {
  sourceMode: "csv" | "edi"
  fileName: string
  now: Date
}) {
  const stamp = input.now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)
  const suffix = randomUUID().slice(0, 8).toUpperCase()

  return {
    batchNo: `PREVIEW-${stamp}-${suffix}`,
    fileName: input.fileName,
    filePath: `preview-imports/${input.sourceMode}/${stamp}-${suffix}-${input.fileName}`,
  }
}

function toJsonValue(row: ParsedContainerImportRow["rawData"]) {
  return row as Prisma.InputJsonValue
}


export function buildEdiBatchRowCreateData(
  row: ParsedContainerImportRow | ValidatedContainerImportRow,
  options: {
    batchId: string
    validationStatus: Prisma.EdiBatchRowCreateManyInput["validationStatus"]
    importStatus: Prisma.EdiBatchRowCreateManyInput["importStatus"]
    errorMessage: string | null
    importedContainerId?: string | null
  },
): Prisma.EdiBatchRowCreateManyInput {
  return {
    batchId: options.batchId,
    rowNo: row.rowNo,
    rawData: toJsonValue(row.rawData),
    containerNo: row.data.containerNo,
    validationStatus: options.validationStatus,
    importStatus: options.importStatus,
    errorMessage: options.errorMessage,
    importedContainerId: options.importedContainerId ?? null,
  }
}
async function getPrismaClient() {
  const module = await import("../prisma.ts")
  return module.default
}

export async function persistManualContainer(
  input: ResolvedContainerMutationInput,
  options: {
    actorUserId: string | null
  },
) {
  const prisma = await getPrismaClient()

  return prisma.$transaction(async (tx) => {
    const now = new Date()
    const plan = buildContainerMutationPlan(input, {
      mutationSource: "manual",
      actorUserId: options.actorUserId,
      now,
    })

    const container = await tx.container.create({
      data: plan.container,
      select: {
        id: true,
        containerNo: true,
      },
    })

    await tx.containerEvent.createMany({
      data: plan.events.map((event) => ({
        ...event,
        containerId: container.id,
      })) as Prisma.ContainerEventCreateManyInput[],
    })
    return container
  })
}

export async function persistRejectedContainerImportBatch(
  rows: ValidatedContainerImportRow[],
  options: {
    sourceMode: "csv" | "edi"
    fileName: string
    uploadedBy: string | null
    note?: string | null
  },
) {
  const now = new Date()
  const batchIdentity = buildBatchIdentity({
    sourceMode: options.sourceMode,
    fileName: options.fileName,
    now,
  })

  const prisma = await getPrismaClient()

  return prisma.$transaction(async (tx) => {
    const batch = await tx.ediBatch.create({
      data: {
        ...batchIdentity,
        status: "rejected",
        totalRows: rows.length,
        successRows: 0,
        errorRows: rows.length,
        uploadedBy: normalizeNullableUuid(options.uploadedBy),
        uploadedAt: now,
        processedAt: now,
        note: options.note ?? null,
      },
      select: {
        id: true,
        batchNo: true,
      },
    })

    if (rows.length > 0) {
      await tx.ediBatchRow.createMany({
        data: rows.map((row) =>
          buildEdiBatchRowCreateData(row, {
            batchId: batch.id,
            validationStatus: row.isValid ? "valid" : "invalid",
            importStatus: "rejected",
            errorMessage: row.errors.join(" | ") || options.note || "Batch bị từ chối.",
          }),
        ),
      })
    }
    return batch
  })
}

export async function persistImportedContainerBatch(
  rows: ValidatedContainerImportRow[],
  options: {
    sourceMode: "csv" | "edi"
    fileName: string
    uploadedBy: string | null
    note?: string | null
  },
) {
  if (rows.some((row) => !row.isValid || !row.resolved)) {
    throw new Error("Không thể nhập các dòng vẫn còn lỗi kiểm tra.")
  }

  const now = new Date()
  const batchIdentity = buildBatchIdentity({
    sourceMode: options.sourceMode,
    fileName: options.fileName,
    now,
  })

  const prisma = await getPrismaClient()

  return prisma.$transaction(async (tx) => {
    const batch = await tx.ediBatch.create({
      data: {
        ...batchIdentity,
        status: "imported",
        totalRows: rows.length,
        successRows: rows.length,
        errorRows: 0,
        uploadedBy: normalizeNullableUuid(options.uploadedBy),
        uploadedAt: now,
        processedAt: now,
        note: options.note ?? null,
      },
      select: {
        id: true,
        batchNo: true,
      },
    })

    for (const row of rows) {
      const plan = buildContainerMutationPlan(row.resolved!, {
        mutationSource: "edi",
        actorUserId: options.uploadedBy,
        now,
        ediBatchId: batch.id,
      })

      const container = await tx.container.create({
        data: plan.container,
        select: {
          id: true,
        },
      })

      await tx.containerEvent.createMany({
        data: plan.events.map((event) => ({
          ...event,
          containerId: container.id,
        })) as Prisma.ContainerEventCreateManyInput[],
      })

      await tx.ediBatchRow.create({
        data: buildEdiBatchRowCreateData(row, {
          batchId: batch.id,
          validationStatus: "valid",
          importStatus: "imported",
          errorMessage: null,
          importedContainerId: container.id,
        }),
      })
    }
    return {
      batchId: batch.id,
      batchNo: batch.batchNo,
      importedCount: rows.length,
    }
  })
}

export async function persistContainerImportPreviewBatch(
  rows: ValidatedContainerImportRow[],
  options: {
    sourceMode: "csv" | "edi"
    fileName: string
    uploadedBy: string | null
    note?: string | null
  },
) {
  const now = new Date()
  const batchIdentity = buildPreviewBatchIdentity({
    sourceMode: options.sourceMode,
    fileName: options.fileName,
    now,
  })
  const validRows = rows.filter((row) => row.isValid).length
  const invalidRows = rows.length - validRows
  const prisma = await getPrismaClient()

  return prisma.$transaction(async (tx) => {
    const batch = await tx.ediBatch.create({
      data: {
        ...batchIdentity,
        status: "validated",
        totalRows: rows.length,
        successRows: validRows,
        errorRows: invalidRows,
        uploadedBy: normalizeNullableUuid(options.uploadedBy),
        uploadedAt: now,
        processedAt: now,
        note: options.note ?? null,
      },
      select: {
        id: true,
        batchNo: true,
      },
    })

    if (rows.length > 0) {
      await tx.ediBatchRow.createMany({
        data: rows.map((row) =>
          buildEdiBatchRowCreateData(
            {
              ...row,
              rawData: toContainerImportPreviewStorageRow(row).rawData,
            },
            {
              batchId: batch.id,
              validationStatus: row.isValid ? "valid" : "invalid",
              importStatus: "pending",
              errorMessage: row.errors.join(" | ") || null,
              importedContainerId: null,
            },
          ),
        ),
      })
    }

    return batch
  })
}

export async function getContainerImportPreviewBatch(batchId: string) {
  const prisma = await getPrismaClient()

  console.log(`[DEBUG] Fetching import preview batch: ${batchId}`)
  const batch = await prisma.ediBatch.findUnique({
    where: {
      id: batchId,
    },
    include: {
      rows: {
        orderBy: {
          rowNo: "asc",
        },
      },
    },
  })

  if (!batch) {
    console.log(`[DEBUG] Batch not found: ${batchId}`)
    return null
  }

  console.log(`[DEBUG] Found batch: ${batch.batchNo}, rows count: ${batch.rows.length}`)

  const sourceMode = batch.filePath.includes("/edi/") ? "edi" : "csv"
  const referenceData = await getContainerWorkflowReferenceData()
  const validationContext = toContainerImportValidationContext(referenceData)

  return {
    batch: {
      id: batch.id,
      batchNo: batch.batchNo,
      fileName: batch.fileName,
      filePath: batch.filePath,
      sourceMode,
      status: batch.status,
      totalRows: batch.totalRows,
      successRows: batch.successRows,
      errorRows: batch.errorRows,
      uploadedAt: batch.uploadedAt?.toISOString() ?? new Date().toISOString(),
      processedAt: batch.processedAt?.toISOString() ?? null,
      note: batch.note,
    },
    rows: batch.rows.map((row) => {
      const previewRow = fromContainerImportPreviewStorageRow({
        rowNo: row.rowNo,
        rawData: row.rawData as Record<string, string | null>,
      })

      // Tái xác thực để lấy warnings mới nhất dựa trên Master Data hiện tại
      const rowValidation = resolveContainerImportRow(
        previewRow,
        validationContext,
        new Set(),
        new Set(),
        new Set()
      )

      return {
        id: row.id,
        rowNo: row.rowNo,
        containerNo: previewRow.data.containerNo,
        containerTypeCode: previewRow.data.containerTypeCode,
        customerCode: previewRow.data.customerCode,
        routeCode: previewRow.data.routeCode,
        shippingLineCode: previewRow.data.shippingLineCode,
        grossWeightKg: previewRow.data.grossWeightKg,
        eta: previewRow.data.eta,
        billNo: previewRow.data.billNo,
        sealNo: previewRow.data.sealNo,
        currentPortCode: previewRow.data.currentPortCode,
        currentYardCode: previewRow.data.currentYardCode,
        currentBlockCode: previewRow.data.currentBlockCode,
        currentSlotCode: previewRow.data.currentSlotCode,
        statusHint: previewRow.data.statusHint,
        note: previewRow.data.note,
        category: previewRow.data.category,
        vState: previewRow.data.vState,
        tState: previewRow.data.tState,
        stow: previewRow.data.stow,
        grp: previewRow.data.grp,
        sealNo2: previewRow.data.sealNo2,
        frghtKind: previewRow.data.frghtKind,
        ibActualVisit: previewRow.data.ibActualVisit,
        obActualVisit: previewRow.data.obActualVisit,
        reqsPower: rowValidation.resolved?.reqsPower ?? null,
        tempRequiredC: previewRow.data.tempRequiredC,
        rlh: previewRow.data.rlh,
        rdh: previewRow.data.rdh,
        isOog: rowValidation.resolved?.isOog ?? null,
        imdg: previewRow.data.imdg,
        hazardous: rowValidation.resolved?.hazardous ?? null,
        isValid: rowValidation.isValid,
        errors: rowValidation.errors,
        warnings: rowValidation.warnings,
        importedContainerId: row.importedContainerId,
      }
    }),
  }
}

export async function importContainerImportPreviewBatch(
  batchId: string,
  options: {
    uploadedBy: string | null
  },
) {
  const now = new Date()
  const prisma = await getPrismaClient()

  const batch = await prisma.ediBatch.findUnique({
    where: {
      id: batchId,
    },
    include: {
      rows: {
        orderBy: {
          rowNo: "asc",
        },
      },
    },
  })

  if (!batch) {
    throw new Error("Không tìm thấy bản xem trước import.")
  }

  if (batch.status === "imported") {
    throw new Error("Bản xem trước này đã được nhập rồi.")
  }

  const previewRows = batch.rows.map((row) =>
    fromContainerImportPreviewStorageRow({
      rowNo: row.rowNo,
      rawData: row.rawData as Record<string, string | null>,
    }),
  )
  const referenceData = await getContainerWorkflowReferenceData()
  const validationContext = toContainerImportValidationContext(referenceData)
  const validation = validateContainerImportRows(previewRows, validationContext)

  // Cho phép nhập một phần nếu có ít nhất 1 dòng hợp lệ
  if (validation.summary.validRows === 0) {
    throw new Error("Không có dòng nào hợp lệ để nhập.")
  }

  return prisma.$transaction(async (tx) => {
    const updatedBatch = await tx.ediBatch.update({
      where: {
        id: batch.id,
      },
      data: {
        status: validation.summary.invalidRows > 0 ? "partial" : "imported",
        successRows: validation.summary.validRows,
        errorRows: validation.summary.invalidRows,
        processedAt: now,
      },
      select: {
        id: true,
        batchNo: true,
      },
    })

    // 1. Tự động tạo Master Data thiếu
    const missingTypes = new Set<string>()
    const missingPorts = new Set<string>()
    const missingLines = new Set<string>()
    const missingCustomers = new Set<string>()

    validation.rows.forEach((row) => {
      if (!row.isValid) return // Chỉ tạo MD cho dòng hợp lệ

      if (row.data.containerTypeCode && !row.resolved?.containerTypeId) {
        missingTypes.add(row.data.containerTypeCode)
      }
      if (row.data.currentPortCode && !row.resolved?.currentPortId) {
        missingPorts.add(row.data.currentPortCode)
      }
      if (row.data.shippingLineCode && !row.resolved?.shippingLineId) {
        missingLines.add(row.data.shippingLineCode)
      }
      if (row.data.customerCode && !row.resolved?.customerId) {
        missingCustomers.add(row.data.customerCode)
      }
    })

    // Upsert Master Data
    for (const code of missingTypes) {
      await tx.containerType.upsert({
        where: { code },
        update: {},
        create: { code, name: code, isActive: true },
      })
    }
    for (const code of missingPorts) {
      await tx.port.upsert({
        where: { code },
        update: {},
        create: { code, name: code, portType: "seaport", isActive: true },
      })
    }
    for (const code of missingLines) {
      await tx.shippingLine.upsert({
        where: { code },
        update: {},
        create: { code, name: code, isActive: true },
      })
    }
    for (const code of missingCustomers) {
      await tx.customer.upsert({
        where: { code },
        update: {},
        create: { code, name: code, isActive: true },
      })
    }

    // 2. Tái nạp Context để lấy ID mới
    const typeMap = new Map((await tx.containerType.findMany({ select: { id: true, code: true } })).map(x => [x.code, x.id]))
    const portMap = new Map((await tx.port.findMany({ select: { id: true, code: true } })).map(x => [x.code, x.id]))
    const lineMap = new Map((await tx.shippingLine.findMany({ select: { id: true, code: true } })).map(x => [x.code, x.id]))
    const custMap = new Map((await tx.customer.findMany({ select: { id: true, code: true } })).map(x => [x.code, x.id]))

    for (const [index, row] of validation.rows.entries()) {
      const batchRow = batch.rows[index]
      if (!batchRow) {
        throw new Error("Bản xem trước không đồng bộ với hàng import.")
      }

      if (!row.resolved || !row.isValid) {
        await tx.ediBatchRow.update({
          where: { id: batchRow.id },
          data: {
            validationStatus: "invalid",
            importStatus: "rejected",
            errorMessage: row.errors.join(" | ") || "Lỗi không xác định",
          },
        })
        continue
      }

      // Cập nhật IDs vừa được tạo (hoặc đã có)
      if (row.data.containerTypeCode) row.resolved.containerTypeId = typeMap.get(row.data.containerTypeCode) ?? null
      if (row.data.currentPortCode) row.resolved.currentPortId = portMap.get(row.data.currentPortCode) ?? null
      if (row.data.shippingLineCode) row.resolved.shippingLineId = lineMap.get(row.data.shippingLineCode) ?? null
      if (row.data.customerCode) row.resolved.customerId = custMap.get(row.data.customerCode) ?? null

      const plan = buildContainerMutationPlan(row.resolved, {
        mutationSource: "edi",
        actorUserId: normalizeNullableUuid(options.uploadedBy),
        now,
        ediBatchId: batch.id,
      })

      const container = await tx.container.create({
        data: plan.container,
        select: { id: true },
      })

      await tx.containerEvent.createMany({
        data: plan.events.map((event) => ({
          ...event,
          containerId: container.id,
        })) as Prisma.ContainerEventCreateManyInput[],
      })

      await tx.ediBatchRow.update({
        where: {
          id: batchRow.id,
        },
        data: {
          validationStatus: "valid",
          importStatus: "imported",
          errorMessage: null,
          importedContainerId: container.id,
        },
      })
    }

    return {
      batchId: updatedBatch.id,
      batchNo: updatedBatch.batchNo,
      importedCount: validation.summary.validRows,
    }
  }, { maxWait: 15000, timeout: 120000 })
}
