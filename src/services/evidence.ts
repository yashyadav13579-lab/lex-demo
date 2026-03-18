import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { recordAudit } from './audit'

type EvidenceSource = 'CLIENT_UPLOAD' | 'ADVOCATE_UPLOAD' | 'SYSTEM_GENERATED' | 'IMPORTED'
type AccessEventType = 'VIEW' | 'DOWNLOAD' | 'EXPORT' | 'SHARE'

export function hashBuffer(buffer: Buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

export async function registerEvidence(params: {
  matterId: string
  uploadedById: string
  filename: string
  mimeType: string
  sizeBytes: number
  source?: EvidenceSource
  storageUrl: string
  buffer?: Buffer
  tags?: string[]
}) {
  const hash = params.buffer ? hashBuffer(params.buffer) : crypto.randomBytes(16).toString('hex')

  const evidence = await prisma.evidenceItem.create({
    data: {
      matterId: params.matterId,
      uploadedById: params.uploadedById,
      source: params.source ?? 'ADVOCATE_UPLOAD',
      hash,
      originalUrl: params.storageUrl,
      filename: params.filename,
      mimeType: params.mimeType,
      sizeBytes: params.sizeBytes,
      tags: params.tags ?? []
    }
  })

  await recordAudit({
    actorId: params.uploadedById,
    action: 'EVIDENCE_EXPORT',
    entityType: 'EvidenceItem',
    entityId: evidence.id,
    meta: { hash }
  })

  return evidence
}

export async function logEvidenceAccess(params: {
  evidenceItemId: string
  userId?: string
  eventType: AccessEventType
  meta?: Record<string, unknown>
}) {
  return prisma.evidenceAccessLog.create({
    data: {
      evidenceItemId: params.evidenceItemId,
      userId: params.userId,
      eventType: params.eventType,
      meta: params.meta
    }
  })
}
