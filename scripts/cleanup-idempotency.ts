import { prisma } from '@/lib/prisma'

async function main() {
  const ttlHours = Number.parseInt(process.env.IDEMPOTENCY_TTL_HOURS || '168', 10)
  const cutoff = new Date(Date.now() - ttlHours * 60 * 60 * 1000)

  const result = await prisma.apiIdempotencyKey.deleteMany({
    where: {
      createdAt: {
        lt: cutoff
      }
    }
  })

  console.log(
    JSON.stringify({
      ok: true,
      ttlHours,
      cutoff: cutoff.toISOString(),
      deletedCount: result.count
    })
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
