import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { apiError, apiPaginatedSuccess, parseQueryLimit, parseQueryOffset } from '@/lib/api-response'
import { hasGlobalScope, requireSessionUser } from '@/lib/api-auth'
import { createRequestContext, finalizeRequest } from '@/lib/request-context'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { runWithIdempotency } from '@/lib/idempotency'

const intakeSchema = z.object({
  issueCategory: z.string().trim().min(2).max(120),
  urgency: z.string().trim().min(1).max(40).optional(),
  answers: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.string().max(5000)
      })
    )
    .optional()
})

export async function POST(request: Request) {
  const context = createRequestContext(request, 'POST /api/intake')
  const auth = await requireSessionUser(['CLIENT'])
  if (auth.errorResponse) return finalizeRequest(context, auth.errorResponse)

  const rate = checkRateLimit(`mut:${auth.user.id}:${getClientIp(request)}:intake:create`, 30, 60_000)
  if (!rate.allowed) {
    return finalizeRequest(context, apiError(429, 'Too many requests. Try again shortly.', 'BAD_REQUEST'))
  }

  const body = await request.json().catch(() => null)
  const parsed = intakeSchema.safeParse(body)
  if (!parsed.success) {
    return finalizeRequest(context, apiError(400, 'Invalid intake payload', 'INVALID_PAYLOAD'))
  }

  const idempotencyKey = request.headers.get('idempotency-key')
  try {
    const result = await runWithIdempotency({
      route: '/api/intake',
      method: 'POST',
      actorKey: auth.user.id,
      key: idempotencyKey,
      payload: parsed.data,
      execute: async () => {
        const submission = await prisma.intakeSubmission.create({
          data: {
            clientId: auth.user.id,
            issueCategory: parsed.data.issueCategory,
            urgency: parsed.data.urgency,
            answers: {
              create: (parsed.data.answers || []).map((ans) => ({
                questionKey: ans.key,
                answer: ans.value
              }))
            }
          }
        })
        return { status: 200, body: submission }
      }
    })
    const response = NextResponse.json(result.body, { status: result.status })
    if (result.replayed) response.headers.set('x-idempotent-replay', 'true')
    return finalizeRequest(context, response, { replayed: result.replayed })
  } catch {
    return finalizeRequest(context, apiError(500, 'Unable to submit intake right now', 'INTERNAL_ERROR'))
  }
}

export async function GET(request: Request) {
  const auth = await requireSessionUser([
    'CLIENT',
    'REVIEWER',
    'ADMIN',
    'COMPLIANCE_ADMIN',
    'SUPER_ADMIN'
  ])
  if (auth.errorResponse) return auth.errorResponse

  const { searchParams } = new URL(request.url)
  const limit = parseQueryLimit(searchParams)
  const offset = parseQueryOffset(searchParams)

  const where = hasGlobalScope(auth.user.role) ? {} : { clientId: auth.user.id }

  try {
    const [total, submissions] = await Promise.all([
      prisma.intakeSubmission.count({ where }),
      prisma.intakeSubmission.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true } },
          matter: { select: { id: true, title: true, status: true } },
          answers: true
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      })
    ])

    return apiPaginatedSuccess(submissions, { limit, offset, total })
  } catch {
    return apiError(500, 'Unable to fetch intake submissions right now', 'INTERNAL_ERROR')
  }
}
