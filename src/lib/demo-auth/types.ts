export type DemoRole =
  | 'CLIENT'
  | 'ADVOCATE'
  | 'FIRM_MEMBER'
  | 'FIRM_ADMIN'
  | 'REVIEWER'
  | 'ADMIN'
  | 'COMPLIANCE_ADMIN'
  | 'SUPER_ADMIN'

export type DemoVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED' | 'FLAGGED'

export type DemoUser = {
  id: string
  name: string
  email: string
  role: DemoRole
  verificationStatus?: DemoVerificationStatus
  firmName?: string
}

export type DemoSession = {
  user: DemoUser
  createdAt: string
  expiresAt?: string
}
