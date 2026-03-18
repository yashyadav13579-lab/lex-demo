import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/api-response'
import { assertMatterAccess, requireSessionUser } from '@/lib/api-auth'
import { z } from 'zod'
import { createRequestContext, finalizeRequest } from '@/lib/request-context'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { runWithIdempotency } from '@/lib/idempotency'

const draftPatchSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    template: z.string().trim().min(1).nullable().optional(),
    content: z.string().min(1).nullable().optional(),
    status: z.enum(['DRAFTING', 'NEEDS_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'LOCKED', 'EXPORTED']).optional(),
    lockedForExport: z.boolean().optional()
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

  const draft = await prisma.draftDocument.findUnique({
    where: { id: params.id },
    include: {
      matter: { select: { id: true, title: true, status: true } },
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      reviews: true,
      approvals: true
    }
  })

  if (!draft) return apiError(404, 'Draft not found', 'NOT_FOUND')

  const access = await assertMatterAccess(auth.user, draft.matterId, false)
  if (access.errorResponse) return access.errorResponse

  return apiSuccess(draft)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const context = createRequestContext(request, 'PATCH /api/drafts/:id')
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return finalizeRequest(context, auth.errorResponse)

  const rate = checkRateLimit(`mut:${auth.user.id}:${getClientIp(request)}:drafts:update`, 90, 60_000)
  if (!rate.allowed) return finalizeRequest(context, apiError(429, 'Too many requests. Try again shortly.', 'BAD_REQUEST'))

  const body = await request.json().catch(() => null)
  const parsed = draftPatchSchema.safeParse(body)
  if (!parsed.success) {
    return finalizeRequest(context, apiError(400, 'Invalid draft update payload', 'INVALID_PAYLOAD'))
  }

  const draft = await prisma.draftDocument.findUnique({
    where: { id: params.id },
    select: { id: true, matterId: true }
  })
  if (!draft) return finalizeRequest(context, apiError(404, 'Draft not found', 'NOT_FOUND'))

  const access = await assertMatterAccess(auth.user, draft.matterId, true)
  if (access.errorResponse) return finalizeRequest(context, access.errorResponse)

  const idempotencyKey = request.headers.get('idempotency-key')
  try {
    const result = await runWithIdempotency({
      route: '/api/drafts/:id',
      method: 'PATCH',
      actorKey: auth.user.id,
      key: idempotencyKey,
      payload: { id: params.id, ...parsed.data },
      execute: async () => {
        const updated = await prisma.draftDocument.update({
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
    return finalizeRequest(context, apiError(500, 'Unable to update draft right now', 'INTERNAL_ERROR'))
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const context = createRequestContext(_request, 'DELETE /api/drafts/:id')
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return finalizeRequest(context, auth.errorResponse)

  const rate = checkRateLimit(`mut:${auth.user.id}:${getClientIp(_request)}:drafts:delete`, 60, 60_000)
  if (!rate.allowed) return finalizeRequest(context, apiError(429, 'Too many requests. Try again shortly.', 'BAD_REQUEST'))

  const draft = await prisma.draftDocument.findUnique({
    where: { id: params.id },
    select: { id: true, matterId: true }
  })
  if (!draft) return finalizeRequest(context, apiError(404, 'Draft not found', 'NOT_FOUND'))

  const access = await assertMatterAccess(auth.user, draft.matterId, true)
  if (access.errorResponse) return finalizeRequest(context, access.errorResponse)

  const idempotencyKey = _request.headers.get('idempotency-key')
  try {
    const result = await runWithIdempotency({
      route: '/api/drafts/:id',
      method: 'DELETE',
      actorKey: auth.user.id,
      key: idempotencyKey,
      payload: { id: params.id, action: 'delete' },
      execute: async () => {
        await prisma.draftDocument.delete({ where: { id: params.id } })
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
    return finalizeRequest(context, apiError(500, 'Unable to delete draft right now', 'INTERNAL_ERROR'))
  }
}
