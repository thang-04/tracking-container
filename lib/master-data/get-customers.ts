import { getOptionalPrismaClient } from "@/lib/prisma"

export type CustomerRecord = {
  id: string
  code: string
  name: string
}

export async function getCustomers(): Promise<CustomerRecord[]> {
  const prisma = getOptionalPrismaClient()
  if (!prisma) return []

  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    select: { id: true, code: true, name: true }
  })

  return customers
}
