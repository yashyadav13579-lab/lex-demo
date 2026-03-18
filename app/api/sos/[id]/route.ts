import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/api-response'
import { type AppRole, hasGlobalScope, requireSessionUser } from '@/lib/api-auth'
import { z } from 'zod'
import { createRequestContext, finalizeRequest } from '@/lib/request-context'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { runWithIdempotency } from '@/lib/idempotency'

const sosPatchSchema = z
  .object({
    status: z.enum(['OPEN', 'ACKNOWLEDGED', 'CLOSED']).optional(),
    description: z.string().trim().max(1000).nullable().optional()
  })
  .refine((val) => Object.keys(val).length > 0, { message: 'At least one field is required' })

function canAccessIncident(userId: string, role: AppRole, advocateId: string) {
  return hasGlobalScope(role) || advocateId === userId
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireSessionUser([
    'ADVOCATE',
    'FIRM_MEMBER',
    'FIRM_ADMIN',
    'REVIEWER',
    'ADMIN',
    'COMPLIANCE_ADMIN',
    'SUPER_ADMIN'
  ])
  if (auth.errorResponse) return auth.errorResponse

  const incident = await prisma.sOSIncident.findUnique({
    where: { id: params.id },
    include: {
      advocate: { select: { id: true, name: true, email: true, role: true } },
      media: { orderBy: { createdAt: 'desc' } }
    }
  })
  if (!incident) return apiError(404, 'SOS incident not found', 'NOT_FOUND')

  if (!canAccessIncident(auth.user.id, auth.user.role, incident.advocateId)) {
    return apiError(404, 'SOS incident not found', 'NOT_FOUND')
  }

  return apiSuccess(incident)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const context = createRequestContext(request, 'PATCH /api/sos/:id')
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return finalizeRequest(context, auth.errorResponse)

  const rate = await checkRateLimit(`mut:${auth.user.id}:${getClientIp(request)}:sos:update`, 60, 60_000)
  if (!rate.allowed) return finalizeRequest(context, apiError(429, 'Too many requests. Try again shortly.', 'BAD_REQUEST'))

  const body = await request.json().catch(() => null)
  const parsed = sosPatchSchema.safeParse(body)
  if (!parsed.success) {
    return finalizeRequest(context, apiError(400, 'Invalid SOS update payload', 'INVALID_PAYLOAD'))
  }

  const incident = await prisma.sOSIncident.findUnique({
    where: { id: params.id },
    select: { id: true, advocateId: true }
  })
  if (!incident) return finalizeRequest(context, apiError(404, 'SOS incident not found', 'NOT_FOUND'))

  if (!canAccessIncident(auth.user.id, auth.user.role, incident.advocateId)) {
    return finalizeRequest(context, apiError(404, 'SOS incident not found', 'NOT_FOUND'))
  }

  const patchData: { status?: 'OPEN' | 'ACKNOWLEDGED' | 'CLOSED'; description?: string | null; acknowledgedAt?: Date; closedAt?: Date } =
    {}
  if (parsed.data.status) {
    patchData.status = parsed.data.status
    if (parsed.data.status === 'ACKNOWLEDGED') patchData.acknowledgedAt = new Date()
    if (parsed.data.status === 'CLOSED') patchData.closedAt = new Date()
  }
  if (Object.hasOwn(parsed.data, 'description')) patchData.description = parsed.data.description

  const idempotencyKey = request.headers.get('idempotency-key')
  try {
    const result = await runWithIdempotency({
      route: '/api/sos/:id',
      method: 'PATCH',
      actorKey: auth.user.id,
      key: idempotencyKey,
      payload: { id: params.id, ...patchData },
      execute: async () => {
        const updated = await prisma.sOSIncident.update({
          where: { id: params.id },
          data: patchData
        })
        return { status: 200, body: { ok: true, data: updated } }
      }
    })
    const response = new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { 'content-type': 'application/json' }
    })
    if (result.replayed) response.headers.set('x-idempotent-replay', 'true')
    return finalizeRequest(context, response, { replayed: result.replayed })
  } catch {
    return finalizeRequest(context, apiError(500, 'Unable to update SOS incident right now', 'INTERNAL_ERROR'))
  }
}
