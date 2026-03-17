import { prisma } from '@/lib/prisma'
import { AuditAction, Prisma } from '@prisma/client'

export async function recordAudit(params: {
  actorId?: string
  action: AuditAction
  entityType: string
  entityId: string
  meta?: Prisma.JsonValue
}) {
  return prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      meta: params.meta
    }
  })
}
