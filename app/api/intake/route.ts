import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { apiError, apiSuccess, parseQueryLimit } from '@/lib/api-response'
import { hasGlobalScope, requireSessionUser } from '@/lib/api-auth'

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
  const auth = await requireSessionUser(['CLIENT'])
  if (auth.errorResponse) return auth.errorResponse

  const body = await request.json().catch(() => null)
  const parsed = intakeSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, 'Invalid intake payload', 'INVALID_PAYLOAD')
  }

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

  return NextResponse.json(submission)
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

  const submissions = await prisma.intakeSubmission.findMany({
    where: hasGlobalScope(auth.user.role) ? {} : { clientId: auth.user.id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      matter: { select: { id: true, title: true, status: true } },
      answers: true
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })

  return apiSuccess({ items: submissions })
}
