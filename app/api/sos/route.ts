import { NextResponse } from 'next/server'
import { createSOSIncident } from '@/services/sos'
import { z } from 'zod'
import { apiError, apiSuccess, parseQueryLimit } from '@/lib/api-response'
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

  const incident = await createSOSIncident({
    advocateId: auth.user.id,
    description: parsed.data.description,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude
  })

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

  const incidents = await prisma.sOSIncident.findMany({
    where: hasGlobalScope(auth.user.role) ? {} : { advocateId: auth.user.id },
    include: {
      advocate: { select: { id: true, name: true, email: true, role: true } },
      media: true
    },
    orderBy: { triggeredAt: 'desc' },
    take: limit
  })

  return apiSuccess({ items: incidents })
}
