import { randomUUID } from "node:crypto"
import type { Prisma } from "../generated/prisma/client.ts"

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
    note: input.note,
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
          ? "Container duoc tao thu cong."
          : "Container duoc nhap tu batch EDI.",
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
      description: "Container da vao bai.",
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

function toJsonValue(row: ParsedContainerImportRow["rawData"]) {
  return row as Prisma.InputJsonValue
}

async function getPrismaClient() {
  const module = await import("../prisma.ts")
  return module.default
}

export async function persistManualContainer(
  input: ResolvedContainerMutationInput,
  options: {
    actorUserId: string
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
    uploadedBy: string
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
        uploadedBy: options.uploadedBy,
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
        data: rows.map((row) => ({
          batchId: batch.id,
          rowNo: row.rowNo,
          rawData: toJsonValue(row.rawData),
          containerNo: row.data.containerNo,
          validationStatus: row.isValid ? "valid" : "invalid",
          importStatus: "rejected",
          errorMessage: row.errors.join(" | ") || options.note || "Batch rejected.",
        })),
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
    uploadedBy: string
    note?: string | null
  },
) {
  if (rows.some((row) => !row.isValid || !row.resolved)) {
    throw new Error("Cannot import rows that still contain validation errors.")
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
        uploadedBy: options.uploadedBy,
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
        data: {
          batchId: batch.id,
          rowNo: row.rowNo,
          rawData: toJsonValue(row.rawData),
          containerNo: row.data.containerNo,
          validationStatus: "valid",
          importStatus: "imported",
          errorMessage: null,
          importedContainerId: container.id,
        },
      })
    }
    return {
      batchId: batch.id,
      batchNo: batch.batchNo,
      importedCount: rows.length,
    }
  })
}
