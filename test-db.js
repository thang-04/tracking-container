import { PrismaClient } from "./lib/generated/prisma/index.js"

const prisma = new PrismaClient()

async function main() {
  const containers = await prisma.container.findMany({
    select: {
      containerNo: true,
      currentVoyageId: true,
      shippingLine: { select: { name: true } },
    },
    take: 10
  })
  console.log(containers)
}
main().finally(() => prisma.$disconnect())
