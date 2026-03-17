import { Role } from '@prisma/client'

export const roleHierarchy: Record<Role, number> = {
  [Role.CLIENT]: 1,
  [Role.ADVOCATE]: 2,
  [Role.FIRM_MEMBER]: 3,
  [Role.FIRM_ADMIN]: 4,
  [Role.REVIEWER]: 5,
  [Role.ADMIN]: 6,
  [Role.COMPLIANCE_ADMIN]: 7,
  [Role.SUPER_ADMIN]: 8
}

export function hasRole(userRole: Role, minimum: Role) {
  return roleHierarchy[userRole] >= roleHierarchy[minimum]
}

export function requiresRoles(userRole: Role, allowed: Role[]) {
  return allowed.includes(userRole)
}
