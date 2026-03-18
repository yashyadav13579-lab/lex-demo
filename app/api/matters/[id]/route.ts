import { prisma } from '@/lib/prisma'
import { apiError, apiSuccess } from '@/lib/api-response'
import { assertMatterAccess, requireSessionUser } from '@/lib/api-auth'

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
}
