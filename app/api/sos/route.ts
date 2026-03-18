import { NextResponse } from 'next/server'
import { createSOSIncident } from '@/services/sos'
import { z } from 'zod'
import { apiError, apiPaginatedSuccess, parseQueryLimit, parseQueryOffset } from '@/lib/api-response'
import { hasGlobalScope, requireSessionUser } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const sosSchema = z.object({
  description: z.string().trim().max(1000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
})

export async function POST(request: Request) {
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return auth.errorResponse

  const body = await request.json().catch(() => null)
  const parsed = sosSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, 'Invalid incident payload', 'INVALID_PAYLOAD')
  }

  let incident
  try {
    incident = await createSOSIncident({
      advocateId: auth.user.id,
      description: parsed.data.description,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude
    })
  } catch {
    return apiError(500, 'Unable to create SOS incident right now', 'INTERNAL_ERROR')
  }

  return NextResponse.json(incident)
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
