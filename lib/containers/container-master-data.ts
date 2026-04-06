import { getOptionalPrismaClient } from "@/lib/prisma"
import type {
  ContainerImportValidationContext,
  ContainerWorkflowStatus,
} from "@/lib/containers/container-mutation-types"

export type ContainerWorkflowReferenceData = {
  containerTypes: Array<{
    id: string
    code: string
    name: string
    isActive: boolean
  }>
  customers: Array<{
    id: string
    code: string
    name: string
    isActive: boolean
  }>
  shippingLines: Array<{
    id: string
    code: string
    name: string
    isActive: boolean
  }>
  routes: Array<{
    id: string
    code: string
    name: string
    isActive: boolean
    originPortId: string
    destinationPortId: string
    originPortCode: string
    originPortName: string
    destinationPortCode: string
    destinationPortName: string
  }>
  ports: Array<{
    id: string
    code: string
    name: string
    portType: "seaport" | "dryport"
    isActive: boolean
  }>
  yards: Array<{
    id: string
    code: string
    name: string
    portId: string
    portCode: string
    portName: string
    portType: "seaport" | "dryport"
    isActive: boolean
  }>
  blocks: Array<{
    id: string
    code: string
    name: string
    yardId: string
    yardCode: string
    isActive: boolean
  }>
  slots: Array<{
    id: string
    code: string
    blockId: string
    blockCode: string
    yardId: string
    yardCode: string
    isActive: boolean
  }>
  existingContainerNos: string[]
  occupiedSlotIds: string[]
  occupiedSlotCodes: string[]
}

export type ContainerFormOptions = {
  containerTypes: Array<{ value: string; label: string }>
  customers: Array<{ value: string; label: string }>
  shippingLines: Array<{ value: string; label: string }>
  routes: Array<{ value: string; label: string }>
  ports: Array<{
    value: string
    label: string
    portType: "seaport" | "dryport"
  }>
  yards: Array<{
    value: string
    label: string
    portCode: string
    portType: "seaport" | "dryport"
  }>
  blocks: Array<{
    value: string
    label: string
    yardCode: string
  }>
  slots: Array<{
    value: string
    label: string
    yardCode: string
    blockCode: string
  }>
  occupiedSlotCodes: string[]
}

export async function getContainerWorkflowReferenceData(): Promise<ContainerWorkflowReferenceData> {
  const prisma = getOptionalPrismaClient()

  if (!prisma) {
    return {
      containerTypes: [],
      customers: [],
      shippingLines: [],
      routes: [],
      ports: [],
      yards: [],
      blocks: [],
      slots: [],
      existingContainerNos: [],
      occupiedSlotIds: [],
      occupiedSlotCodes: [],
    }
  }

  const [
    containerTypes,
    customers,
    shippingLines,
    routes,
    ports,
    yards,
    blocks,
    slots,
    containers,
  ] = await Promise.all([
    prisma.containerType.findMany({
      where: { isActive: true },
      orderBy: [{ code: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
      },
    }),
    prisma.customer.findMany({
      where: { isActive: true },
      orderBy: [{ code: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
      },
    }),
    prisma.shippingLine.findMany({
      where: { isActive: true },
      orderBy: [{ code: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
      },
    }),
    prisma.route.findMany({
      where: { isActive: true },
      orderBy: [{ code: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        isActive: true,
        originPortId: true,
        destinationPortId: true,
        originPort: {
          select: {
            code: true,
            name: true,
          },
        },
        destinationPort: {
          select: {
            code: true,
            name: true,
          },
        },
      },
    }),
    prisma.port.findMany({
      where: { isActive: true },
      orderBy: [{ code: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        portType: true,
        isActive: true,
      },
    }),
    prisma.yard.findMany({
      where: { isActive: true, port: { isActive: true } },
      orderBy: [{ port: { code: "asc" } }, { code: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        portId: true,
        isActive: true,
        port: {
          select: {
            code: true,
            name: true,
            portType: true,
          },
        },
      },
    }),
    prisma.yardBlock.findMany({
      where: { isActive: true, yard: { isActive: true } },
      orderBy: [{ yard: { code: "asc" } }, { code: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        yardId: true,
        isActive: true,
        yard: {
          select: {
            code: true,
          },
        },
      },
    }),
    prisma.yardSlot.findMany({
      where: { isActive: true, block: { isActive: true, yard: { isActive: true } } },
      orderBy: [{ block: { yard: { code: "asc" } } }, { block: { code: "asc" } }, { code: "asc" }],
      select: {
        id: true,
        code: true,
        blockId: true,
        isActive: true,
        block: {
          select: {
            code: true,
            yardId: true,
            yard: {
              select: {
                code: true,
              },
            },
          },
        },
      },
    }),
    prisma.container.findMany({
      where: {
        OR: [
          { currentSlotId: { not: null } },
          { containerNo: { not: "" } },
        ],
      },
      select: {
        containerNo: true,
        currentSlotId: true,
        currentSlot: {
          select: {
            code: true,
          },
        },
      },
    }),
  ])

  return {
    containerTypes,
    customers,
    shippingLines,
    routes: routes.map((route) => ({
      id: route.id,
      code: route.code,
      name: route.name,
      isActive: route.isActive,
      originPortId: route.originPortId,
      destinationPortId: route.destinationPortId,
      originPortCode: route.originPort.code,
      originPortName: route.originPort.name,
      destinationPortCode: route.destinationPort.code,
      destinationPortName: route.destinationPort.name,
    })),
    ports: ports.map((port) => ({
      ...port,
      portType: port.portType as "seaport" | "dryport",
    })),
    yards: yards.map((yard) => ({
      id: yard.id,
      code: yard.code,
      name: yard.name,
      portId: yard.portId,
      portCode: yard.port.code,
      portName: yard.port.name,
      portType: yard.port.portType as "seaport" | "dryport",
      isActive: yard.isActive,
    })),
    blocks: blocks.map((block) => ({
      id: block.id,
      code: block.code,
      name: block.name,
      yardId: block.yardId,
      yardCode: block.yard.code,
      isActive: block.isActive,
    })),
    slots: slots.map((slot) => ({
      id: slot.id,
      code: slot.code,
      blockId: slot.blockId,
      blockCode: slot.block.code,
      yardId: slot.block.yardId,
      yardCode: slot.block.yard.code,
      isActive: slot.isActive,
    })),
    existingContainerNos: containers.map((container) => container.containerNo.toUpperCase()),
    occupiedSlotIds: containers
      .flatMap((container) => (container.currentSlotId ? [container.currentSlotId] : [])),
    occupiedSlotCodes: containers
      .flatMap((container) => (container.currentSlot?.code ? [container.currentSlot.code] : [])),
  }
}

export function toContainerImportValidationContext(
  referenceData: ContainerWorkflowReferenceData,
): ContainerImportValidationContext {
  return {
    containerTypes: referenceData.containerTypes.map((item) => ({
      id: item.id,
      code: item.code,
      isActive: item.isActive,
    })),
    customers: referenceData.customers.map((item) => ({
      id: item.id,
      code: item.code,
      isActive: item.isActive,
    })),
    shippingLines: referenceData.shippingLines.map((item) => ({
      id: item.id,
      code: item.code,
      isActive: item.isActive,
    })),
    routes: referenceData.routes.map((item) => ({
      id: item.id,
      code: item.code,
      isActive: item.isActive,
      originPortId: item.originPortId,
      destinationPortId: item.destinationPortId,
    })),
    ports: referenceData.ports.map((item) => ({
      id: item.id,
      code: item.code,
      portType: item.portType,
      isActive: item.isActive,
    })),
    yards: referenceData.yards.map((item) => ({
      id: item.id,
      code: item.code,
      portId: item.portId,
      isActive: item.isActive,
    })),
    blocks: referenceData.blocks.map((item) => ({
      id: item.id,
      code: item.code,
      yardId: item.yardId,
      isActive: item.isActive,
    })),
    slots: referenceData.slots.map((item) => ({
      id: item.id,
      code: item.code,
      blockId: item.blockId,
      isActive: item.isActive,
    })),
    existingContainerNos: referenceData.existingContainerNos,
    occupiedSlotIds: referenceData.occupiedSlotIds,
  }
}

export async function getContainerFormOptions(): Promise<ContainerFormOptions> {
  const referenceData = await getContainerWorkflowReferenceData()

  return {
    containerTypes: referenceData.containerTypes.map((item) => ({
      value: item.code,
      label: `${item.code} - ${item.name}`,
    })),
    customers: referenceData.customers.map((item) => ({
      value: item.code,
      label: `${item.code} - ${item.name}`,
    })),
    shippingLines: referenceData.shippingLines.map((item) => ({
      value: item.code,
      label: `${item.code} - ${item.name}`,
    })),
    routes: referenceData.routes.map((item) => ({
      value: item.code,
      label: `${item.code} - ${item.originPortName} -> ${item.destinationPortName}`,
    })),
    ports: referenceData.ports.map((item) => ({
      value: item.code,
      label: `${item.code} - ${item.name}`,
      portType: item.portType,
    })),
    yards: referenceData.yards.map((item) => ({
      value: item.code,
      label: `${item.code} - ${item.name} (${item.portName})`,
      portCode: item.portCode,
      portType: item.portType,
    })),
    blocks: referenceData.blocks.map((item) => ({
      value: item.code,
      label: `${item.code} - ${item.name}`,
      yardCode: item.yardCode,
    })),
    slots: referenceData.slots.map((item) => ({
      value: item.code,
      label: item.code,
      yardCode: item.yardCode,
      blockCode: item.blockCode,
    })),
    occupiedSlotCodes: referenceData.occupiedSlotCodes,
  }
}

export function getStatusLabel(status: ContainerWorkflowStatus) {
  switch (status) {
    case "at_seaport_yard":
      return "Tại bãi cảng biển"
    case "at_dryport_yard":
      return "Tại bãi cảng cạn"
    case "on_barge":
      return "Đã xếp lên sà lan"
    case "in_transit":
      return "Đang hành trình"
    case "released":
      return "Đã giải phóng"
    case "hold":
      return "Đang giữ"
    case "new":
    default:
      return "Mới tạo"
  }
}

