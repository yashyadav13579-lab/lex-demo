import type { DemoRole, DemoVerificationStatus } from '@/lib/demo-auth'

export type DemoMatter = {
  id: string
  title: string
  status: 'OPEN' | 'PAUSED' | 'DRAFT' | 'CLOSED'
  clientName: string
  primaryAdvocateName: string
  nextMilestone: string
}

export type DemoMessageThread = {
  id: string
  subject: string
  participantLabel: string
  lastMessagePreview: string
  updatedAtLabel: string
}

export type DemoSOSIncident = {
  id: string
  status: 'OPEN' | 'ACKNOWLEDGED' | 'CLOSED'
  triggeredAtLabel: string
  location: string
  description: string
}

export type DemoDashboardQueueItem = {
  label: string
  count: number
}

export type DemoDashboardCard = {
  title: string
  href: string
  description: string
  roles?: DemoRole[]
}

export type DemoAdvocateProfileSummary = {
  headline: string
  verificationStatus: DemoVerificationStatus
  firmName?: string
  practiceAreas: string[]
}

export type DemoClientBriefSummary = {
  activeMatters: number
  openIntakes: number
  note: string
}

export type DemoDashboardSnapshot = {
  role: DemoRole
  cards: DemoDashboardCard[]
  queue: DemoDashboardQueueItem[]
  roleSummary: {
    title: string
    detail: string
  }
  urgentActions: Array<{
    title: string
    detail: string
    priority: 'High' | 'Medium' | 'Routine'
    href: string
  }>
  moduleOverview: Array<{
    module: 'Matters' | 'Evidence' | 'Drafts' | 'Messages' | 'SOS'
    metricLabel: string
    value: string
    status: 'Attention' | 'Stable' | 'Monitoring'
    href: string
  }>
  recentActivity: Array<{
    id: string
    title: string
    detail: string
    occurredAt: string
  }>
  nextSteps: Array<{
    label: string
    href: string
  }>
  advocateProfile?: DemoAdvocateProfileSummary
  clientBrief?: DemoClientBriefSummary
}
