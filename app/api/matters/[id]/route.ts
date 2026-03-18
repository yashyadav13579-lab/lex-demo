import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/api-response'
import { assertMatterAccess, requireSessionUser } from '@/lib/api-auth'
import { z } from 'zod'
import { createRequestContext, finalizeRequest } from '@/lib/request-context'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { runWithIdempotency } from '@/lib/idempotency'

const matterPatchSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().max(4000).nullable().optional(),
    status: z.enum(['DRAFT', 'OPEN', 'PAUSED', 'CLOSED', 'ARCHIVED']).optional(),
    proBono: z.boolean().optional()
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

  const access = await assertMatterAccess(auth.user, params.id, false)
  if (access.errorResponse) return access.errorResponse

  try {
    const matter = await prisma.matter.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        primaryAdvocate: { select: { id: true, name: true, email: true } },
        assignments: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        },
        parties: { orderBy: { id: 'asc' } },
        notes: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        events: { orderBy: { createdAt: 'desc' }, take: 100 },
        tasks: {
          include: { assignee: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
          take: 100
        },
        _count: {
          select: {
            evidenceItems: true,
            drafts: true,
            notes: true,
            tasks: true,
            events: true
          }
        }
      }
    })

    if (!matter) {
      return apiError(404, 'Matter not found', 'NOT_FOUND')
    }

    return apiSuccess(matter)
  } catch {
    return apiError(500, 'Unable to fetch matter right now', 'INTERNAL_ERROR')
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const context = createRequestContext(request, 'PATCH /api/matters/:id')
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return finalizeRequest(context, auth.errorResponse)

  const access = await assertMatterAccess(auth.user, params.id, true)
  if (access.errorResponse) return finalizeRequest(context, access.errorResponse)

  const rate = await checkRateLimit(`mut:${auth.user.id}:${getClientIp(request)}:matters:update`, 90, 60_000)
  if (!rate.allowed) {
    return finalizeRequest(context, apiError(429, 'Too many requests. Try again shortly.', 'BAD_REQUEST'))
  }

  const body = await request.json().catch(() => null)
  const parsed = matterPatchSchema.safeParse(body)
  if (!parsed.success) {
    return finalizeRequest(context, apiError(400, 'Invalid matter update payload', 'INVALID_PAYLOAD'))
  }

  const idempotencyKey = request.headers.get('idempotency-key')
  try {
    const result = await runWithIdempotency({
      route: '/api/matters/:id',
      method: 'PATCH',
      actorKey: auth.user.id,
      key: idempotencyKey,
      payload: { id: params.id, ...parsed.data },
      execute: async () => {
        const updated = await prisma.matter.update({
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
    return finalizeRequest(context, apiError(500, 'Unable to update matter right now', 'INTERNAL_ERROR'))
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const context = createRequestContext(_request, 'DELETE /api/matters/:id')
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return finalizeRequest(context, auth.errorResponse)

  const access = await assertMatterAccess(auth.user, params.id, true)
  if (access.errorResponse) return finalizeRequest(context, access.errorResponse)

  const rate = await checkRateLimit(`mut:${auth.user.id}:${getClientIp(_request)}:matters:delete`, 60, 60_000)
  if (!rate.allowed) {
    return finalizeRequest(context, apiError(429, 'Too many requests. Try again shortly.', 'BAD_REQUEST'))
  }

  const idempotencyKey = _request.headers.get('idempotency-key')

  try {
    const result = await runWithIdempotency({
      route: '/api/matters/:id',
      method: 'DELETE',
      actorKey: auth.user.id,
      key: idempotencyKey,
      payload: { id: params.id, action: 'archive' },
      execute: async () => {
        const archived = await prisma.matter.update({
          where: { id: params.id },
          data: { status: 'ARCHIVED' }
        })
        return { status: 200, body: { ok: true, data: archived } }
      }
    })
    const response = new Response(JSON.stringify(result.body), {
      status: result.status,
      headers: { 'content-type': 'application/json' }
    })
    if (result.replayed) response.headers.set('x-idempotent-replay', 'true')
    return finalizeRequest(context, response, { replayed: result.replayed })
  } catch {
    return finalizeRequest(context, apiError(500, 'Unable to archive matter right now', 'INTERNAL_ERROR'))
  }
}
