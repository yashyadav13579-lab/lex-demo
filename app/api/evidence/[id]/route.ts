import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/api-response'
import { assertMatterAccess, requireSessionUser } from '@/lib/api-auth'
import { z } from 'zod'
import { createRequestContext, finalizeRequest } from '@/lib/request-context'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { runWithIdempotency } from '@/lib/idempotency'

const evidencePatchSchema = z
  .object({
    filename: z.string().trim().min(1).optional(),
    workingUrl: z.string().trim().min(1).nullable().optional(),
    tags: z.array(z.string()).optional()
  })
  .refine((val) => Object.keys(val).length > 0, { message: 'At least one field is required' })

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireSessionUser([
    'CLIENT',
    'ADVOCATE',
    'FIRM_MEMBER',
    'FIRM_ADMIN',
    'REVIEWER',
    'ADMIN',
    'COMPLIANCE_ADMIN',
    'SUPER_ADMIN'
  ])
  if (auth.errorResponse) return auth.errorResponse

  const item = await prisma.evidenceItem.findUnique({
    where: { id: params.id },
    include: {
      matter: { select: { id: true, title: true, status: true } },
      uploadedBy: { select: { id: true, name: true, email: true, role: true } },
      versions: { orderBy: { createdAt: 'desc' } }
    }
  })
  if (!item) return apiError(404, 'Evidence item not found', 'NOT_FOUND')

  const access = await assertMatterAccess(auth.user, item.matterId, false)
  if (access.errorResponse) return access.errorResponse

  return apiSuccess(item)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const context = createRequestContext(request, 'PATCH /api/evidence/:id')
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return finalizeRequest(context, auth.errorResponse)

  const rate = checkRateLimit(`mut:${auth.user.id}:${getClientIp(request)}:evidence:update`, 90, 60_000)
  if (!rate.allowed) return finalizeRequest(context, apiError(429, 'Too many requests. Try again shortly.', 'BAD_REQUEST'))

  const body = await request.json().catch(() => null)
  const parsed = evidencePatchSchema.safeParse(body)
  if (!parsed.success) {
    return finalizeRequest(context, apiError(400, 'Invalid evidence update payload', 'INVALID_PAYLOAD'))
  }

  const item = await prisma.evidenceItem.findUnique({
    where: { id: params.id },
    select: { id: true, matterId: true }
  })
  if (!item) return finalizeRequest(context, apiError(404, 'Evidence item not found', 'NOT_FOUND'))

  const access = await assertMatterAccess(auth.user, item.matterId, true)
  if (access.errorResponse) return finalizeRequest(context, access.errorResponse)

  const idempotencyKey = request.headers.get('idempotency-key')
  try {
    const result = await runWithIdempotency({
      route: '/api/evidence/:id',
      method: 'PATCH',
      actorKey: auth.user.id,
      key: idempotencyKey,
      payload: { id: params.id, ...parsed.data },
      execute: async () => {
        const updated = await prisma.evidenceItem.update({
          where: { id: params.id },
          data: parsed.data
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
    return finalizeRequest(context, apiError(500, 'Unable to update evidence right now', 'INTERNAL_ERROR'))
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const context = createRequestContext(_request, 'DELETE /api/evidence/:id')
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return finalizeRequest(context, auth.errorResponse)

  const rate = checkRateLimit(`mut:${auth.user.id}:${getClientIp(_request)}:evidence:delete`, 60, 60_000)
  if (!rate.allowed) return finalizeRequest(context, apiError(429, 'Too many requests. Try again shortly.', 'BAD_REQUEST'))

  const item = await prisma.evidenceItem.findUnique({
    where: { id: params.id },
    select: { id: true, matterId: true }
  })
  if (!item) return finalizeRequest(context, apiError(404, 'Evidence item not found', 'NOT_FOUND'))

  const access = await assertMatterAccess(auth.user, item.matterId, true)
  if (access.errorResponse) return finalizeRequest(context, access.errorResponse)

  const idempotencyKey = _request.headers.get('idempotency-key')
  try {
    const result = await runWithIdempotency({
      route: '/api/evidence/:id',
      method: 'DELETE',
      actorKey: auth.user.id,
      key: idempotencyKey,
      payload: { id: params.id, action: 'delete' },
      execute: async () => {
        await prisma.evidenceItem.delete({ where: { id: params.id } })
        return { status: 200, body: { ok: true, data: { deleted: true, id: params.id } } }
      }
    })
    const response = new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { 'content-type': 'application/json' }
    })
    if (result.replayed) response.headers.set('x-idempotent-replay', 'true')
    return finalizeRequest(context, response, { replayed: result.replayed })
  } catch {
    return finalizeRequest(context, apiError(500, 'Unable to delete evidence right now', 'INTERNAL_ERROR'))
  }
}
