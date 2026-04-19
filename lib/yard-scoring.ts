// Soft Constraint Yard Optimization - Scoring System
// Based on priority rules with weighted scoring instead of strict validation

import type { Stack, Container, YardBlock, DischargeStatus } from "./yard-types"

// Score levels for UI display
export type ScoreLevel = "optimal" | "acceptable" | "suboptimal" | "critical"

export interface StackScore {
  total: number
  level: ScoreLevel
  breakdown: {
    rehandle: number
    weight: number
    grouping: number
    zone: number
  }
  violations: StackViolation[]
  suggestions: string[]
}

export interface StackViolation {
  type: "rehandle" | "weight" | "grouping" | "zone"
  severity: "low" | "medium" | "high" | "critical"
  message: string
  tier?: number
}

// Scoring configuration per specification
const SCORES = {
  // Positive scores
  NO_REHANDLE: 50,
  CORRECT_WEIGHT: 30,
  SAME_VESSEL: 10,
  CORRECT_ZONE: 10,
  
  // Penalties
  REHANDLE_PER_CONTAINER: -40,
  WEIGHT_VIOLATION: -15,
  GROUP_MISMATCH: -5,
}

// Score level thresholds
const LEVEL_THRESHOLDS = {
  optimal: 80,    // 80+ = Green (Tốt)
  acceptable: 50, // 50-79 = Yellow (Chấp nhận được)  
  suboptimal: 20, // 20-49 = Orange (Cần cải thiện)
  // Below 20 = Red (Nghiêm trọng)
}

// Calculate maximum potential score for a stack
function getMaxScore(containerCount: number): number {
  if (containerCount === 0) return 100
  return SCORES.NO_REHANDLE + SCORES.CORRECT_WEIGHT + SCORES.SAME_VESSEL + SCORES.CORRECT_ZONE
}

// Calculate rehandle score for stack based on ETD ordering
// Rule: Container xuất sớm không được nằm dưới container xuất muộn
function calculateRehandleScore(stack: Stack): { 
  score: number
  violations: StackViolation[] 
  suggestions: string[]
} {
  const containerTiers = stack.tiers
    .filter(t => t.container !== null)
    .sort((a, b) => a.tier - b.tier) // Sort by tier (bottom to top)
  
  if (containerTiers.length <= 1) {
    return { score: SCORES.NO_REHANDLE, violations: [], suggestions: [] }
  }

  const violations: StackViolation[] = []
  const suggestions: string[] = []
  let totalRehandleMoves = 0
  const blockedContainers: string[] = []
  
  // Check each container pair for ETD violations
  // Container with earlier ETD should be above container with later ETD
  for (let i = 0; i < containerTiers.length - 1; i++) {
    const lowerContainer = containerTiers[i].container
    const lowerTier = containerTiers[i].tier
    
    if (!lowerContainer) continue
    
    // Check if this container is blocked by containers above
    const containersAbove = containerTiers.filter(t => t.tier > lowerTier && t.container !== null)
    
    // Check ETD-based blocking
    const lowerETD = (lowerContainer as Container & { etd?: Date }).etd
    if (lowerETD) {
      for (const upperSlot of containersAbove) {
        const upperContainer = upperSlot.container
        const upperETD = (upperContainer as Container & { etd?: Date })?.etd
        
        // If lower container departs before upper container = violation
        if (upperETD && lowerETD < upperETD) {
          totalRehandleMoves++
          blockedContainers.push(upperContainer?.containerNo ?? "Unknown")
        }
      }
    } else {
      // No ETD info - count all containers above as potential rehandles
      totalRehandleMoves += containersAbove.length > 0 ? 1 : 0
    }
  }
  
  // Generate violations and suggestions
  if (totalRehandleMoves > 2) {
    violations.push({
      type: "rehandle",
      severity: "critical",
      message: `Vị trí này sẽ gây ${totalRehandleMoves} rehandle (nghiêm trọng)`,
    })
    suggestions.push("Cần tổ chức lại stack theo thứ tự ETD")
  } else if (totalRehandleMoves > 0) {
    violations.push({
      type: "rehandle",
      severity: totalRehandleMoves === 1 ? "low" : "medium",
      message: `Vị trí này sẽ gây ${totalRehandleMoves} rehandle`,
    })
  }
  
  if (blockedContainers.length > 0) {
    suggestions.push(`Container bị chặn: ${blockedContainers.slice(0, 2).join(", ")}`)
  }
  
  const penalty = Math.min(totalRehandleMoves, 3) * Math.abs(SCORES.REHANDLE_PER_CONTAINER)
  const score = totalRehandleMoves === 0 ? SCORES.NO_REHANDLE : Math.max(-penalty, -120)
  
  return { score, violations, suggestions }
}

// Calculate weight stacking score with soft constraints
function calculateWeightScore(stack: Stack): {
  score: number
  violations: StackViolation[]
  suggestions: string[]
} {
  const containers = stack.tiers
    .filter(t => t.container !== null)
    .map(t => ({ tier: t.tier, container: t.container! }))
    .sort((a, b) => a.tier - b.tier)
  
  if (containers.length <= 1) {
    return { score: SCORES.CORRECT_WEIGHT, violations: [], suggestions: [] }
  }
  
  const violations: StackViolation[] = []
  const suggestions: string[] = []
  let violationCount = 0
  
  for (let i = 0; i < containers.length - 1; i++) {
    const lower = containers[i]
    const upper = containers[i + 1]
    const lowerWeight = lower.container.weight ?? 0
    const upperWeight = upper.container.weight ?? 0
    
    if (upperWeight > lowerWeight) {
      violationCount++
      const weightDiff = upperWeight - lowerWeight
      const percentDiff = lowerWeight > 0 ? (weightDiff / lowerWeight) * 100 : 100
      
      // Soft constraint: Small weight difference (< 10%) is acceptable
      if (percentDiff > 20) {
        violations.push({
          type: "weight",
          severity: percentDiff > 50 ? "high" : "medium",
          tier: upper.tier,
          message: `T${String(upper.tier).padStart(2, "0")}: Container nặng (${(upperWeight/1000).toFixed(1)}T) đè container nhẹ (${(lowerWeight/1000).toFixed(1)}T)`,
        })
        suggestions.push(
          `Đề xuất: Hoán đổi ${upper.container.containerNo} với ${lower.container.containerNo}`
        )
      } else if (percentDiff > 10) {
        violations.push({
          type: "weight",
          severity: "low",
          tier: upper.tier,
          message: `T${String(upper.tier).padStart(2, "0")}: Chênh lệch trọng lượng nhỏ (chấp nhận được)`,
        })
      }
      // < 10% difference: no violation recorded (soft constraint)
    }
  }
  
  // Only apply penalty for significant violations
  const significantViolations = violations.filter(v => v.severity !== "low").length
  const score = significantViolations === 0 
    ? SCORES.CORRECT_WEIGHT 
    : Math.max(SCORES.CORRECT_WEIGHT + (significantViolations * SCORES.WEIGHT_VIOLATION), -30)
  
  return { score, violations, suggestions }
}

// Calculate vessel grouping score
function calculateGroupingScore(stack: Stack): {
  score: number
  violations: StackViolation[]
  suggestions: string[]
} {
  const containers = stack.tiers
    .filter(t => t.container !== null)
    .map(t => t.container!)
  
  if (containers.length <= 1) {
    return { score: SCORES.SAME_VESSEL, violations: [], suggestions: [] }
  }
  
  // Check if all containers belong to same trip/vessel
  const trips = new Set(containers.map(c => c.tripId).filter(Boolean))
  
  if (trips.size <= 1) {
    return { score: SCORES.SAME_VESSEL, violations: [], suggestions: [] }
  }
  
  // Mixed vessels - minor penalty, not critical
  const violations: StackViolation[] = [{
    type: "grouping",
    severity: "low",
    message: `Nhiều chuyến tàu trong stack (${trips.size} chuyến)`,
  }]
  
  return {
    score: SCORES.SAME_VESSEL + (trips.size - 1) * SCORES.GROUP_MISMATCH,
    violations,
    suggestions: [],
  }
}

// Calculate zone compliance score
function calculateZoneScore(stack: Stack, block: YardBlock): {
  score: number
  violations: StackViolation[]
  suggestions: string[]
} {
  const containers = stack.tiers
    .filter(t => t.container !== null)
    .map(t => t.container!)
  
  if (containers.length === 0) {
    return { score: SCORES.CORRECT_ZONE, violations: [], suggestions: [] }
  }
  
  // Check if containers match block type
  const violations: StackViolation[] = []
  
  for (const container of containers) {
    // DG containers should be in DG block
    if (container.status === "dangerous_goods" && block.type !== "DG") {
      violations.push({
        type: "zone",
        severity: "high",
        message: `${container.containerNo}: Hàng nguy hiểm không đúng khu vực`,
      })
    }
  }
  
  return {
    score: violations.length === 0 ? SCORES.CORRECT_ZONE : -20,
    violations,
    suggestions: violations.length > 0 ? ["Đề xuất: Di chuyển hàng nguy hiểm đến khu vực DG"] : [],
  }
}

// Main scoring function for a stack
export function calculateStackScore(stack: Stack, block: YardBlock): StackScore {
  const containerCount = stack.tiers.filter(t => t.container !== null).length
  
  // Empty stacks are optimal
  if (containerCount === 0) {
    return {
      total: 100,
      level: "optimal",
      breakdown: {
        rehandle: SCORES.NO_REHANDLE,
        weight: SCORES.CORRECT_WEIGHT,
        grouping: SCORES.SAME_VESSEL,
        zone: SCORES.CORRECT_ZONE,
      },
      violations: [],
      suggestions: [],
    }
  }
  
  const rehandleResult = calculateRehandleScore(stack)
  const weightResult = calculateWeightScore(stack)
  const groupingResult = calculateGroupingScore(stack)
  const zoneResult = calculateZoneScore(stack, block)
  
  const breakdown = {
    rehandle: rehandleResult.score,
    weight: weightResult.score,
    grouping: groupingResult.score,
    zone: zoneResult.score,
  }
  
  const rawTotal = Object.values(breakdown).reduce((a, b) => a + b, 0)
  const maxScore = getMaxScore(containerCount)
  const total = Math.max(0, Math.min(100, Math.round((rawTotal / maxScore) * 100)))
  
  // Determine level based on thresholds
  let level: ScoreLevel = "critical"
  if (total >= LEVEL_THRESHOLDS.optimal) level = "optimal"
  else if (total >= LEVEL_THRESHOLDS.acceptable) level = "acceptable"
  else if (total >= LEVEL_THRESHOLDS.suboptimal) level = "suboptimal"
  
  // Override to critical if there are critical violations
  const allViolations = [
    ...rehandleResult.violations,
    ...weightResult.violations,
    ...groupingResult.violations,
    ...zoneResult.violations,
  ]
  
  const hasCriticalViolation = allViolations.some(v => v.severity === "critical")
  if (hasCriticalViolation) level = "critical"
  
  const allSuggestions = [
    ...rehandleResult.suggestions,
    ...weightResult.suggestions,
    ...groupingResult.suggestions,
    ...zoneResult.suggestions,
  ]
  
  return {
    total,
    level,
    breakdown,
    violations: allViolations,
    suggestions: allSuggestions.slice(0, 3), // Limit suggestions
  }
}

// Get color classes for score level
export function getScoreLevelColors(level: ScoreLevel): {
  bg: string
  border: string
  text: string
  indicator: string
} {
  switch (level) {
    case "optimal":
      return {
        bg: "bg-emerald-500/20",
        border: "border-emerald-500/40",
        text: "text-emerald-400",
        indicator: "bg-emerald-500",
      }
    case "acceptable":
      return {
        bg: "bg-yellow-500/20",
        border: "border-yellow-500/40",
        text: "text-yellow-400",
        indicator: "bg-yellow-500",
      }
    case "suboptimal":
      return {
        bg: "bg-orange-500/20",
        border: "border-orange-500/40",
        text: "text-orange-400",
        indicator: "bg-orange-500",
      }
    case "critical":
      return {
        bg: "bg-red-500/20",
        border: "border-red-500/40",
        text: "text-red-400",
        indicator: "bg-red-500",
      }
  }
}

// Get label for score level
export function getScoreLevelLabel(level: ScoreLevel): string {
  switch (level) {
    case "optimal": return "Tốt"
    case "acceptable": return "Chấp nhận được"
    case "suboptimal": return "Cần cải thiện"
    case "critical": return "Nghiêm trọng"
  }
}

// Get impact level for rehandle count
export function getRehandleImpact(moves: number): "Low" | "Medium" | "High" {
  if (moves <= 1) return "Low"
  if (moves <= 2) return "Medium"
  return "High"
}

// Calculate block-level statistics
export function calculateBlockStats(block: YardBlock): {
  totalStacks: number
  optimalStacks: number
  acceptableStacks: number
  suboptimalStacks: number
  criticalStacks: number
  averageScore: number
} {
  const scores = block.stacks.map(stack => calculateStackScore(stack, block))
  
  return {
    totalStacks: scores.length,
    optimalStacks: scores.filter(s => s.level === "optimal").length,
    acceptableStacks: scores.filter(s => s.level === "acceptable").length,
    suboptimalStacks: scores.filter(s => s.level === "suboptimal").length,
    criticalStacks: scores.filter(s => s.level === "critical").length,
    averageScore: scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b.total, 0) / scores.length)
      : 100,
  }
}
