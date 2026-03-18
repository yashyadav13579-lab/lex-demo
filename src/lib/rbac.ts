type Role = 'CLIENT' | 'ADVOCATE' | 'FIRM_MEMBER' | 'FIRM_ADMIN' | 'REVIEWER' | 'ADMIN' | 'COMPLIANCE_ADMIN' | 'SUPER_ADMIN'

export const roleHierarchy: Record<Role, number> = {
  CLIENT: 1,
  ADVOCATE: 2,
  FIRM_MEMBER: 3,
  FIRM_ADMIN: 4,
  REVIEWER: 5,
  ADMIN: 6,
  COMPLIANCE_ADMIN: 7,
  SUPER_ADMIN: 8
}

export function hasRole(userRole: Role, minimum: Role) {
  return roleHierarchy[userRole] >= roleHierarchy[minimum]
}

export function requiresRoles(userRole: Role, allowed: Role[]) {
  return allowed.includes(userRole)
}
