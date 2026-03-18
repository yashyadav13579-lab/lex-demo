import { NextResponse } from 'next/server'
import { createMatter } from '@/services/matter'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { apiError, apiSuccess, parseQueryLimit } from '@/lib/api-response'
import { buildMatterAccessWhere, requireSessionUser } from '@/lib/api-auth'

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
  const rawStatus = searchParams.get('status')?.toUpperCase()
  const status = rawStatus && MATTER_STATUSES.includes(rawStatus as MatterStatus) ? (rawStatus as MatterStatus) : null

  const where = {
    ...buildMatterAccessWhere(auth.user),
    ...(status ? { status } : {})
  }

  const matters = await prisma.matter.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take: limit,
    include: {
      client: { select: { id: true, name: true, email: true } },
      primaryAdvocate: { select: { id: true, name: true, email: true } },
      _count: { select: { evidenceItems: true, drafts: true, tasks: true } }
    }
  })

  return apiSuccess({ items: matters })
}

export async function POST(request: Request) {
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_ADMIN', 'FIRM_MEMBER', 'SUPER_ADMIN'])
  if (auth.errorResponse) return auth.errorResponse

  const body = await request.json().catch(() => null)
  const parsed = matterSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, 'Invalid matter payload', 'INVALID_PAYLOAD')
  }

  try {
    const matter = await createMatter({
      title: parsed.data.title,
      description: parsed.data.description,
      clientId: parsed.data.clientId,
      primaryAdvocateId: auth.user.id,
      firmId: parsed.data.firmId,
      proBono: parsed.data.proBono,
      actorId: auth.user.id
    })

    return NextResponse.json(matter, { status: 201 })
  } catch {
    return apiError(500, 'Unable to create matter right now', 'INTERNAL_ERROR')
  }
}
