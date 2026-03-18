'use client'

import Link from 'next/link'
import { useDemoAuth } from '@/lib/demo-auth'
import { getDemoSOSHistory } from '@/lib/demo-data'

function statusTone(status: string) {
  if (status === 'OPEN') return 'bg-red-50 text-red-700'
  if (status === 'ACKNOWLEDGED') return 'bg-amber-50 text-amber-700'
  return 'bg-emerald-50 text-emerald-700'
}

export function DemoSOSPage() {
  const { isReady, isSignedIn, session } = useDemoAuth()

  if (!isReady) return <p className="text-sm text-slate-600">Loading demo safety workspace...</p>

  if (!isSignedIn) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-2xl font-semibold">SOS</h1>
        <p className="text-slate-600">Please sign in with a demo persona to access SOS history.</p>
        <Link href="/auth/sign-in" className="inline-block rounded bg-accent px-4 py-2 text-white">
          Go to sign in
        </Link>
      </div>
    )
  }

  const role = session?.user.role
  const incidents = role ? getDemoSOSHistory(role) : []
  const openCount = incidents.filter((incident) => incident.status === 'OPEN').length
  const acknowledgedCount = incidents.filter((incident) => incident.status === 'ACKNOWLEDGED').length
  const closedCount = incidents.filter((incident) => incident.status === 'CLOSED').length

  return (
    <div className="max-w-4xl page-shell">
      <div>
        <p className="section-kicker">Advocate safety operations</p>
        <h1 className="mt-1 text-2xl font-semibold">SOS</h1>
        <p className="mt-1 text-sm text-slate-600">Preview incident handling, escalation context, and response history.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Incidents in preview</p>
          <p className="mt-2 text-2xl font-semibold">{incidents.length}</p>
          <p className="mt-1 text-xs text-slate-500">Loaded for the active demo persona.</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{role ?? 'Unavailable'}</p>
          <p className="mt-1 text-xs text-slate-500">Drives SOS visibility and response scope.</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Escalation readiness</p>
          <p className="mt-2 text-2xl font-semibold">{incidents.length > 0 ? 'Active' : 'Idle'}</p>
          <p className="mt-1 text-xs text-slate-500">Indicates whether incident trails are available.</p>
        </div>
      </div>
      <section className="section-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Incident status board</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded border bg-red-50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-700">Open</p>
            <p className="mt-1 text-2xl font-semibold text-red-700">{openCount}</p>
          </div>
          <div className="rounded border bg-amber-50 p-3">
            <p className="text-xs uppercase tracking-wide text-amber-700">Acknowledged</p>
            <p className="mt-1 text-2xl font-semibold text-amber-700">{acknowledgedCount}</p>
          </div>
          <div className="rounded border bg-emerald-50 p-3">
            <p className="text-xs uppercase tracking-wide text-emerald-700">Closed</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">{closedCount}</p>
          </div>
        </div>
      </section>
      <div className="section-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Incident history</h2>
        {incidents.length === 0 ? (
          <p className="text-sm text-slate-600">
            No SOS history is available for this demo role. Switch to an advocate or firm persona to preview.
          </p>
        ) : (
          incidents.map((incident) => (
            <div key={incident.id} className="rounded border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{incident.location}</p>
                <span className="text-xs text-slate-500">{incident.triggeredAtLabel}</span>
              </div>
              <p className="mt-1">
                <span className={`rounded px-2 py-0.5 text-xs ${statusTone(incident.status)}`}>{incident.status}</span>
              </p>
              <p className="text-sm text-slate-700 mt-2">{incident.description}</p>
            </div>
          ))
        )}
        <div className="flex gap-3 pt-1">
          <Link href="/dashboard" className="btn-primary">
            Back to dashboard
          </Link>
          <Link href="/messages" className="btn-secondary">
            Go to messages
          </Link>
        </div>
      </div>
    </div>
  )
}
