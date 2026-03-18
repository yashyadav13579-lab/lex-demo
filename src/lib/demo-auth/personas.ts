import type { DemoRole, DemoSession, DemoUser, DemoVerificationStatus } from './types'

export type DemoPersona = DemoUser & {
  description: string
}

function makePersona(params: {
  id: string
  name: string
  email: string
  role: DemoRole
  description: string
  verificationStatus?: DemoVerificationStatus
  firmName?: string
}) {
  return params
}

export const DEMO_PERSONAS: DemoPersona[] = [
  makePersona({
    id: 'demo-advocate-1',
    name: 'Aarav Mehta',
    email: 'advocate.demo@lexsovereign.local',
    role: 'ADVOCATE',
    verificationStatus: 'VERIFIED',
    firmName: 'Mehta Chambers',
    description: 'Advocate demo account with SOS and drafting access.'
  }),
  makePersona({
    id: 'demo-client-1',
    name: 'Priya Sharma',
    email: 'client.demo@lexsovereign.local',
    role: 'CLIENT',
    verificationStatus: 'VERIFIED',
    description: 'Client demo account for intake and matter participation.'
  }),
  makePersona({
    id: 'demo-firm-admin-1',
    name: 'Rohan Kapoor',
    email: 'firmadmin.demo@lexsovereign.local',
    role: 'FIRM_ADMIN',
    verificationStatus: 'VERIFIED',
    firmName: 'Kapoor Legal LLP',
    description: 'Firm admin demo account for team-facing navigation.'
  }),
  makePersona({
    id: 'demo-compliance-1',
    name: 'Neha Iyer',
    email: 'compliance.demo@lexsovereign.local',
    role: 'COMPLIANCE_ADMIN',
    verificationStatus: 'VERIFIED',
    description: 'Compliance/admin demo account for oversight-oriented UI.'
  })
]

export function createDemoSessionForPersona(persona: DemoPersona): DemoSession {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 8 * 60 * 60 * 1000)
  return {
    user: {
      id: persona.id,
      name: persona.name,
      email: persona.email,
      role: persona.role,
      verificationStatus: persona.verificationStatus,
      firmName: persona.firmName
    },
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  }
}
