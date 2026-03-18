import { prisma } from '@/lib/prisma'
import { recordAudit } from './audit'

type MatterTx = {
  matter: {
    create: typeof prisma.matter.create
  }
  matterAssignment: {
    create: typeof prisma.matterAssignment.create
  }
  auditLog: {
    create: typeof prisma.auditLog.create
  }
}

export async function createMatter(params: {
  title: string
  description?: string
  clientId?: string
  primaryAdvocateId: string
  firmId?: string
  proBono?: boolean
  actorId: string
}) {
  const matter = await prisma.$transaction(async (tx: MatterTx) => {
    const createdMatter = await tx.matter.create({
      data: {
        title: params.title,
        description: params.description,
        clientId: params.clientId,
        primaryAdvocateId: params.primaryAdvocateId,
        firmId: params.firmId,
        proBono: params.proBono ?? false,
        status: 'OPEN'
      }
    })

    await tx.matterAssignment.create({
      data: {
        matterId: createdMatter.id,
        userId: params.primaryAdvocateId,
        role: 'LEAD',
        addedById: params.actorId
      }
    })

    await recordAudit({
      actorId: params.actorId,
      action: 'MATTER_ASSIGNMENT_CHANGE',
      entityType: 'Matter',
      entityId: createdMatter.id,
      meta: { description: 'Matter created' },
      db: tx
    })

    return createdMatter
  })

  return matter
}

export async function addMatterEvent(params: {
  matterId: string
  type: string
  description?: string
  occursAt?: Date
  actorId?: string
}) {
  const event = await prisma.matterEvent.create({
    data: {
      matterId: params.matterId,
      type: params.type,
      description: params.description,
      occursAt: params.occursAt,
      createdById: params.actorId
    }
  })
  return event
}
