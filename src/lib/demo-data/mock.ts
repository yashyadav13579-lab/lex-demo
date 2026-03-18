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
  {
    title: 'SOS',
    href: '/sos',
    description: 'Safety alert trigger and incident operations',
    roles: ['ADVOCATE', 'FIRM_ADMIN', 'FIRM_MEMBER', 'SUPER_ADMIN']
  }
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
  const cards = DASHBOARD_CARDS.filter(
    (card) => !card.roles || card.roles.includes(user.role) || user.role === 'SUPER_ADMIN'
  )

  if (user.role === 'CLIENT') {
    return {
      role: user.role,
      cards,
      roleSummary: {
        title: 'Client command view',
        detail: 'Track your submissions, matter progress, and legal communication in one controlled workspace.'
      },
      queue: [
        { label: 'Active matters', count: 1 },
        { label: 'Pending messages', count: 1 },
        { label: 'Open intake drafts', count: 1 }
      ],
      urgentActions: [
        {
          title: 'Complete intake evidence checklist',
          detail: 'Two supporting files are still missing before advocate review.',
          priority: 'High',
          href: '/intake'
        },
        {
          title: 'Respond to advocate clarifications',
          detail: 'One thread is waiting for your confirmation on filing chronology.',
          priority: 'Medium',
          href: '/messages'
        }
      ],
      moduleOverview: [
        { module: 'Matters', metricLabel: 'Active', value: '1', status: 'Stable', href: '/matters' },
        { module: 'Messages', metricLabel: 'Unread', value: '1', status: 'Attention', href: '/messages' },
        { module: 'Evidence', metricLabel: 'Pending uploads', value: '2', status: 'Attention', href: '/evidence' },
        { module: 'Drafts', metricLabel: 'Shared drafts', value: '0', status: 'Monitoring', href: '/drafts' }
      ],
      recentActivity: [
        {
          id: 'activity-client-1',
          title: 'Intake packet updated',
          detail: 'Issue chronology and contact details were revised for review.',
          occurredAt: 'Today, 10:15'
        },
        {
          id: 'activity-client-2',
          title: 'Matter status changed to hearing prep',
          detail: 'Your assigned advocate advanced the matter workflow.',
          occurredAt: 'Yesterday, 18:30'
        }
      ],
      nextSteps: [
        { label: 'Continue intake', href: '/intake' },
        { label: 'Open matter timeline', href: '/matters' }
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
      roleSummary: {
        title: user.role === 'ADVOCATE' ? 'Advocate command view' : 'Chamber operations view',
        detail:
          user.role === 'ADVOCATE'
            ? 'Coordinate active matters, review drafts, and maintain evidence integrity.'
            : 'Monitor shared workloads, reviewer queues, and team-level legal execution quality.'
      },
      queue: [
        { label: 'Open matters', count: 3 },
        { label: 'Drafts pending review', count: 2 },
        { label: 'Unread messages', count: 4 }
      ],
      urgentActions: [
        {
          title: 'Review two draft filings before release window',
          detail: 'Validation sign-off is required to keep hearing schedule on track.',
          priority: 'High',
          href: '/drafts'
        },
        {
          title: 'Resolve evidence provenance warning',
          detail: 'One uploaded exhibit needs source metadata completion.',
          priority: 'Medium',
          href: '/evidence'
        },
        {
          title: 'Confirm late-hour court escort protocol',
          detail: 'SOS safety note awaits acknowledgement.',
          priority: 'Routine',
          href: '/sos'
        }
      ],
      moduleOverview: [
        { module: 'Matters', metricLabel: 'Open', value: '3', status: 'Stable', href: '/matters' },
        { module: 'Drafts', metricLabel: 'Pending review', value: '2', status: 'Attention', href: '/drafts' },
        { module: 'Evidence', metricLabel: 'Integrity flags', value: '1', status: 'Attention', href: '/evidence' },
        { module: 'Messages', metricLabel: 'Unread', value: '4', status: 'Monitoring', href: '/messages' },
        { module: 'SOS', metricLabel: 'Open incidents', value: '1', status: 'Monitoring', href: '/sos' }
      ],
      recentActivity: [
        {
          id: 'activity-adv-1',
          title: 'Draft marked for legal validation',
          detail: 'Interim relief motion moved to reviewer queue.',
          occurredAt: 'Today, 09:40'
        },
        {
          id: 'activity-adv-2',
          title: 'Evidence bundle updated',
          detail: 'Hash and witness statement metadata were refreshed.',
          occurredAt: 'Today, 08:10'
        },
        {
          id: 'activity-adv-3',
          title: 'Client clarification received',
          detail: 'Message thread linked to Matter #LS-2041.',
          occurredAt: 'Yesterday, 17:20'
        }
      ],
      nextSteps: [
        { label: 'Open review queue', href: '/drafts' },
        { label: 'Check integrity alerts', href: '/evidence' },
        { label: 'Return to matter list', href: '/matters' }
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
    roleSummary: {
      title: 'Governance command view',
      detail: 'Oversee verification, compliance posture, and escalated operational risk across workspaces.'
    },
    queue: [
      { label: 'Verification queue', count: 5 },
      { label: 'Compliance flags', count: 2 },
      { label: 'Pending admin actions', count: 3 }
    ],
    urgentActions: [
      {
        title: 'Review verification decisions awaiting closure',
        detail: 'Five profiles require final adjudication.',
        priority: 'High',
        href: '/dashboard'
      },
      {
        title: 'Inspect two compliance exceptions',
        detail: 'Draft export controls triggered policy review.',
        priority: 'Medium',
        href: '/drafts'
      }
    ],
    moduleOverview: [
      { module: 'Matters', metricLabel: 'Audited', value: '2', status: 'Stable', href: '/matters' },
      { module: 'Messages', metricLabel: 'Escalated', value: '1', status: 'Monitoring', href: '/messages' },
      { module: 'Evidence', metricLabel: 'Flags', value: '2', status: 'Attention', href: '/evidence' },
      { module: 'Drafts', metricLabel: 'Policy holds', value: '1', status: 'Attention', href: '/drafts' },
      { module: 'SOS', metricLabel: 'Reviewed incidents', value: '1', status: 'Monitoring', href: '/sos' }
    ],
    recentActivity: [
      {
        id: 'activity-admin-1',
        title: 'Compliance exception logged',
        detail: 'Manual review opened for high-risk export request.',
        occurredAt: 'Today, 11:05'
      },
      {
        id: 'activity-admin-2',
        title: 'Verification decision recorded',
        detail: 'Advocate identity status moved to verified.',
        occurredAt: 'Yesterday, 16:42'
      }
    ],
    nextSteps: [
      { label: 'Open verification queue', href: '/dashboard' },
      { label: 'Inspect draft controls', href: '/drafts' }
    ]
  }
}
