import { getOptionalPrismaClient } from "@/lib/prisma"
import { CustomsStatus } from "@/lib/generated/prisma/enums"

export type CustomsFileData = {
  id: string
  shipmentId: string
  declarationNumber: string
  status: string
  submissionDate: string
  approvalDate: string | null
  goods: string
  value: number
}

export type CustomsStats = {
  totalDeclarations: number
  approvedDeclarations: number
  pendingDeclarations: number
  rejectedDeclarations: number
  totalValue: number
  monthlyApprovals: number
  averageProcessingTime: number
}

export async function getCustomsData() {
  const prisma = getOptionalPrismaClient()
  if (!prisma) {
    return { files: [], stats: createEmptyStats() }
  }

  const containers = await prisma.container.findMany({
    include: {
      containerType: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  const files: CustomsFileData[] = containers.map(c => ({
    id: c.id,
    shipmentId: c.containerNo,
    declarationNumber: c.billNo || "N/A",
    status: mapCustomsStatus(c.customsStatus),
    submissionDate: c.createdAt.toISOString().split('T')[0],
    approvalDate: c.customsStatus === "cleared" ? c.updatedAt.toISOString().split('T')[0] : null,
    goods: c.containerType.name,
    value: 0, // No value in DB yet
  }))

  const stats: CustomsStats = {
    totalDeclarations: containers.length,
    approvedDeclarations: containers.filter(c => c.customsStatus === "cleared").length,
    pendingDeclarations: containers.filter(c => c.customsStatus === "pending").length,
    rejectedDeclarations: containers.filter(c => c.customsStatus === "hold").length,
    totalValue: 0,
    monthlyApprovals: 0,
    averageProcessingTime: 0,
  }

  return { files, stats }
}

function mapCustomsStatus(status: CustomsStatus): string {
  switch (status) {
    case "cleared": return "Đã thông quan"
    case "pending": return "Đang xử lý"
    case "hold": return "Chờ cải chính"
    default: return status
  }
}

function createEmptyStats(): CustomsStats {
  return {
    totalDeclarations: 0,
    approvedDeclarations: 0,
    pendingDeclarations: 0,
    rejectedDeclarations: 0,
    totalValue: 0,
    monthlyApprovals: 0,
    averageProcessingTime: 0,
  }
}
