import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/api-response'
import { assertMatterAccess, requireSessionUser } from '@/lib/api-auth'
import { z } from 'zod'

const matterPatchSchema = z
  .object({
    title: z.string().trim().min(3).max(200).optional(),
    description: z.string().trim().max(4000).nullable().optional(),
    status: z.enum(['DRAFT', 'OPEN', 'PAUSED', 'CLOSED', 'ARCHIVED']).optional(),
    proBono: z.boolean().optional()
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

  const access = await assertMatterAccess(auth.user, params.id, false)
  if (access.errorResponse) return access.errorResponse

  try {
    const matter = await prisma.matter.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, name: true, email: true } },
        primaryAdvocate: { select: { id: true, name: true, email: true } },
        assignments: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
          orderBy: { createdAt: 'asc' }
        },
        parties: { orderBy: { id: 'asc' } },
        notes: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        events: { orderBy: { createdAt: 'desc' }, take: 100 },
        tasks: {
          include: { assignee: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'desc' },
          take: 100
        },
        _count: {
          select: {
            evidenceItems: true,
            drafts: true,
            notes: true,
            tasks: true,
            events: true
          }
        }
      }
    })

    if (!matter) {
      return apiError(404, 'Matter not found', 'NOT_FOUND')
    }

    return apiSuccess(matter)
  } catch {
    return apiError(500, 'Unable to fetch matter right now', 'INTERNAL_ERROR')
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return auth.errorResponse

  const access = await assertMatterAccess(auth.user, params.id, true)
  if (access.errorResponse) return access.errorResponse

  const body = await request.json().catch(() => null)
  const parsed = matterPatchSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, 'Invalid matter update payload', 'INVALID_PAYLOAD')
  }

  try {
    const updated = await prisma.matter.update({
      where: { id: params.id },
      data: parsed.data
    })
    return apiSuccess(updated)
  } catch {
    return apiError(500, 'Unable to update matter right now', 'INTERNAL_ERROR')
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const auth = await requireSessionUser(['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN'])
  if (auth.errorResponse) return auth.errorResponse

  const access = await assertMatterAccess(auth.user, params.id, true)
  if (access.errorResponse) return access.errorResponse

  try {
    const archived = await prisma.matter.update({
      where: { id: params.id },
      data: { status: 'ARCHIVED' }
    })
    return apiSuccess(archived)
  } catch {
    return apiError(500, 'Unable to archive matter right now', 'INTERNAL_ERROR')
  }
}
