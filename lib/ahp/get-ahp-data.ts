export type AHPCriterion = {
  id: string
  name: string
  description: string
}

export type AHPComparisonScale = {
  value: string
  label: string
}

export const defaultCriteria: AHPCriterion[] = [
  { id: "cost", name: "Chi phí", description: "Chi phí vận chuyển và vận hành" },
  { id: "time", name: "Thời gian", description: "Thời gian giao hàng và vận chuyển" },
  { id: "reliability", name: "Độ tin cậy", description: "Tỷ lệ giao hàng đúng hẹn" },
  { id: "capacity", name: "Công suất", description: "Khả năng xử lý khối lượng" },
  { id: "flexibility", name: "Linh hoạt", description: "Khả năng thích ứng tuyến và lịch trình" },
]

export const comparisonScale: AHPComparisonScale[] = [
  { value: "9", label: "9 - Cực kỳ quan trọng hơn" },
  { value: "7", label: "7 - Rất quan trọng hơn" },
  { value: "5", label: "5 - Quan trọng hơn" },
  { value: "3", label: "3 - Hơi quan trọng hơn" },
  { value: "1", label: "1 - Bằng nhau" },
  { value: "1/3", label: "1/3 - Hơi kém quan trọng" },
  { value: "1/5", label: "1/5 - Kém quan trọng hơn" },
  { value: "1/7", label: "1/7 - Rất kém quan trọng" },
  { value: "1/9", label: "1/9 - Cực kỳ kém quan trọng" },
]

export async function getAHPData() {
  // In a real scenario, we could fetch these from the DB
  // For now, we return the defaults
  return {
    criteria: defaultCriteria,
    comparisonScale: comparisonScale,
  }
}
