import Link from 'next/link'
import { isDemoAuthEnabled } from '@/lib/demo-auth'
import { DemoMessagesPage } from './demo-page'

export default function MessagesPage() {
  if (isDemoAuthEnabled()) {
    return <DemoMessagesPage />
  }

  return (
    <div className="max-w-4xl page-shell">
      <div>
        <p className="section-kicker">Secure collaboration workspace</p>
        <h1 className="mt-1 text-2xl font-semibold">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">
          Matter-linked communication for advocates, clients, and team members with legal workflow context.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Open threads</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Active conversations with unresolved actions.</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Unread</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">New communication requiring review.</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Matter-linked</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Threads currently attached to matters.</p>
        </div>
      </div>

      <section className="section-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Collaboration channels</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded border bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Matter thread</p>
            <p className="mt-1 text-sm text-slate-700">Primary legal discussion for a specific matter.</p>
          </div>
          <div className="rounded border bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Evidence clarification</p>
            <p className="mt-1 text-sm text-slate-700">Requests related to exhibits, provenance, and access trail.</p>
          </div>
          <div className="rounded border bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Coordination note</p>
            <p className="mt-1 text-sm text-slate-700">Operational updates between advocates, clients, and chamber staff.</p>
          </div>
        </div>
      </section>

      <div className="section-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">No communication threads yet</h2>
        <p className="text-sm text-slate-600">
          Messages become available when a matter conversation is initiated. This workspace is designed for legal
          context continuity rather than informal chat.
        </p>
        <div className="rounded border bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Expected module surfaces</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Matter-linked thread list with participant roles</li>
            <li>Unread and pending-response indicators</li>
            <li>Escalation path into SOS or evidence workflow when needed</li>
          </ul>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/matters" className="btn-primary">
            Open matters to start a thread
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
