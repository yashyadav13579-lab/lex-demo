import { prisma } from '../src/lib/prisma'
import { Role } from '@prisma/client'
import { hash } from 'bcryptjs'

async function main() {
  const adminEmail = 'admin@lexsovereign.local'
  const adminPassword = await hash('admin123', 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      passwordHash: adminPassword,
      role: Role.SUPER_ADMIN
    }
  })

  await prisma.subscriptionPlan.upsert({
    where: { id: 'plan-solo' },
    update: {},
    create: {
      id: 'plan-solo',
      name: 'Solo Advocate',
      priceCents: 3900,
      interval: 'monthly',
      features: ['Verified profile', 'Matter workspace', 'Evidence hashing', 'AI drafting gate']
    }
  })

  await prisma.subscriptionPlan.upsert({
    where: { id: 'plan-firm' },
    update: {},
    create: {
      id: 'plan-firm',
      name: 'Chambers / Firm',
      priceCents: 9900,
      interval: 'monthly',
      features: ['Team roles', 'Shared matters', 'Review queues', 'Admin console']
    }
  })

  console.log('Seed complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
