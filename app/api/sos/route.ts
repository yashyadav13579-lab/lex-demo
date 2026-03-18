import { NextResponse } from 'next/server'
import { createSOSIncident } from '@/services/sos'
import { z } from 'zod'
import { apiError, apiPaginatedSuccess, parseQueryLimit, parseQueryOffset } from '@/lib/api-response'
import { hasGlobalScope, requireSessionUser } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'
import { createRequestContext, finalizeRequest } from '@/lib/request-context'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { runWithIdempotency } from '@/lib/idempotency'

const sosSchema = z.object({
  description: z.string().trim().max(1000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
})

export async function POST(request: Request) {
  const context = createRequestContext(request, 'POST /api/sos')
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return finalizeRequest(context, auth.errorResponse)

  const rate = await checkRateLimit(`mut:${auth.user.id}:${getClientIp(request)}:sos:create`, 20, 60_000)
  if (!rate.allowed) {
    return finalizeRequest(context, apiError(429, 'Too many requests. Try again shortly.', 'BAD_REQUEST'))
  }

  const body = await request.json().catch(() => null)
  const parsed = sosSchema.safeParse(body)
  if (!parsed.success) {
    return finalizeRequest(context, apiError(400, 'Invalid incident payload', 'INVALID_PAYLOAD'))
  }

  const idempotencyKey = request.headers.get('idempotency-key')
  try {
    const result = await runWithIdempotency({
      route: '/api/sos',
      method: 'POST',
      actorKey: auth.user.id,
      key: idempotencyKey,
      payload: parsed.data,
      execute: async () => {
        const incident = await createSOSIncident({
          advocateId: auth.user.id,
          description: parsed.data.description,
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude
        })
        return { status: 200, body: incident }
      }
    })
    const response = NextResponse.json(result.body, { status: result.status })
    if (result.replayed) response.headers.set('x-idempotent-replay', 'true')
    return finalizeRequest(context, response, { replayed: result.replayed })
  } catch {
    return finalizeRequest(context, apiError(500, 'Unable to create SOS incident right now', 'INTERNAL_ERROR'))
  }
}

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const limit = parseQueryLimit(searchParams)
  const offset = parseQueryOffset(searchParams)

  const where = hasGlobalScope(auth.user.role) ? {} : { advocateId: auth.user.id }

  try {
    const [total, incidents] = await Promise.all([
      prisma.sOSIncident.count({ where }),
      prisma.sOSIncident.findMany({
        where,
        include: {
          advocate: { select: { id: true, name: true, email: true, role: true } },
          media: true
        },
        orderBy: { triggeredAt: 'desc' },
        skip: offset,
        take: limit
      })
    ])

    return apiPaginatedSuccess(incidents, { limit, offset, total })
  } catch {
    return apiError(500, 'Unable to fetch SOS incidents right now', 'INTERNAL_ERROR')
  }
}
