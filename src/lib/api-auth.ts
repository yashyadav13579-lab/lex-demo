import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requiresRoles } from '@/lib/rbac'
import { apiError } from '@/lib/api-response'

export type AppRole =
  | 'CLIENT'
  | 'ADVOCATE'
  | 'FIRM_MEMBER'
  | 'FIRM_ADMIN'
  | 'REVIEWER'
  | 'ADMIN'
  | 'COMPLIANCE_ADMIN'
  | 'SUPER_ADMIN'

type SessionUser = {
  id: string
  role: AppRole
}

const GLOBAL_SCOPE_ROLES: AppRole[] = ['ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN']
const MATTER_WRITE_ROLES: AppRole[] = ['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'ADMIN', 'COMPLIANCE_ADMIN', 'SUPER_ADMIN']

export function hasGlobalScope(role: AppRole) {
  return GLOBAL_SCOPE_ROLES.includes(role)
}

export async function requireSessionUser(allowedRoles?: AppRole[]) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || !session.user.role) {
    return { errorResponse: apiError(401, 'Unauthorized', 'UNAUTHORIZED') }
  }

  const user = { id: session.user.id, role: session.user.role as AppRole } satisfies SessionUser
  if (allowedRoles && !requiresRoles(user.role, allowedRoles)) {
    return { errorResponse: apiError(403, 'Forbidden', 'FORBIDDEN') }
  }

  return { user }
}

export function buildMatterAccessWhere(user: SessionUser) {
  if (hasGlobalScope(user.role)) return {}

  if (user.role === 'CLIENT') {
    return { clientId: user.id }
  }

  return {
    OR: [
      { primaryAdvocateId: user.id },
      { assignments: { some: { userId: user.id } } },
      { firm: { members: { some: { userId: user.id, status: 'active' } } } }
    ]
  }
}

export async function assertMatterAccess(user: SessionUser, matterId: string, write = false) {
  if (write && !MATTER_WRITE_ROLES.includes(user.role)) {
    return { errorResponse: apiError(403, 'Forbidden', 'FORBIDDEN') }
  }

  const where = {
    id: matterId,
    ...buildMatterAccessWhere(user)
  }

  const matter = await prisma.matter.findFirst({
    where,
    select: { id: true, firmId: true, clientId: true, primaryAdvocateId: true }
  })

  if (!matter) {
    return { errorResponse: apiError(404, 'Matter not found', 'NOT_FOUND') }
  }

  return { matter }
}
