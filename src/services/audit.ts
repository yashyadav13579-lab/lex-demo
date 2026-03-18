import { prisma } from '@/lib/prisma'

type AuditAction =
  | 'VERIFICATION_DECISION'
  | 'PROFILE_UPDATE'
  | 'MATTER_ASSIGNMENT_CHANGE'
  | 'EVIDENCE_EXPORT'
  | 'DRAFT_APPROVAL'
  | 'SOS_ACCESS'
  | 'ADMIN_ACTION'
  | 'SUBSCRIPTION_CHANGE'
  | 'CORRECTION_DECISION'
  | 'LAWFUL_PROCESS_ACTION'

export async function recordAudit(params: {
  actorId?: string
  action: AuditAction
  entityType: string
  entityId: string
  meta?: Record<string, unknown> | unknown[] | string | number | boolean | null
}) {
  return prisma.auditLog.create({
    data: {
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      meta: params.meta as never
    }
  })
}
