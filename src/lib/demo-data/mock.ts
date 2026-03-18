import type { DemoRole, DemoUser } from '@/lib/demo-auth'
import type {
  DemoDashboardCard,
  DemoDashboardSnapshot,
  DemoMatter,
  DemoMessageThread,
  DemoSOSIncident
} from './types'

const MATTERS: DemoMatter[] = [
  {
    id: 'matter-demo-001',
    title: 'Sharma v. Apex Housing Board',
    status: 'OPEN',
    clientName: 'Priya Sharma',
    primaryAdvocateName: 'Aarav Mehta',
    nextMilestone: 'Interim hearing on 22 Apr'
  },
  {
    id: 'matter-demo-002',
    title: 'Kapoor Chambers Contract Review',
    status: 'PAUSED',
    clientName: 'Kapoor Legal LLP',
    primaryAdvocateName: 'Aarav Mehta',
    nextMilestone: 'Counterparty revisions pending'
  },
  {
    id: 'matter-demo-003',
    title: 'Tenant Relief Petition',
    status: 'DRAFT',
    clientName: 'Rahul Nair',
    primaryAdvocateName: 'Aarav Mehta',
    nextMilestone: 'Draft filing under review'
  }
]

const MESSAGES: DemoMessageThread[] = [
  {
    id: 'thread-demo-001',
    subject: 'Interim relief draft',
    participantLabel: 'Priya Sharma + Aarav Mehta',
    lastMessagePreview: 'Please confirm the revised prayer section before filing.',
    updatedAtLabel: 'Today, 09:40'
  },
  {
    id: 'thread-demo-002',
    subject: 'Evidence bundle sequencing',
    participantLabel: 'Case team',
    lastMessagePreview: 'Hash report and witness statement are now attached.',
    updatedAtLabel: 'Yesterday, 17:20'
  }
]

const SOS_HISTORY: DemoSOSIncident[] = [
  {
    id: 'sos-demo-001',
    status: 'CLOSED',
    triggeredAtLabel: '11 Mar, 19:10',
    location: 'Bengaluru City Civil Court',
    description: 'Late-evening adjournment escort requested and resolved.'
  },
  {
    id: 'sos-demo-002',
    status: 'ACKNOWLEDGED',
    triggeredAtLabel: '07 Mar, 21:25',
    location: 'Client site visit, Indiranagar',
    description: 'Check-in alert acknowledged by firm response contact.'
  }
]

const DASHBOARD_CARDS: DemoDashboardCard[] = [
  { title: 'Matters', href: '/matters', description: 'View and manage matters' },
  { title: 'Evidence', href: '/evidence', description: 'Uploads, hashes, and chain-of-custody' },
  { title: 'Drafts', href: '/drafts', description: 'AI-assisted drafts with validation' },
  { title: 'Messages', href: '/messages', description: 'Secure messaging' },
  { title: 'SOS', href: '/sos', description: 'Safety alert trigger and history', role: 'ADVOCATE' }
]

function isFirmRole(role: DemoRole) {
  return role === 'FIRM_ADMIN' || role === 'FIRM_MEMBER'
}

export function getDemoMattersForRole(role: DemoRole) {
  if (role === 'CLIENT') return MATTERS.filter((matter) => matter.clientName === 'Priya Sharma')
  if (role === 'COMPLIANCE_ADMIN' || role === 'ADMIN' || role === 'SUPER_ADMIN' || role === 'REVIEWER') {
    return MATTERS.slice(0, 2)
  }
  return MATTERS
}

export function getDemoMatterById(id: string, role: DemoRole) {
  const matters = getDemoMattersForRole(role)
  return matters.find((matter) => matter.id === id) ?? matters[0] ?? null
}

export function getDemoMessageThreads(role: DemoRole) {
  if (role === 'CLIENT') return MESSAGES.slice(0, 1)
  if (isFirmRole(role)) return MESSAGES
  if (role === 'ADVOCATE') return MESSAGES
  return MESSAGES.slice(0, 1)
}

export function getDemoSOSHistory(role: DemoRole) {
  if (role === 'ADVOCATE' || isFirmRole(role)) return SOS_HISTORY
  return []
}

export function getDemoDashboardSnapshot(user: DemoUser): DemoDashboardSnapshot {
  const cards =
    user.role === 'SUPER_ADMIN'
      ? DASHBOARD_CARDS
      : DASHBOARD_CARDS.filter((card) => !card.role || card.role === user.role)

  if (user.role === 'CLIENT') {
    return {
      role: user.role,
      cards,
      queue: [
        { label: 'Active matters', count: 1 },
        { label: 'Pending messages', count: 1 },
        { label: 'Open intake drafts', count: 1 }
      ],
      clientBrief: {
        activeMatters: 1,
        openIntakes: 1,
        note: 'Upload identity documents before next hearing.'
      }
    }
  }

  if (user.role === 'ADVOCATE' || isFirmRole(user.role)) {
    return {
      role: user.role,
      cards,
      queue: [
        { label: 'Open matters', count: 3 },
        { label: 'Drafts pending review', count: 2 },
        { label: 'Unread messages', count: 4 }
      ],
      advocateProfile: {
        headline: 'Civil litigation and contract disputes',
        verificationStatus: user.verificationStatus ?? 'VERIFIED',
        firmName: user.firmName,
        practiceAreas: ['Civil', 'Commercial', 'Consumer']
      }
    }
  }

  return {
    role: user.role,
    cards,
    queue: [
      { label: 'Verification queue', count: 5 },
      { label: 'Compliance flags', count: 2 },
      { label: 'Pending admin actions', count: 3 }
    ]
  }
}
