import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { recordAudit } from './audit'

export async function createMatter(params: {
  title: string
  description?: string
  clientId?: string
  primaryAdvocateId: string
  firmId?: string
  proBono?: boolean
  actorId: string
}) {
  const matter = await prisma.matter.create({
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

  await prisma.matterAssignment.create({
    data: {
      matterId: matter.id,
      userId: params.primaryAdvocateId,
      role: 'LEAD',
      addedById: params.actorId
    }
  })

  await recordAudit({
    actorId: params.actorId,
    action: 'MATTER_ASSIGNMENT_CHANGE',
    entityType: 'Matter',
    entityId: matter.id,
    meta: { description: 'Matter created' }
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
