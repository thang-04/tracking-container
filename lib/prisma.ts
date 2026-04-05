import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "./generated/prisma/client"

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    return null
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  })
}

declare const globalThis: {
  prismaGlobal?: PrismaClient | null;
} & typeof global;

function getOrCreatePrismaClient() {
  if (typeof globalThis.prismaGlobal !== "undefined") {
    return globalThis.prismaGlobal
  }

  const prisma = prismaClientSingleton()

  if (process.env.NODE_ENV !== "production") {
    globalThis.prismaGlobal = prisma
  }

  return prisma
}

export function getOptionalPrismaClient() {
  return getOrCreatePrismaClient()
}

function getRequiredPrismaClient() {
  const prisma = getOrCreatePrismaClient()

  if (!prisma) {
    throw new Error("DATABASE_URL is required to initialize PrismaClient")
  }

  return prisma
}

const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getRequiredPrismaClient()
    const value = Reflect.get(client, property)

    return typeof value === "function" ? value.bind(client) : value
  },
})

export default prisma
