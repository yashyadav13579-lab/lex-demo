import { Prisma, PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_AUTH_ENABLED === 'true'
const prismaLogLevels: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']

function createDemoPrismaStub(): PrismaClient {
  return new Proxy(
    {},
    {
      get() {
        throw new Error('Prisma is disabled in demo mode.')
      }
    }
  ) as PrismaClient
}

function getOrCreatePrismaClient() {
  if (isDemoMode) return createDemoPrismaStub()
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({ log: prismaLogLevels })
  }
  return globalForPrisma.prisma
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getOrCreatePrismaClient() as object, prop, receiver)
  }
})
