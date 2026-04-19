import type { YardBlock, Stack, Container, ContainerStatus, DischargeStatus, Vessel, SpecialType, TierSlot, ExportVessel, ExportContainer } from "./yard-types"

// =============================================
// HARDCODED YARD DATA - No random generation
// This ensures SSR/client hydration consistency
// =============================================

// Fixed containers database - simulates real yard data
const containerDatabase: Container[] = [
  // Block A01 containers
  { id: "A01-1", containerNo: "MSKU1234567", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 5, tripId: "BT-2024-0101", weight: 18500, etd: new Date("2024-06-20"), destination: "Singapore", pod: "SGSIN", specialType: "normal" },
  { id: "A01-2", containerNo: "TCLU7891234", sizeType: "20GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 3, tripId: "BT-2024-0102", weight: 15200, etd: new Date("2024-06-22"), destination: "Hong Kong", pod: "HKHKG", specialType: "normal" },
  { id: "A01-3", containerNo: "OOLU5678901", sizeType: "40HC", status: "customs_hold", dischargeStatus: "in_yard", dwellDays: 7, tripId: "BT-2024-0103", weight: 22000, etd: new Date("2024-06-25"), destination: "Shanghai", pod: "CNSHA", specialType: "normal" },
  { id: "A01-4", containerNo: "HLXU3456789", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 2, tripId: "BT-2024-0104", weight: 19800, etd: new Date("2024-06-19"), destination: "Tokyo", pod: "JPTYO", specialType: "normal" },
  { id: "A01-5", containerNo: "CMAU9012345", sizeType: "20RF", status: "in_use", dischargeStatus: "in_yard", dwellDays: 1, tripId: "BT-2024-0105", weight: 12500, etd: new Date("2024-06-18"), destination: "Busan", pod: "KRPUS", specialType: "reefer" },
  { id: "A01-6", containerNo: "MSCU6789012", sizeType: "40GP", status: "dangerous_goods", dischargeStatus: "in_yard", dwellDays: 4, tripId: "BT-2024-0106", weight: 16000, etd: new Date("2024-06-21"), destination: "Bangkok", pod: "THBKK", specialType: "dg" },
  { id: "A01-7", containerNo: "TRLU1357924", sizeType: "40HC", status: "in_use", dischargeStatus: "in_yard", dwellDays: 6, tripId: "BT-2024-0107", weight: 21500, etd: new Date("2024-06-24"), destination: "Jakarta", pod: "IDJKT", specialType: "normal" },
  { id: "A01-8", containerNo: "MSKU2468135", sizeType: "20GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 8, tripId: "BT-2024-0108", weight: 14000, etd: new Date("2024-06-26"), destination: "Singapore", pod: "SGSIN", specialType: "normal" },
  { id: "A01-9", containerNo: "TCLU3579246", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 3, tripId: "BT-2024-0109", weight: 17500, etd: new Date("2024-06-20"), destination: "Hong Kong", pod: "HKHKG", specialType: "normal" },
  { id: "A01-10", containerNo: "OOLU4680357", sizeType: "45HC", status: "in_use", dischargeStatus: "in_yard", dwellDays: 5, tripId: "BT-2024-0110", weight: 23000, etd: new Date("2024-06-23"), destination: "Shanghai", pod: "CNSHA", specialType: "normal" },
  { id: "A01-11", containerNo: "HLXU5791468", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 2, tripId: "BT-2024-0111", weight: 18000, etd: new Date("2024-06-19"), destination: "Tokyo", pod: "JPTYO", specialType: "normal" },
  { id: "A01-12", containerNo: "CMAU6802579", sizeType: "20GP", status: "customs_hold", dischargeStatus: "in_yard", dwellDays: 9, tripId: "BT-2024-0112", weight: 13500, etd: new Date("2024-06-27"), destination: "Busan", pod: "KRPUS", specialType: "normal" },
  // More A01 containers
  { id: "A01-13", containerNo: "MSCU7913680", sizeType: "40RF", status: "in_use", dischargeStatus: "in_yard", dwellDays: 4, tripId: "BT-2024-0113", weight: 20000, etd: new Date("2024-06-21"), destination: "Bangkok", pod: "THBKK", specialType: "reefer" },
  { id: "A01-14", containerNo: "TRLU8024791", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 1, tripId: "BT-2024-0114", weight: 16500, etd: new Date("2024-06-18"), destination: "Jakarta", pod: "IDJKT", specialType: "normal" },
  { id: "A01-15", containerNo: "MSKU9135802", sizeType: "20GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 6, tripId: "BT-2024-0115", weight: 11000, etd: new Date("2024-06-24"), destination: "Singapore", pod: "SGSIN", specialType: "normal" },
  { id: "A01-16", containerNo: "TCLU0246913", sizeType: "40HC", status: "in_use", dischargeStatus: "in_yard", dwellDays: 7, tripId: "BT-2024-0116", weight: 19000, etd: new Date("2024-06-25"), destination: "Hong Kong", pod: "HKHKG", specialType: "normal" },
  { id: "A01-17", containerNo: "OOLU1358024", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 3, tripId: "BT-2024-0117", weight: 17000, etd: new Date("2024-06-20"), destination: "Shanghai", pod: "CNSHA", specialType: "normal" },
  { id: "A01-18", containerNo: "HLXU2469135", sizeType: "20RF", status: "in_use", dischargeStatus: "in_yard", dwellDays: 2, tripId: "BT-2024-0118", weight: 14500, etd: new Date("2024-06-19"), destination: "Tokyo", pod: "JPTYO", specialType: "reefer" },
  { id: "A01-19", containerNo: "CMAU3570246", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 5, tripId: "BT-2024-0119", weight: 18200, etd: new Date("2024-06-22"), destination: "Busan", pod: "KRPUS", specialType: "normal" },
  { id: "A01-20", containerNo: "MSCU4681357", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 4, tripId: "BT-2024-0120", weight: 20500, etd: new Date("2024-06-21"), destination: "Bangkok", pod: "THBKK", specialType: "normal" },
]

// Helper to create tier slots
function createTierSlots(maxTiers: number, containers: (Container | null)[]): TierSlot[] {
  const slots: TierSlot[] = []
  for (let tier = 1; tier <= maxTiers; tier++) {
    slots.push({
      tier,
      container: containers[tier - 1] || null
    })
  }
  return slots
}

// Create fixed stacks for Block A01 (Import)
function createBlockA01Stacks(): Stack[] {
  const stacks: Stack[] = []
  const maxTiers = 4
  
  // Predefined stack configurations [bay][row] = array of containers (from tier 1 to tier 4)
  const stackConfigs: Record<string, (Container | null)[]> = {
    "1-1": [containerDatabase[0], containerDatabase[1], containerDatabase[2], null],
    "1-2": [containerDatabase[3], containerDatabase[4], null, null],
    "1-3": [containerDatabase[5], null, null, null],
    "1-4": [containerDatabase[6], containerDatabase[7], containerDatabase[8], containerDatabase[9]],
    "1-5": [containerDatabase[10], containerDatabase[11], null, null],
    "1-6": [containerDatabase[12], null, null, null],
    "2-1": [containerDatabase[13], containerDatabase[14], containerDatabase[15], null],
    "2-2": [containerDatabase[16], containerDatabase[17], null, null],
    "2-3": [containerDatabase[18], containerDatabase[19], null, null],
    "2-4": [null, null, null, null],
    "2-5": [containerDatabase[0], null, null, null],
    "2-6": [containerDatabase[1], containerDatabase[2], null, null],
    "3-1": [containerDatabase[3], containerDatabase[4], containerDatabase[5], null],
    "3-2": [containerDatabase[6], null, null, null],
    "3-3": [null, null, null, null],
    "3-4": [containerDatabase[7], containerDatabase[8], null, null],
    "3-5": [containerDatabase[9], containerDatabase[10], containerDatabase[11], null],
    "3-6": [containerDatabase[12], null, null, null],
  }
  
  for (let bay = 1; bay <= 10; bay++) {
    for (let row = 1; row <= 6; row++) {
      const key = `${bay}-${row}`
      const containers = stackConfigs[key] || [null, null, null, null]
      
      stacks.push({
        block: "A01",
        bay,
        row,
        tiers: createTierSlots(maxTiers, containers),
        maxTiers,
      })
    }
  }
  
  return stacks
}

// Create fixed stacks for Block A02 (Import)
function createBlockA02Stacks(): Stack[] {
  const stacks: Stack[] = []
  const maxTiers = 4
  
  for (let bay = 1; bay <= 8; bay++) {
    for (let row = 1; row <= 5; row++) {
      const hasContainers = (bay + row) % 3 !== 0
      const tierCount = hasContainers ? ((bay * row) % 4) + 1 : 0
      
      const containers: (Container | null)[] = []
      for (let t = 0; t < maxTiers; t++) {
        if (t < tierCount) {
          const idx = (bay * 5 + row + t) % containerDatabase.length
          containers.push({
            ...containerDatabase[idx],
            id: `A02-${bay}-${row}-${t + 1}`,
            containerNo: `MSKU${2000000 + bay * 10000 + row * 100 + t}`,
          })
        } else {
          containers.push(null)
        }
      }
      
      stacks.push({
        block: "A02",
        bay,
        row,
        tiers: createTierSlots(maxTiers, containers),
        maxTiers,
      })
    }
  }
  
  return stacks
}

// Create fixed stacks for Block B01 (Export)
function createBlockB01Stacks(): Stack[] {
  const stacks: Stack[] = []
  const maxTiers = 5
  
  for (let bay = 1; bay <= 12; bay++) {
    for (let row = 1; row <= 6; row++) {
      const hasContainers = (bay + row) % 4 !== 0
      const tierCount = hasContainers ? ((bay + row) % 3) + 1 : 0
      
      const containers: (Container | null)[] = []
      for (let t = 0; t < maxTiers; t++) {
        if (t < tierCount) {
          const idx = (bay * 6 + row + t) % containerDatabase.length
          containers.push({
            ...containerDatabase[idx],
            id: `B01-${bay}-${row}-${t + 1}`,
            containerNo: `TCLU${3000000 + bay * 10000 + row * 100 + t}`,
            dischargeStatus: "in_yard",
          })
        } else {
          containers.push(null)
        }
      }
      
      stacks.push({
        block: "B01",
        bay,
        row,
        tiers: createTierSlots(maxTiers, containers),
        maxTiers,
      })
    }
  }
  
  return stacks
}

// Create fixed stacks for Block C01 (Reefer)
function createBlockC01Stacks(): Stack[] {
  const stacks: Stack[] = []
  const maxTiers = 3
  
  for (let bay = 1; bay <= 6; bay++) {
    for (let row = 1; row <= 4; row++) {
      const hasContainers = (bay + row) % 2 === 0
      const tierCount = hasContainers ? ((bay + row) % 3) + 1 : 0
      
      const containers: (Container | null)[] = []
      for (let t = 0; t < maxTiers; t++) {
        if (t < tierCount) {
          const idx = (bay * 4 + row + t) % containerDatabase.length
          containers.push({
            ...containerDatabase[idx],
            id: `C01-${bay}-${row}-${t + 1}`,
            containerNo: `OOLU${4000000 + bay * 10000 + row * 100 + t}`,
            specialType: "reefer",
            sizeType: t % 2 === 0 ? "20RF" : "40RF",
          })
        } else {
          containers.push(null)
        }
      }
      
      stacks.push({
        block: "C01",
        bay,
        row,
        tiers: createTierSlots(maxTiers, containers),
        maxTiers,
      })
    }
  }
  
  return stacks
}

// Create fixed stacks for Block D01 (DG - Dangerous Goods)
function createBlockD01Stacks(): Stack[] {
  const stacks: Stack[] = []
  const maxTiers = 2
  
  for (let bay = 1; bay <= 4; bay++) {
    for (let row = 1; row <= 4; row++) {
      const hasContainers = (bay * row) % 2 === 0
      const tierCount = hasContainers ? (bay % 2) + 1 : 0
      
      const containers: (Container | null)[] = []
      for (let t = 0; t < maxTiers; t++) {
        if (t < tierCount) {
          const idx = (bay * 4 + row + t) % containerDatabase.length
          containers.push({
            ...containerDatabase[idx],
            id: `D01-${bay}-${row}-${t + 1}`,
            containerNo: `HLXU${5000000 + bay * 10000 + row * 100 + t}`,
            specialType: "dg",
            status: "dangerous_goods",
          })
        } else {
          containers.push(null)
        }
      }
      
      stacks.push({
        block: "D01",
        bay,
        row,
        tiers: createTierSlots(maxTiers, containers),
        maxTiers,
      })
    }
  }
  
  return stacks
}

// Create fixed stacks for Block E01 (Hold)
function createBlockE01Stacks(): Stack[] {
  const stacks: Stack[] = []
  const maxTiers = 4
  
  for (let bay = 1; bay <= 6; bay++) {
    for (let row = 1; row <= 4; row++) {
      const hasContainers = bay <= 4 && row <= 3
      const tierCount = hasContainers ? (bay % 3) + 1 : 0
      
      const containers: (Container | null)[] = []
      for (let t = 0; t < maxTiers; t++) {
        if (t < tierCount) {
          const idx = (bay * 4 + row + t) % containerDatabase.length
          containers.push({
            ...containerDatabase[idx],
            id: `E01-${bay}-${row}-${t + 1}`,
            containerNo: `CMAU${6000000 + bay * 10000 + row * 100 + t}`,
            status: "customs_hold",
          })
        } else {
          containers.push(null)
        }
      }
      
      stacks.push({
        block: "E01",
        bay,
        row,
        tiers: createTierSlots(maxTiers, containers),
        maxTiers,
      })
    }
  }
  
  return stacks
}

// Sample yard blocks - using fixed data
export const yardBlocks: YardBlock[] = [
  {
    id: "A01",
    name: "A01 - Nhap",
    type: "Import",
    bays: 10,
    rows: 6,
    maxTiers: 4,
    stacks: createBlockA01Stacks(),
  },
  {
    id: "A02",
    name: "A02 - Nhap",
    type: "Import",
    bays: 8,
    rows: 5,
    maxTiers: 4,
    stacks: createBlockA02Stacks(),
  },
  {
    id: "B01",
    name: "B01 - Xuat",
    type: "Export",
    bays: 12,
    rows: 6,
    maxTiers: 5,
    stacks: createBlockB01Stacks(),
  },
  {
    id: "C01",
    name: "C01 - Lanh",
    type: "Reefer",
    bays: 6,
    rows: 4,
    maxTiers: 3,
    stacks: createBlockC01Stacks(),
  },
  {
    id: "D01",
    name: "D01 - Hang nguy hiem",
    type: "DG",
    bays: 4,
    rows: 4,
    maxTiers: 2,
    stacks: createBlockD01Stacks(),
  },
  {
    id: "E01",
    name: "E01 - Luu giu",
    type: "Hold",
    bays: 6,
    rows: 4,
    maxTiers: 4,
    stacks: createBlockE01Stacks(),
  },
]

// Get block statistics
export function getBlockStats(block: YardBlock) {
  const totalCapacity = block.bays * block.rows * block.maxTiers
  let usedCapacity = 0
  
  for (const stack of block.stacks) {
    for (const tier of stack.tiers) {
      if (tier.container) usedCapacity++
    }
  }
  
  return {
    totalCapacity,
    usedCapacity,
    emptySlots: totalCapacity - usedCapacity,
    occupancyRate: Math.round((usedCapacity / totalCapacity) * 100),
  }
}

// Get total yard statistics
export function getYardStats() {
  let totalCapacity = 0
  let usedCapacity = 0
  
  for (const block of yardBlocks) {
    const stats = getBlockStats(block)
    totalCapacity += stats.totalCapacity
    usedCapacity += stats.usedCapacity
  }
  
  return {
    totalCapacity,
    usedCapacity,
    emptySlots: totalCapacity - usedCapacity,
    occupancyRate: Math.round((usedCapacity / totalCapacity) * 100),
  }
}

// Find container by ID or container number
export function findContainer(query: string): { block: YardBlock; stack: Stack; tier: number; container: Container } | null {
  const searchQuery = query.toLowerCase()
  
  for (const block of yardBlocks) {
    for (const stack of block.stacks) {
      for (const tierSlot of stack.tiers) {
        if (tierSlot.container) {
          if (
            tierSlot.container.id.toLowerCase().includes(searchQuery) ||
            tierSlot.container.containerNo.toLowerCase().includes(searchQuery)
          ) {
            return {
              block,
              stack,
              tier: tierSlot.tier,
              container: tierSlot.container,
            }
          }
        }
      }
    }
  }
  
  return null
}

// Get all containers with their positions
export function getAllContainers(): Array<{ block: YardBlock; stack: Stack; tier: number; container: Container }> {
  const results: Array<{ block: YardBlock; stack: Stack; tier: number; container: Container }> = []
  
  for (const block of yardBlocks) {
    for (const stack of block.stacks) {
      for (const tierSlot of stack.tiers) {
        if (tierSlot.container) {
          results.push({
            block,
            stack,
            tier: tierSlot.tier,
            container: tierSlot.container,
          })
        }
      }
    }
  }
  
  return results
}

// Fixed vessel data for BAPLIE
const vesselContainersV001: Container[] = [
  { id: "V001-1", containerNo: "MSKU8001001", sizeType: "40GP", status: "in_use", dischargeStatus: "on_vessel", dwellDays: 0, weight: 18000, destination: "Singapore", pod: "SGSIN", specialType: "normal", vesselBay: 1, vesselRow: 1, vesselTier: 82 },
  { id: "V001-2", containerNo: "MSKU8001002", sizeType: "20GP", status: "in_use", dischargeStatus: "on_vessel", dwellDays: 0, weight: 15000, destination: "Singapore", pod: "SGSIN", specialType: "normal", vesselBay: 1, vesselRow: 2, vesselTier: 82 },
  { id: "V001-3", containerNo: "MSKU8001003", sizeType: "40HC", status: "in_use", dischargeStatus: "discharging", dwellDays: 0, weight: 22000, destination: "Hong Kong", pod: "HKHKG", specialType: "normal", vesselBay: 1, vesselRow: 3, vesselTier: 84 },
  { id: "V001-4", containerNo: "MSKU8001004", sizeType: "40GP", status: "in_use", dischargeStatus: "discharged", dwellDays: 0, weight: 19500, destination: "Hong Kong", pod: "HKHKG", specialType: "normal", vesselBay: 2, vesselRow: 1, vesselTier: 82 },
  { id: "V001-5", containerNo: "MSKU8001005", sizeType: "20RF", status: "in_use", dischargeStatus: "discharged", dwellDays: 0, weight: 12000, destination: "Shanghai", pod: "CNSHA", specialType: "reefer", vesselBay: 2, vesselRow: 2, vesselTier: 82 },
  { id: "V001-6", containerNo: "MSKU8001006", sizeType: "40GP", status: "dangerous_goods", dischargeStatus: "discharged", dwellDays: 0, weight: 16500, destination: "Shanghai", pod: "CNSHA", specialType: "dg", vesselBay: 2, vesselRow: 3, vesselTier: 84 },
  { id: "V001-7", containerNo: "MSKU8001007", sizeType: "40HC", status: "in_use", dischargeStatus: "in_yard", dwellDays: 1, weight: 21000, destination: "Tokyo", pod: "JPTYO", specialType: "normal", vesselBay: 3, vesselRow: 1, vesselTier: 82, yardPosition: "A01-01-01-02" },
  { id: "V001-8", containerNo: "MSKU8001008", sizeType: "20GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 1, weight: 14500, destination: "Tokyo", pod: "JPTYO", specialType: "normal", vesselBay: 3, vesselRow: 2, vesselTier: 82, yardPosition: "A01-01-02-01" },
  { id: "V001-9", containerNo: "MSKU8001009", sizeType: "40GP", status: "in_use", dischargeStatus: "on_vessel", dwellDays: 0, weight: 17500, destination: "Busan", pod: "KRPUS", specialType: "normal", vesselBay: 3, vesselRow: 3, vesselTier: 84 },
  { id: "V001-10", containerNo: "MSKU8001010", sizeType: "45HC", status: "in_use", dischargeStatus: "on_vessel", dwellDays: 0, weight: 23500, destination: "Busan", pod: "KRPUS", specialType: "normal", vesselBay: 4, vesselRow: 1, vesselTier: 82 },
  { id: "V001-11", containerNo: "MSKU8001011", sizeType: "40GP", status: "in_use", dischargeStatus: "discharged", dwellDays: 0, weight: 18500, destination: "Bangkok", pod: "THBKK", specialType: "normal", vesselBay: 4, vesselRow: 2, vesselTier: 82 },
  { id: "V001-12", containerNo: "MSKU8001012", sizeType: "20GP", status: "customs_hold", dischargeStatus: "discharged", dwellDays: 0, weight: 13000, destination: "Bangkok", pod: "THBKK", specialType: "normal", vesselBay: 4, vesselRow: 3, vesselTier: 84 },
]

const vesselContainersV002: Container[] = [
  { id: "V002-1", containerNo: "TCLU9001001", sizeType: "40GP", status: "in_use", dischargeStatus: "on_vessel", dwellDays: 0, weight: 19000, destination: "Singapore", pod: "SGSIN", specialType: "normal", vesselBay: 1, vesselRow: 1, vesselTier: 82 },
  { id: "V002-2", containerNo: "TCLU9001002", sizeType: "20GP", status: "in_use", dischargeStatus: "on_vessel", dwellDays: 0, weight: 14000, destination: "Hong Kong", pod: "HKHKG", specialType: "normal", vesselBay: 1, vesselRow: 2, vesselTier: 82 },
  { id: "V002-3", containerNo: "TCLU9001003", sizeType: "40HC", status: "in_use", dischargeStatus: "on_vessel", dwellDays: 0, weight: 21500, destination: "Shanghai", pod: "CNSHA", specialType: "normal", vesselBay: 1, vesselRow: 3, vesselTier: 84 },
  { id: "V002-4", containerNo: "TCLU9001004", sizeType: "40GP", status: "in_use", dischargeStatus: "on_vessel", dwellDays: 0, weight: 18200, destination: "Tokyo", pod: "JPTYO", specialType: "normal", vesselBay: 2, vesselRow: 1, vesselTier: 82 },
  { id: "V002-5", containerNo: "TCLU9001005", sizeType: "20RF", status: "in_use", dischargeStatus: "on_vessel", dwellDays: 0, weight: 11500, destination: "Busan", pod: "KRPUS", specialType: "reefer", vesselBay: 2, vesselRow: 2, vesselTier: 82 },
]

const vesselContainersV003: Container[] = [
  { id: "V003-1", containerNo: "OOLU7001001", sizeType: "40GP", status: "in_use", dischargeStatus: "gate_out", dwellDays: 5, weight: 17500, destination: "Singapore", pod: "SGSIN", specialType: "normal", vesselBay: 1, vesselRow: 1, vesselTier: 82 },
  { id: "V003-2", containerNo: "OOLU7001002", sizeType: "20GP", status: "in_use", dischargeStatus: "gate_out", dwellDays: 4, weight: 13500, destination: "Hong Kong", pod: "HKHKG", specialType: "normal", vesselBay: 1, vesselRow: 2, vesselTier: 82 },
  { id: "V003-3", containerNo: "OOLU7001003", sizeType: "40HC", status: "in_use", dischargeStatus: "gate_out", dwellDays: 3, weight: 20000, destination: "Shanghai", pod: "CNSHA", specialType: "normal", vesselBay: 1, vesselRow: 3, vesselTier: 84 },
]

// Fixed base date for vessel operations
const baseVesselDate = new Date("2024-06-15T00:00:00Z")

export const vessels: Vessel[] = [
  {
    id: "V001",
    name: "EVER GIVEN",
    voyageNo: "EG2024-045",
    version: 1,
    eta: new Date(baseVesselDate.getTime() - 2 * 24 * 60 * 60 * 1000),
    etd: new Date(baseVesselDate.getTime() + 1 * 24 * 60 * 60 * 1000),
    status: "discharging",
    containers: vesselContainersV001,
    totalContainers: 12,
    dischargedCount: 7,
  },
  {
    id: "V002",
    name: "MAERSK ALABAMA",
    voyageNo: "MA2024-089",
    version: 2,
    eta: new Date(baseVesselDate.getTime() + 1 * 24 * 60 * 60 * 1000),
    etd: new Date(baseVesselDate.getTime() + 3 * 24 * 60 * 60 * 1000),
    status: "approaching",
    containers: vesselContainersV002,
    totalContainers: 5,
    dischargedCount: 0,
  },
  {
    id: "V003",
    name: "COSCO SHIPPING",
    voyageNo: "CS2024-123",
    version: 1,
    eta: new Date(baseVesselDate.getTime() - 5 * 24 * 60 * 60 * 1000),
    etd: new Date(baseVesselDate.getTime() - 3 * 24 * 60 * 60 * 1000),
    status: "completed",
    containers: vesselContainersV003,
    totalContainers: 3,
    dischargedCount: 3,
  },
]

// =============================================
// EXPORT YARD DATA - MOVINS
// =============================================

// Export containers for MOVINS - with load sequence
// Load sequence: lower = load first (goes on TOP), higher = load last (at BOTTOM)
const exportContainersEX001: ExportContainer[] = [
  // POD: SGSIN - Singapore (load first, group at top)
  { id: "EX001-1", containerNo: "EXPU1001001", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 3, weight: 18000, destination: "Singapore", pod: "SGSIN", specialType: "normal", loadSequence: 1, vesselTargetBay: 1, vesselTargetRow: 1, vesselTargetTier: 86, exportStatus: "in_yard", plannedYardPosition: "B01-01-01-04" },
  { id: "EX001-2", containerNo: "EXPU1001002", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 2, weight: 16500, destination: "Singapore", pod: "SGSIN", specialType: "normal", loadSequence: 2, vesselTargetBay: 1, vesselTargetRow: 2, vesselTargetTier: 86, exportStatus: "in_yard", plannedYardPosition: "B01-01-01-03" },
  { id: "EX001-3", containerNo: "EXPU1001003", sizeType: "20GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 4, weight: 14000, destination: "Singapore", pod: "SGSIN", specialType: "normal", loadSequence: 3, vesselTargetBay: 1, vesselTargetRow: 3, vesselTargetTier: 84, exportStatus: "in_yard", plannedYardPosition: "B01-01-01-02" },
  
  // POD: HKHKG - Hong Kong (load second)
  { id: "EX001-4", containerNo: "EXPU1001004", sizeType: "40HC", status: "in_use", dischargeStatus: "in_yard", dwellDays: 2, weight: 21000, destination: "Hong Kong", pod: "HKHKG", specialType: "normal", loadSequence: 4, vesselTargetBay: 2, vesselTargetRow: 1, vesselTargetTier: 86, exportStatus: "ready_load", plannedYardPosition: "B01-01-02-03" },
  { id: "EX001-5", containerNo: "EXPU1001005", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 3, weight: 19500, destination: "Hong Kong", pod: "HKHKG", specialType: "normal", loadSequence: 5, vesselTargetBay: 2, vesselTargetRow: 2, vesselTargetTier: 86, exportStatus: "ready_load", plannedYardPosition: "B01-01-02-02" },
  
  // POD: CNSHA - Shanghai (load third)
  { id: "EX001-6", containerNo: "EXPU1001006", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 1, weight: 17000, destination: "Shanghai", pod: "CNSHA", specialType: "normal", loadSequence: 6, vesselTargetBay: 3, vesselTargetRow: 1, vesselTargetTier: 86, exportStatus: "in_yard", plannedYardPosition: "B01-02-01-03" },
  { id: "EX001-7", containerNo: "EXPU1001007", sizeType: "20RF", status: "in_use", dischargeStatus: "in_yard", dwellDays: 2, weight: 12500, destination: "Shanghai", pod: "CNSHA", specialType: "reefer", loadSequence: 7, vesselTargetBay: 3, vesselTargetRow: 2, vesselTargetTier: 84, exportStatus: "in_yard", plannedYardPosition: "C01-01-01-02" },
  { id: "EX001-8", containerNo: "EXPU1001008", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 3, weight: 20000, destination: "Shanghai", pod: "CNSHA", specialType: "normal", loadSequence: 8, vesselTargetBay: 3, vesselTargetRow: 3, vesselTargetTier: 86, exportStatus: "in_yard", plannedYardPosition: "B01-02-01-02" },
  
  // POD: JPTYO - Tokyo (load last)
  { id: "EX001-9", containerNo: "EXPU1001009", sizeType: "40HC", status: "in_use", dischargeStatus: "in_yard", dwellDays: 5, weight: 22000, destination: "Tokyo", pod: "JPTYO", specialType: "normal", loadSequence: 9, vesselTargetBay: 4, vesselTargetRow: 1, vesselTargetTier: 86, exportStatus: "in_yard", plannedYardPosition: "B01-02-02-02" },
  { id: "EX001-10", containerNo: "EXPU1001010", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 4, weight: 18500, destination: "Tokyo", pod: "JPTYO", specialType: "normal", loadSequence: 10, vesselTargetBay: 4, vesselTargetRow: 2, vesselTargetTier: 86, exportStatus: "in_yard", plannedYardPosition: "B01-02-02-01" },
]

const exportContainersEX002: ExportContainer[] = [
  // POD: KRPUS - Busan
  { id: "EX002-1", containerNo: "EXKU2001001", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 2, weight: 17500, destination: "Busan", pod: "KRPUS", specialType: "normal", loadSequence: 1, vesselTargetBay: 1, vesselTargetRow: 1, vesselTargetTier: 86, exportStatus: "in_yard", plannedYardPosition: "B01-03-01-03" },
  { id: "EX002-2", containerNo: "EXKU2001002", sizeType: "40HC", status: "in_use", dischargeStatus: "in_yard", dwellDays: 3, weight: 21500, destination: "Busan", pod: "KRPUS", specialType: "normal", loadSequence: 2, vesselTargetBay: 1, vesselTargetRow: 2, vesselTargetTier: 86, exportStatus: "in_yard", plannedYardPosition: "B01-03-01-02" },
  
  // POD: THBKK - Bangkok
  { id: "EX002-3", containerNo: "EXKU2001003", sizeType: "20GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 1, weight: 13000, destination: "Bangkok", pod: "THBKK", specialType: "normal", loadSequence: 3, vesselTargetBay: 2, vesselTargetRow: 1, vesselTargetTier: 84, exportStatus: "planned", plannedYardPosition: "B01-03-02-02" },
  { id: "EX002-4", containerNo: "EXKU2001004", sizeType: "40GP", status: "dangerous_goods", dischargeStatus: "in_yard", dwellDays: 2, weight: 16000, destination: "Bangkok", pod: "THBKK", specialType: "dg", loadSequence: 4, vesselTargetBay: 2, vesselTargetRow: 2, vesselTargetTier: 86, exportStatus: "planned", plannedYardPosition: "D01-01-01-01" },
  
  // POD: IDJKT - Jakarta
  { id: "EX002-5", containerNo: "EXKU2001005", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 4, weight: 19000, destination: "Jakarta", pod: "IDJKT", specialType: "normal", loadSequence: 5, vesselTargetBay: 3, vesselTargetRow: 1, vesselTargetTier: 86, exportStatus: "received" },
  { id: "EX002-6", containerNo: "EXKU2001006", sizeType: "20RF", status: "in_use", dischargeStatus: "in_yard", dwellDays: 3, weight: 11000, destination: "Jakarta", pod: "IDJKT", specialType: "reefer", loadSequence: 6, vesselTargetBay: 3, vesselTargetRow: 2, vesselTargetTier: 84, exportStatus: "received" },
]

const exportContainersEX003: ExportContainer[] = [
  // Loading in progress vessel
  { id: "EX003-1", containerNo: "EXLU3001001", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 5, weight: 18000, destination: "Manila", pod: "PHMNL", specialType: "normal", loadSequence: 1, vesselTargetBay: 1, vesselTargetRow: 1, vesselTargetTier: 86, exportStatus: "loaded" },
  { id: "EX003-2", containerNo: "EXLU3001002", sizeType: "40GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 4, weight: 17500, destination: "Manila", pod: "PHMNL", specialType: "normal", loadSequence: 2, vesselTargetBay: 1, vesselTargetRow: 2, vesselTargetTier: 86, exportStatus: "loaded" },
  { id: "EX003-3", containerNo: "EXLU3001003", sizeType: "40HC", status: "in_use", dischargeStatus: "in_yard", dwellDays: 3, weight: 20000, destination: "Ho Chi Minh", pod: "VNSGN", specialType: "normal", loadSequence: 3, vesselTargetBay: 2, vesselTargetRow: 1, vesselTargetTier: 86, exportStatus: "loading" },
  { id: "EX003-4", containerNo: "EXLU3001004", sizeType: "20GP", status: "in_use", dischargeStatus: "in_yard", dwellDays: 2, weight: 14500, destination: "Ho Chi Minh", pod: "VNSGN", specialType: "normal", loadSequence: 4, vesselTargetBay: 2, vesselTargetRow: 2, vesselTargetTier: 84, exportStatus: "ready_load" },
]

// Export vessels with MOVINS data
export const exportVessels: ExportVessel[] = [
  {
    id: "EX001",
    name: "YANGMING UNIFORM",
    voyageNo: "YM2024-078",
    version: 1,
    eta: new Date(baseVesselDate.getTime() + 2 * 24 * 60 * 60 * 1000),
    etd: new Date(baseVesselDate.getTime() + 4 * 24 * 60 * 60 * 1000),
    status: "receiving",
    containers: exportContainersEX001,
    totalContainers: 10,
    loadedCount: 0,
    pods: ["SGSIN", "HKHKG", "CNSHA", "JPTYO"],
  },
  {
    id: "EX002",
    name: "HAPAG LLOYD EXPRESS",
    voyageNo: "HL2024-156",
    version: 2,
    eta: new Date(baseVesselDate.getTime() + 5 * 24 * 60 * 60 * 1000),
    etd: new Date(baseVesselDate.getTime() + 7 * 24 * 60 * 60 * 1000),
    status: "planning",
    containers: exportContainersEX002,
    totalContainers: 6,
    loadedCount: 0,
    pods: ["KRPUS", "THBKK", "IDJKT"],
  },
  {
    id: "EX003",
    name: "MSC ISTANBUL",
    voyageNo: "MSC2024-234",
    version: 1,
    eta: new Date(baseVesselDate.getTime() - 1 * 24 * 60 * 60 * 1000),
    etd: new Date(baseVesselDate.getTime() + 1 * 24 * 60 * 60 * 1000),
    status: "loading",
    containers: exportContainersEX003,
    totalContainers: 4,
    loadedCount: 2,
    pods: ["PHMNL", "VNSGN"],
  },
]

// Get export containers grouped by POD and sorted by load sequence (for reverse stacking)
export function getExportContainersByPOD(vessel: ExportVessel): Record<string, ExportContainer[]> {
  const grouped: Record<string, ExportContainer[]> = {}
  
  for (const container of vessel.containers) {
    const pod = container.pod || "UNKNOWN"
    if (!grouped[pod]) {
      grouped[pod] = []
    }
    grouped[pod].push(container)
  }
  
  // Sort each group by load sequence (ascending)
  for (const pod of Object.keys(grouped)) {
    grouped[pod].sort((a, b) => a.loadSequence - b.loadSequence)
  }
  
  return grouped
}

// Plan export yard stacking - reverse order (load first = TOP)
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
  maxTiers: number = 5
): ExportStackPlan[] {
  const plans: ExportStackPlan[] = []
  
  // Sort by load sequence (ascending = load first)
  const sorted = [...containers].sort((a, b) => a.loadSequence - b.loadSequence)
  
  // Stack in reverse order: load first goes to TOP tier
  // This ensures no rehandle during loading
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
  
  // Assign tiers from top to bottom (reverse order)
  for (let i = 0; i < sorted.length; i++) {
    const container = sorted[i]
    const tierFromTop = (i % maxTiers) + 1
    const actualTier = maxTiers - tierFromTop + 1 // Convert to actual tier (1 = bottom)
    
    if (tierFromTop === 1 && i > 0) {
      // Start new stack
      plans.push(currentStack)
      currentRow++
      if (currentRow > 6) {
        currentRow = 1
        currentBay++
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
      loadFirst: container.loadSequence <= 3, // First 3 to load
    })
    
    // Check weight violation (heavy on light)
    if (currentStack.containers.length > 1) {
      const prevContainer = currentStack.containers[currentStack.containers.length - 2]
      if (container.weight && prevContainer.container.weight) {
        if (container.weight > prevContainer.container.weight * 1.2) {
          currentStack.warnings.push(`Trọng lượng: ${container.containerNo} nặng hơn container bên dưới`)
        }
      }
    }
  }
  
  // Add last stack
  if (currentStack.containers.length > 0) {
    plans.push(currentStack)
  }
  
  // Sort containers within each stack by tier (descending for display)
  for (const plan of plans) {
    plan.containers.sort((a, b) => b.tier - a.tier)
  }
  
  return plans
}
