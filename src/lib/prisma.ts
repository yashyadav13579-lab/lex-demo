import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined }
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_AUTH_ENABLED === 'true'

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

export const prisma =
  globalForPrisma.prisma ??
  (isDemoMode
    ? createDemoPrismaStub()
    : new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
      }))

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
