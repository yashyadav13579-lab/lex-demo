import { NextResponse } from 'next/server'
import { generateDraft } from '@/services/ai'
import { z } from 'zod'
import { apiError, apiPaginatedSuccess, parseQueryLimit, parseQueryOffset } from '@/lib/api-response'
import { assertMatterAccess, buildMatterAccessWhere, hasGlobalScope, requireSessionUser } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const draftSchema = z.object({
  matterId: z.string().min(1),
  title: z.string().trim().min(3).max(200),
  template: z.string().trim().min(1).optional(),
  context: z.unknown().optional()
})

export async function POST(request: Request) {
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return auth.errorResponse

  const body = await request.json().catch(() => null)
  const parsed = draftSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, 'Invalid draft payload', 'INVALID_PAYLOAD')
  }

  const access = await assertMatterAccess(auth.user, parsed.data.matterId, true)
  if (access.errorResponse) return access.errorResponse

  let draft
  try {
    draft = await generateDraft({
      matterId: parsed.data.matterId,
      createdById: auth.user.id,
      title: parsed.data.title,
      template: parsed.data.template,
      context: parsed.data.context as Record<string, unknown> | unknown[] | string | number | boolean | null | undefined
    })
  } catch {
    return apiError(500, 'Unable to generate draft right now', 'INTERNAL_ERROR')
  }

  return NextResponse.json(draft)
}

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
  const matterId = searchParams.get('matterId')

  if (matterId) {
    const access = await assertMatterAccess(auth.user, matterId, false)
    if (access.errorResponse) return access.errorResponse
  }

  const where = {
    ...(matterId ? { matterId } : {}),
    ...(hasGlobalScope(auth.user.role) ? {} : { matter: buildMatterAccessWhere(auth.user) })
  }

  try {
    const [total, items] = await Promise.all([
      prisma.draftDocument.count({ where }),
      prisma.draftDocument.findMany({
        where,
        include: {
          matter: { select: { id: true, title: true, status: true } },
          createdBy: { select: { id: true, name: true, email: true } }
        },
        orderBy: { updatedAt: 'desc' },
        skip: offset,
        take: limit
      })
    ])

    return apiPaginatedSuccess(items, { limit, offset, total })
  } catch {
    return apiError(500, 'Unable to fetch drafts right now', 'INTERNAL_ERROR')
  }
}
