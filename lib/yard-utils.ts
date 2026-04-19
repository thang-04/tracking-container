import type { Container, ExportContainer, ExportVessel, Stack, YardBlock } from "@/lib/yard-types"

export interface BlockStats {
  totalCapacity: number
  usedCapacity: number
  emptySlots: number
  occupancyRate: number
}

export interface YardStats {
  totalCapacity: number
  usedCapacity: number
  emptySlots: number
  occupancyRate: number
}

export function getBlockStats(block: YardBlock): BlockStats {
  const totalCapacity = block.bays * block.rows * block.maxTiers
  let usedCapacity = 0

  for (const stack of block.stacks) {
    for (const tier of stack.tiers) {
      if (tier.container) {
        usedCapacity += 1
      }
    }
  }

  return {
    totalCapacity,
    usedCapacity,
    emptySlots: Math.max(0, totalCapacity - usedCapacity),
    occupancyRate: totalCapacity === 0 ? 0 : Math.round((usedCapacity / totalCapacity) * 100),
  }
}

export function getYardStats(blocks: YardBlock[]): YardStats {
  let totalCapacity = 0
  let usedCapacity = 0

  for (const block of blocks) {
    const stats = getBlockStats(block)
    totalCapacity += stats.totalCapacity
    usedCapacity += stats.usedCapacity
  }

  return {
    totalCapacity,
    usedCapacity,
    emptySlots: Math.max(0, totalCapacity - usedCapacity),
    occupancyRate: totalCapacity === 0 ? 0 : Math.round((usedCapacity / totalCapacity) * 100),
  }
}

export function findContainerInBlocks(
  blocks: YardBlock[],
  query: string,
): { block: YardBlock; stack: Stack; tier: number; container: Container } | null {
  const searchQuery = query.trim().toLowerCase()

  if (!searchQuery) {
    return null
  }

  for (const block of blocks) {
    for (const stack of block.stacks) {
      for (const tierSlot of stack.tiers) {
        if (!tierSlot.container) {
          continue
        }

        const container = tierSlot.container
        if (
          container.id.toLowerCase().includes(searchQuery) ||
          container.containerNo.toLowerCase().includes(searchQuery)
        ) {
          return {
            block,
            stack,
            tier: tierSlot.tier,
            container,
          }
        }
      }
    }
  }

  return null
}

export function getExportContainersByPOD(vessel: ExportVessel): Record<string, ExportContainer[]> {
  const grouped: Record<string, ExportContainer[]> = {}

  for (const container of vessel.containers) {
    const pod = container.pod || "UNKNOWN"
    if (!grouped[pod]) {
      grouped[pod] = []
    }
    grouped[pod].push(container)
  }

  for (const pod of Object.keys(grouped)) {
    grouped[pod].sort((a, b) => a.loadSequence - b.loadSequence)
  }

  return grouped
}

export interface ExportStackPlan {
  block: string
  bay: number
  row: number
  containers: Array<{
    tier: number
    container: ExportContainer
    loadFirst: boolean
  }>
  totalRehandle: number
  isValid: boolean
  warnings: string[]
}

export function planExportStacking(
  containers: ExportContainer[],
  blockId: string = "B01",
  startBay: number = 1,
  startRow: number = 1,
  maxTiers: number = 5,
): ExportStackPlan[] {
  const plans: ExportStackPlan[] = []

  const sorted = [...containers].sort((a, b) => a.loadSequence - b.loadSequence)

  let currentBay = startBay
  let currentRow = startRow
  let currentStack: ExportStackPlan = {
    block: blockId,
    bay: currentBay,
    row: currentRow,
    containers: [],
    totalRehandle: 0,
    isValid: true,
    warnings: [],
  }

  for (let i = 0; i < sorted.length; i += 1) {
    const container = sorted[i]
    const tierFromTop = (i % maxTiers) + 1
    const actualTier = maxTiers - tierFromTop + 1

    if (tierFromTop === 1 && i > 0) {
      plans.push(currentStack)
      currentRow += 1
      if (currentRow > 6) {
        currentRow = 1
        currentBay += 1
      }
      currentStack = {
        block: blockId,
        bay: currentBay,
        row: currentRow,
        containers: [],
        totalRehandle: 0,
        isValid: true,
        warnings: [],
      }
    }

    currentStack.containers.push({
      tier: actualTier,
      container,
      loadFirst: container.loadSequence <= 3,
    })

    if (currentStack.containers.length > 1) {
      const previous = currentStack.containers[currentStack.containers.length - 2]
      const currentWeight = container.weight ?? 0
      const previousWeight = previous.container.weight ?? 0

      if (previousWeight > 0 && currentWeight > previousWeight * 1.2) {
        currentStack.warnings.push(
          `Trọng lượng: ${container.containerNo} nặng hơn container bên dưới`,
        )
      }
    }
  }

  if (currentStack.containers.length > 0) {
    plans.push(currentStack)
  }

  for (const plan of plans) {
    plan.containers.sort((a, b) => b.tier - a.tier)
  }

  return plans
}
