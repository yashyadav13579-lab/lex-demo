import { NextResponse } from 'next/server'
import { registerEvidence } from '@/services/evidence'
import { z } from 'zod'
import { apiError, apiPaginatedSuccess, parseQueryLimit, parseQueryOffset } from '@/lib/api-response'
import { assertMatterAccess, buildMatterAccessWhere, hasGlobalScope, requireSessionUser } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const evidenceSchema = z.object({
  matterId: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  storageUrl: z.string().min(1),
  tags: z.array(z.string()).optional(),
  base64: z.string().optional()
})

export async function POST(request: Request) {
  const auth = await requireSessionUser(['CLIENT', 'ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return auth.errorResponse

  const body = await request.json().catch(() => null)
  const parsed = evidenceSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, 'Invalid evidence payload', 'INVALID_PAYLOAD')
  }

  const access = await assertMatterAccess(auth.user, parsed.data.matterId, true)
  if (access.errorResponse) return access.errorResponse

  const { matterId, filename, mimeType, sizeBytes, storageUrl, tags, base64 } = parsed.data

  const buffer = base64 ? Buffer.from(base64, 'base64') : undefined
  let evidence
  try {
    evidence = await registerEvidence({
      matterId,
      uploadedById: auth.user.id,
      filename,
      mimeType,
      sizeBytes,
      storageUrl,
      buffer,
      tags
    })
  } catch {
    return apiError(500, 'Unable to register evidence right now', 'INTERNAL_ERROR')
  }

  return NextResponse.json(evidence)
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
      prisma.evidenceItem.count({ where }),
      prisma.evidenceItem.findMany({
        where,
        include: {
          matter: { select: { id: true, title: true, status: true } },
          uploadedBy: { select: { id: true, name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      })
    ])

    return apiPaginatedSuccess(items, { limit, offset, total })
  } catch {
    return apiError(500, 'Unable to fetch evidence right now', 'INTERNAL_ERROR')
  }
}
