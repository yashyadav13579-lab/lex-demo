import { NextResponse } from 'next/server'
import { createMatter } from '@/services/matter'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { apiError, apiPaginatedSuccess, parseQueryLimit, parseQueryOffset } from '@/lib/api-response'
import { buildMatterAccessWhere, requireSessionUser } from '@/lib/api-auth'
import { createRequestContext, finalizeRequest } from '@/lib/request-context'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { runWithIdempotency } from '@/lib/idempotency'

const matterSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(4000).optional(),
  clientId: z.string().min(1).optional(),
  firmId: z.string().min(1).optional(),
  proBono: z.boolean().optional()
})

const MATTER_STATUSES = ['DRAFT', 'OPEN', 'PAUSED', 'CLOSED', 'ARCHIVED'] as const
type MatterStatus = (typeof MATTER_STATUSES)[number]

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url)
  const limit = parseQueryLimit(searchParams)
  const offset = parseQueryOffset(searchParams)
  const rawStatus = searchParams.get('status')?.toUpperCase()
  const status = rawStatus && MATTER_STATUSES.includes(rawStatus as MatterStatus) ? (rawStatus as MatterStatus) : null

  const where = {
    ...buildMatterAccessWhere(auth.user),
    ...(status ? { status } : {})
  }

  try {
    const [total, matters] = await Promise.all([
      prisma.matter.count({ where }),
      prisma.matter.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          client: { select: { id: true, name: true, email: true } },
          primaryAdvocate: { select: { id: true, name: true, email: true } },
          _count: { select: { evidenceItems: true, drafts: true, tasks: true } }
        }
      })
    ])

    return apiPaginatedSuccess(matters, { limit, offset, total })
  } catch {
    return apiError(500, 'Unable to fetch matters right now', 'INTERNAL_ERROR')
  }
}

export async function POST(request: Request) {
  const context = createRequestContext(request, 'POST /api/matters')
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_ADMIN', 'FIRM_MEMBER', 'SUPER_ADMIN'])
  if (auth.errorResponse) return finalizeRequest(context, auth.errorResponse, { auth: 'failed' })

  const rate = checkRateLimit(`mut:${auth.user.id}:${getClientIp(request)}:matters:create`, 60, 60_000)
  if (!rate.allowed) {
    return finalizeRequest(context, apiError(429, 'Too many requests. Try again shortly.', 'BAD_REQUEST'))
  }

  const body = await request.json().catch(() => null)
  const parsed = matterSchema.safeParse(body)
  if (!parsed.success) {
    return finalizeRequest(context, apiError(400, 'Invalid matter payload', 'INVALID_PAYLOAD'))
  }

  const idempotencyKey = request.headers.get('idempotency-key')
  try {
    const result = await runWithIdempotency({
      route: '/api/matters',
      method: 'POST',
      actorKey: auth.user.id,
      key: idempotencyKey,
      payload: parsed.data,
      execute: async () => {
        const matter = await createMatter({
          title: parsed.data.title,
          description: parsed.data.description,
          clientId: parsed.data.clientId,
          primaryAdvocateId: auth.user.id,
          firmId: parsed.data.firmId,
          proBono: parsed.data.proBono,
          actorId: auth.user.id
        })
        return { status: 201, body: matter }
      }
    })

    const response = NextResponse.json(result.body, { status: result.status })
    if (result.replayed) response.headers.set('x-idempotent-replay', 'true')
    return finalizeRequest(context, response, { replayed: result.replayed })
  } catch {
    return finalizeRequest(context, apiError(500, 'Unable to create matter right now', 'INTERNAL_ERROR'))
  }
}
