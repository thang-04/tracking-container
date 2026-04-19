// Advanced Yard Optimization System
// Smart container stacking with ETD-based positioning, auto-slotting, and KPI tracking

import type { YardBlock, Stack, Container, TierSlot, SpecialType } from "./yard-types"
import { calculateStackScore, type StackScore } from "./yard-scoring"

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ContainerWithETD extends Container {
  etd?: Date  // Estimated Time of Departure
  eta?: Date  // Estimated Time of Arrival
  destination?: string
  carrier?: string
  priority?: "high" | "normal" | "low"
  specialType?: SpecialType
  pod?: string
}

export interface SlotRecommendation {
  block: string
  bay: number
  row: number
  tier: number
  score: number
  reasons: string[]
  warnings: string[]
  expectedRehandle: number
}

export interface YardKPIs {
  totalContainers: number
  averageRehandlePerContainer: number
  yardUtilization: number
  averageDwellTime: number
  blockedStacks: number
  totalStacks: number
  optimalStacks: number
  criticalStacks: number
  estimatedDailyRehandles: number
}

export interface OptimizationSuggestion {
  containerId: string
  containerNo: string
  currentPosition: string
  suggestedPosition: string
  reason: string
  priority: "high" | "medium" | "low"
  expectedImprovement: number
}

// =============================================================================
// STACKING STRATEGY (Thuật toán xếp container)
// =============================================================================

/**
 * Calculate ETD priority score - earlier departure = higher priority
 * Priority 1: Container xuất sớm phải xếp trên cùng
 */
export function calculateETDPriority(container: ContainerWithETD): number {
  if (!container.etd) return 50 // Default middle priority
  
  const now = new Date()
  const hoursUntilDeparture = (container.etd.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  if (hoursUntilDeparture <= 24) return 100       // Departs within 24h - highest priority
  if (hoursUntilDeparture <= 48) return 85        // Departs within 48h
  if (hoursUntilDeparture <= 72) return 70        // Departs within 72h
  if (hoursUntilDeparture <= 168) return 50       // Departs within 1 week
  return 30                                        // Departs later
}

/**
 * Check if stacking two containers would cause future rehandle
 * Returns true if top container departs AFTER bottom container
 */
export function willCauseRehandle(
  bottomContainer: ContainerWithETD, 
  topContainer: ContainerWithETD
): boolean {
  if (!bottomContainer.etd || !topContainer.etd) return false
  return topContainer.etd > bottomContainer.etd
}

/**
 * Calculate optimal tier for a new container in a stack
 * Based on ETD (early departure on top) and weight (heavy on bottom)
 */
export function calculateOptimalTier(
  stack: Stack,
  newContainer: ContainerWithETD
): number | null {
  const occupiedTiers = stack.tiers.filter(t => t.container !== null)
  const emptyTiers = stack.tiers.filter(t => t.container === null)
  
  // If stack is full, no placement possible
  if (emptyTiers.length === 0) return null
  
  // If stack is empty, place at bottom (tier 1)
  if (occupiedTiers.length === 0) return 1
  
  // Find the optimal tier based on ETD and weight rules
  const newETDPriority = calculateETDPriority(newContainer)
  const newWeight = newContainer.weight ?? 15000
  
  // Get the next available tier (one above highest occupied)
  const highestOccupiedTier = Math.max(...occupiedTiers.map(t => t.tier))
  const nextTier = highestOccupiedTier + 1
  
  if (nextTier > stack.maxTiers) return null
  
  // Check if placing here would violate rules
  const topContainer = occupiedTiers.find(t => t.tier === highestOccupiedTier)?.container as ContainerWithETD | null
  
  if (topContainer) {
    const topWeight = topContainer.weight ?? 15000
    const topETDPriority = calculateETDPriority(topContainer)
    
    // Warning: heavy container on top of light container
    const weightViolation = newWeight > topWeight * 1.2 // Allow 20% tolerance
    
    // Warning: container with later ETD on top of earlier ETD
    const etdViolation = newETDPriority < topETDPriority - 10
    
    // Still return the tier, but the warnings will be shown in recommendations
  }
  
  return nextTier
}

// =============================================================================
// AUTO-SLOTTING (Gợi ý vị trí thông minh)
// =============================================================================

// Hard rule threshold: reject positions that cause more than this many rehandles
const MAX_ALLOWED_REHANDLE = 2

/**
 * Find best slot(s) for a new container
 * Returns ranked list of recommendations with scores and reasons
 * Hard rule: Does not allow placements that cause > MAX_ALLOWED_REHANDLE rehandles
 */
export function findBestSlots(
  blocks: YardBlock[],
  container: ContainerWithETD,
  maxResults: number = 5
): SlotRecommendation[] {
  const recommendations: SlotRecommendation[] = []
  
  for (const block of blocks) {
    // Skip if block type doesn't match container requirements
    // DG containers must go to DG zone
    if (container.status === "dangerous_goods" && block.type !== "DG") continue
    if (container.specialType === "dg" && block.type !== "DG") continue
    if (block.type === "DG" && container.status !== "dangerous_goods" && container.specialType !== "dg") continue
    
    // Reefer containers should go to Reefer zone
    if (container.specialType === "reefer" && block.type !== "Reefer") continue
    if (block.type === "Reefer" && container.specialType !== "reefer") continue
    
    // Import containers should go to Import zone
    if (block.type === "Export" || block.type === "Empty" || block.type === "Hold" || block.type === "Inspection") continue
    
    for (const stack of block.stacks) {
      const optimalTier = calculateOptimalTier(stack, container)
      if (optimalTier === null) continue
      
      // Calculate score for this placement
      const { score, reasons, warnings, expectedRehandle } = evaluatePlacement(
        stack, 
        container, 
        optimalTier,
        block
      )
      
      // HARD RULE: Reject positions that would cause high rehandle
      // Per spec: "Không cho phép đặt vào vị trí gây rehandle cao"
      if (expectedRehandle > MAX_ALLOWED_REHANDLE) {
        continue // Skip this position entirely
      }
      
      recommendations.push({
        block: block.id,
        bay: stack.bay,
        row: stack.row,
        tier: optimalTier,
        score,
        reasons,
        warnings,
        expectedRehandle,
      })
    }
  }
  
  // Sort by score (highest first) and return top results
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
}

/**
 * Evaluate a potential placement and calculate score
 */
function evaluatePlacement(
  stack: Stack,
  container: ContainerWithETD,
  tier: number,
  block: YardBlock
): { score: number; reasons: string[]; warnings: string[]; expectedRehandle: number } {
  const reasons: string[] = []
  const warnings: string[] = []
  let score = 100
  let expectedRehandle = 0
  
  const occupiedTiers = stack.tiers.filter(t => t.container !== null)
  const containerCount = occupiedTiers.length
  
  // 1. Empty stack bonus (+20)
  if (containerCount === 0) {
    score += 20
    reasons.push("Stack trống - không có rehandle")
  }
  
  // 2. Same vessel/trip grouping bonus (+15)
  if (containerCount > 0) {
    const existingTrips = occupiedTiers.map(t => (t.container as ContainerWithETD).tripId).filter(Boolean)
    if (container.tripId && existingTrips.includes(container.tripId)) {
      score += 15
      reasons.push("Cùng chuyến tàu với container hiện có")
    }
  }
  
  // 3. Same destination grouping bonus (+10)
  if (containerCount > 0 && container.destination) {
    const existingDestinations = occupiedTiers
      .map(t => (t.container as ContainerWithETD).destination)
      .filter(Boolean)
    if (existingDestinations.includes(container.destination)) {
      score += 10
      reasons.push("Cùng điểm đến với container hiện có")
    }
  }
  
  // 4. Correct zone bonus (+10)
  if (block.type === "Import" && container.eta) {
    score += 10
    reasons.push("Đúng khu vực hàng nhập")
  } else if (block.type === "Export" && container.etd) {
    score += 10
    reasons.push("Đúng khu vực hàng xuất")
  }
  
  // 5. Check for potential rehandle issues (-30 per blocked container)
  if (containerCount > 0 && container.etd) {
    for (const tierSlot of occupiedTiers) {
      const existing = tierSlot.container as ContainerWithETD
      if (existing.etd && existing.etd < container.etd) {
        // Existing container departs earlier but will be blocked by new container
        expectedRehandle++
        score -= 30
        warnings.push(`Container ${existing.containerNo} xuất trước nhưng sẽ bị chặn`)
      }
    }
  }
  
  // 6. Weight stacking check (-15 for heavy on light)
  if (containerCount > 0) {
    const topTier = Math.max(...occupiedTiers.map(t => t.tier))
    const topContainer = occupiedTiers.find(t => t.tier === topTier)?.container
    if (topContainer) {
      const topWeight = topContainer.weight ?? 15000
      const newWeight = container.weight ?? 15000
      if (newWeight > topWeight * 1.2) {
        score -= 15
        warnings.push("Container nặng đặt trên container nhẹ")
      }
    }
  }
  
  // 7. Stack height penalty (prefer lower stacks)
  score -= (containerCount * 5)
  if (containerCount < 2) {
    reasons.push("Stack thấp - dễ tiếp cận")
  }
  
  // 8. Avoid high-risk stacks
  if (containerCount >= stack.maxTiers - 1) {
    score -= 10
    warnings.push("Stack gần đầy")
  }
  
  return { score: Math.max(0, score), reasons, warnings, expectedRehandle }
}

// =============================================================================
// KPI CALCULATION
// =============================================================================

/**
 * Calculate comprehensive yard KPIs
 */
export function calculateYardKPIs(blocks: YardBlock[]): YardKPIs {
  let totalContainers = 0
  let totalRehandleMoves = 0
  let totalDwellDays = 0
  let blockedStacks = 0
  let totalStacks = 0
  let optimalStacks = 0
  let criticalStacks = 0
  let totalCapacity = 0
  let usedCapacity = 0
  
  for (const block of blocks) {
    for (const stack of block.stacks) {
      totalStacks++
      totalCapacity += stack.maxTiers
      
      const containers = stack.tiers.filter(t => t.container !== null)
      usedCapacity += containers.length
      totalContainers += containers.length
      
      // Calculate dwell time
      for (const tier of containers) {
        totalDwellDays += tier.container!.dwellDays
      }
      
      // Calculate rehandle potential
      // For each container, count how many containers are above it
      for (let i = 0; i < containers.length; i++) {
        const containersAbove = containers.filter(t => t.tier > containers[i].tier).length
        totalRehandleMoves += containersAbove
      }
      
      // Check if stack is blocked (has containers that need rehandle)
      if (containers.length > 1) {
        blockedStacks++
      }
      
      // Calculate stack score for optimal/critical classification
      const score = calculateStackScore(stack, block)
      if (score.level === "optimal" || score.level === "acceptable") {
        optimalStacks++
      } else if (score.level === "critical") {
        criticalStacks++
      }
    }
  }
  
  const averageRehandle = totalContainers > 0 ? totalRehandleMoves / totalContainers : 0
  const averageDwell = totalContainers > 0 ? totalDwellDays / totalContainers : 0
  const utilization = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0
  
  // Estimate daily rehandles based on average dwell time
  // Assumes containers are retrieved evenly throughout their dwell period
  const estimatedDailyRehandles = averageDwell > 0 
    ? Math.round(totalRehandleMoves / averageDwell) 
    : 0
  
  return {
    totalContainers,
    averageRehandlePerContainer: Math.round(averageRehandle * 100) / 100,
    yardUtilization: Math.round(utilization * 10) / 10,
    averageDwellTime: Math.round(averageDwell * 10) / 10,
    blockedStacks,
    totalStacks,
    optimalStacks,
    criticalStacks,
    estimatedDailyRehandles,
  }
}

// =============================================================================
// OPTIMIZATION SUGGESTIONS
// =============================================================================

/**
 * Generate optimization suggestions for improving yard layout
 * Identifies containers that should be moved for better efficiency
 */
export function generateOptimizationSuggestions(
  blocks: YardBlock[],
  maxSuggestions: number = 10
): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = []
  
  for (const block of blocks) {
    for (const stack of block.stacks) {
      const containers = stack.tiers
        .filter(t => t.container !== null)
        .map(t => ({ tier: t.tier, container: t.container as ContainerWithETD }))
        .sort((a, b) => a.tier - b.tier)
      
      if (containers.length < 2) continue
      
      // Check for ETD violations (early departure blocked by later departure)
      for (let i = 0; i < containers.length - 1; i++) {
        const lower = containers[i]
        const upper = containers[i + 1]
        
        if (lower.container.etd && upper.container.etd) {
          if (lower.container.etd < upper.container.etd) {
            // Lower container departs earlier but is blocked
            const rehandleMoves = containers.length - i - 1
            
            suggestions.push({
              containerId: lower.container.id,
              containerNo: lower.container.containerNo,
              currentPosition: `${block.id}-${String(stack.bay).padStart(2, "0")}-${String(stack.row).padStart(2, "0")}-${String(lower.tier).padStart(2, "0")}`,
              suggestedPosition: "Tìm vị trí trên cùng stack trống",
              reason: `Container xuất sớm bị chặn bởi ${rehandleMoves} container`,
              priority: rehandleMoves > 2 ? "high" : rehandleMoves > 1 ? "medium" : "low",
              expectedImprovement: rehandleMoves * 15, // 15 minutes per rehandle
            })
          }
        }
      }
      
      // Check for weight violations
      for (let i = 0; i < containers.length - 1; i++) {
        const lower = containers[i]
        const upper = containers[i + 1]
        const lowerWeight = lower.container.weight ?? 15000
        const upperWeight = upper.container.weight ?? 15000
        
        if (upperWeight > lowerWeight * 1.5) { // Significant weight violation
          suggestions.push({
            containerId: upper.container.id,
            containerNo: upper.container.containerNo,
            currentPosition: `${block.id}-${String(stack.bay).padStart(2, "0")}-${String(stack.row).padStart(2, "0")}-${String(upper.tier).padStart(2, "0")}`,
            suggestedPosition: "Di chuyển đến vị trí thấp hơn",
            reason: `Container nặng (${(upperWeight/1000).toFixed(1)}T) đặt trên container nhẹ (${(lowerWeight/1000).toFixed(1)}T)`,
            priority: "low",
            expectedImprovement: 5,
          })
        }
      }
    }
  }
  
  // Sort by priority and expected improvement
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return suggestions
    .sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.expectedImprovement - a.expectedImprovement
    })
    .slice(0, maxSuggestions)
}

// =============================================================================
// SEVERITY CALCULATION (Nghiêm trọng = f(Rehandle, Misplacement, Imbalance))
// =============================================================================

export interface SeverityBreakdown {
  total: number
  rehandleSeverity: number
  misplacementSeverity: number
  imbalanceSeverity: number
  level: "low" | "medium" | "high" | "critical"
}

/**
 * Calculate comprehensive severity score for a stack
 * Severity = f(Rehandle, Misplacement, Stack imbalance)
 */
export function calculateSeverity(stack: Stack, block: YardBlock): SeverityBreakdown {
  const containers = stack.tiers
    .filter(t => t.container !== null)
    .map(t => ({ tier: t.tier, container: t.container as ContainerWithETD }))
    .sort((a, b) => a.tier - b.tier)
  
  if (containers.length === 0) {
    return {
      total: 0,
      rehandleSeverity: 0,
      misplacementSeverity: 0,
      imbalanceSeverity: 0,
      level: "low",
    }
  }
  
  // 1. Rehandle Severity (0-40 points)
  // Based on how many containers will need to be moved to access lower ones
  let rehandleMoves = 0
  for (let i = 0; i < containers.length - 1; i++) {
    const containersAbove = containers.length - i - 1
    rehandleMoves += containersAbove
  }
  const rehandleSeverity = Math.min(40, rehandleMoves * 10)
  
  // 2. Misplacement Severity (0-30 points)
  // ETD violations: early departure below late departure
  let etdViolations = 0
  let weightViolations = 0
  
  for (let i = 0; i < containers.length - 1; i++) {
    const lower = containers[i]
    const upper = containers[i + 1]
    
    // ETD check
    if (lower.container.etd && upper.container.etd) {
      if (lower.container.etd < upper.container.etd) {
        etdViolations++
      }
    }
    
    // Weight check
    const lowerWeight = lower.container.weight ?? 15000
    const upperWeight = upper.container.weight ?? 15000
    if (upperWeight > lowerWeight * 1.2) {
      weightViolations++
    }
  }
  const misplacementSeverity = Math.min(30, (etdViolations * 15) + (weightViolations * 5))
  
  // 3. Stack Imbalance Severity (0-30 points)
  // Based on how full the stack is vs optimal distribution
  const fillRatio = containers.length / stack.maxTiers
  let imbalanceSeverity = 0
  
  if (fillRatio > 0.9) {
    // Stack nearly full - high imbalance if other stacks are empty
    imbalanceSeverity = 15
  }
  
  // Mixed vessel types in same stack
  const trips = new Set(containers.map(c => c.container.tripId).filter(Boolean))
  if (trips.size > 2) {
    imbalanceSeverity += 10
  }
  
  // Zone mismatch
  const hasDG = containers.some(c => c.container.status === "dangerous_goods")
  if (hasDG && block.type !== "DG") {
    imbalanceSeverity += 15
  }
  
  imbalanceSeverity = Math.min(30, imbalanceSeverity)
  
  // Calculate total severity
  const total = rehandleSeverity + misplacementSeverity + imbalanceSeverity
  
  // Determine severity level
  let level: "low" | "medium" | "high" | "critical"
  if (total >= 60) level = "critical"
  else if (total >= 40) level = "high"
  else if (total >= 20) level = "medium"
  else level = "low"
  
  return {
    total,
    rehandleSeverity,
    misplacementSeverity,
    imbalanceSeverity,
    level,
  }
}
