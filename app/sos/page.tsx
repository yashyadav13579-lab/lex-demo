import Link from 'next/link'
import { isDemoAuthEnabled } from '@/lib/demo-auth'
import { DemoSOSPage } from './demo-page'

export default function SOSPage() {
  if (isDemoAuthEnabled()) {
    return <DemoSOSPage />
  }

  return (
    <div className="max-w-4xl page-shell">
      <div>
        <p className="section-kicker">Advocate safety operations</p>
        <h1 className="mt-1 text-2xl font-semibold">SOS</h1>
        <p className="mt-1 text-sm text-slate-600">
          Incident-aware safety coordination for legal teams handling urgent field or hearing-related risk.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Open incidents</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Events requiring active response.</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Escalations</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Forwarded to chamber admin or ops lead.</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Resolved (30d)</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Closed and documented incidents.</p>
        </div>
      </div>

      <section className="section-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Incident status board</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded border bg-red-50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-700">Open</p>
            <p className="mt-1 text-sm text-red-800">Awaiting initial response and acknowledgement.</p>
          </div>
          <div className="rounded border bg-amber-50 p-3">
            <p className="text-xs uppercase tracking-wide text-amber-700">Acknowledged</p>
            <p className="mt-1 text-sm text-amber-800">Response owner assigned and action in progress.</p>
          </div>
          <div className="rounded border bg-emerald-50 p-3">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Closed</p>
            <p className="mt-1 text-sm text-emerald-800">Incident resolved with post-event documentation.</p>
          </div>
        </div>
      </section>

      <div className="section-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">No incidents recorded yet</h2>
        <p className="text-sm text-slate-600">
          SOS records will appear when safety events are triggered. This module is designed for response visibility,
          escalation handling, and post-incident documentation.
        </p>
        <div className="rounded border bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Expected module surfaces</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Incident timeline with status transitions</li>
            <li>Escalation chain and assignee visibility</li>
            <li>Post-incident notes linked to matter context where relevant</li>
          </ul>
        </div>
        <div className="rounded border bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Response documentation cues</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Location and trigger timestamp</li>
            <li>Assigned responder and acknowledgement time</li>
            <li>Closure note and follow-up requirement</li>
          </ul>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/messages" className="btn-primary">
            Open messages for coordination
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
