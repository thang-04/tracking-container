type VoyageLike = {
  status: "draft" | "planned" | "loading" | "departed" | "arrived" | "cancelled"
  updatedAt: string
}

const STATUS_PRIORITY: Record<VoyageLike["status"], number> = {
  loading: 0,
  departed: 1,
  planned: 2,
  draft: 3,
  arrived: 4,
  cancelled: 5,
}

export function selectActiveVoyage<T extends VoyageLike>(voyages: T[]) {
  if (voyages.length === 0) {
    return null
  }

  return [...voyages].sort((left, right) => {
    const statusDiff = STATUS_PRIORITY[left.status] - STATUS_PRIORITY[right.status]

    if (statusDiff !== 0) {
      return statusDiff
    }

    return Date.parse(right.updatedAt) - Date.parse(left.updatedAt)
  })[0]
}
