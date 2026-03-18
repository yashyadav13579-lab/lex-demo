import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/api-response'
import { assertMatterAccess, requireSessionUser } from '@/lib/api-auth'
import { z } from 'zod'

const evidencePatchSchema = z
  .object({
    filename: z.string().trim().min(1).optional(),
    workingUrl: z.string().trim().min(1).nullable().optional(),
    tags: z.array(z.string()).optional()
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

  const item = await prisma.evidenceItem.findUnique({
    where: { id: params.id },
    include: {
      matter: { select: { id: true, title: true, status: true } },
      uploadedBy: { select: { id: true, name: true, email: true, role: true } },
      versions: { orderBy: { createdAt: 'desc' } }
    }
  })
  if (!item) return apiError(404, 'Evidence item not found', 'NOT_FOUND')

  const access = await assertMatterAccess(auth.user, item.matterId, false)
  if (access.errorResponse) return access.errorResponse

  return apiSuccess(item)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return auth.errorResponse

  const body = await request.json().catch(() => null)
  const parsed = evidencePatchSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, 'Invalid evidence update payload', 'INVALID_PAYLOAD')
  }

  const item = await prisma.evidenceItem.findUnique({
    where: { id: params.id },
    select: { id: true, matterId: true }
  })
  if (!item) return apiError(404, 'Evidence item not found', 'NOT_FOUND')

  const access = await assertMatterAccess(auth.user, item.matterId, true)
  if (access.errorResponse) return access.errorResponse

  try {
    const updated = await prisma.evidenceItem.update({
      where: { id: params.id },
      data: parsed.data
    })
    return apiSuccess(updated)
  } catch {
    return apiError(500, 'Unable to update evidence right now', 'INTERNAL_ERROR')
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return auth.errorResponse

  const item = await prisma.evidenceItem.findUnique({
    where: { id: params.id },
    select: { id: true, matterId: true }
  })
  if (!item) return apiError(404, 'Evidence item not found', 'NOT_FOUND')

  const access = await assertMatterAccess(auth.user, item.matterId, true)
  if (access.errorResponse) return access.errorResponse

  try {
    await prisma.evidenceItem.delete({ where: { id: params.id } })
    return apiSuccess({ deleted: true, id: params.id })
  } catch {
    return apiError(500, 'Unable to delete evidence right now', 'INTERNAL_ERROR')
  }
}
