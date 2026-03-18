'use client'

import Link from 'next/link'
import { useDemoAuth } from '@/lib/demo-auth'
import { getDemoMattersForRole } from '@/lib/demo-data'

function statusStyle(status: string) {
  const normalized = status.toUpperCase()
  if (normalized === 'OPEN' || normalized === 'ACTIVE') return 'bg-emerald-50 text-emerald-700'
  if (normalized === 'DRAFT' || normalized === 'PENDING') return 'bg-amber-50 text-amber-700'
  if (normalized === 'PAUSED') return 'bg-slate-100 text-slate-700'
  if (normalized === 'CLOSED') return 'bg-slate-200 text-slate-800'
  return 'bg-slate-100 text-slate-700'
}

export function DemoMattersPage() {
  const { isReady, isSignedIn, session } = useDemoAuth()

  if (!isReady) {
    return <p className="text-sm text-slate-600">Loading demo session...</p>
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-2xl font-semibold">Matters</h1>
        <p className="text-slate-600">Please sign in with a demo persona to access this page.</p>
        <Link href="/auth/sign-in" className="inline-block rounded bg-accent px-4 py-2 text-white">
          Go to sign in
        </Link>
      </div>
    )
  }

  const role = session?.user.role
  const matters = role ? getDemoMattersForRole(role) : []

  return (
    <div className="page-shell">
      <div className="page-header">
        <p className="section-kicker">Matter workspace</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Matters</h1>
            <p className="mt-1 text-sm text-slate-600">
              Demo matter list for workflow review, chronology visibility, and route navigation.
            </p>
          </div>
          <div className="flex gap-2">
            <Link className="btn-secondary px-3 py-2" href="/dashboard">
              Back to dashboard
            </Link>
            <Link className="btn-primary px-3 py-2" href="/matters/new">
              New matter
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Visible matters</p>
          <p className="mt-2 text-2xl font-semibold">{matters.length}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Open / active</p>
          <p className="mt-2 text-2xl font-semibold">
            {matters.filter((matter) => ['OPEN', 'ACTIVE'].includes(matter.status.toUpperCase())).length}
          </p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Draft / paused</p>
          <p className="mt-2 text-2xl font-semibold">
            {matters.filter((matter) => ['DRAFT', 'PAUSED'].includes(matter.status.toUpperCase())).length}
          </p>
        </div>
      </div>

      {matters.length === 0 ? (
        <div className="section-card p-6">
          <h2 className="text-lg font-semibold">No matters for this demo role yet</h2>
          <p className="mt-1 text-sm text-slate-600">
            Use this empty state to review onboarding and navigation behavior before matter assignment.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/matters/new" className="btn-primary px-3 py-2">
              Create matter record
            </Link>
            <Link href="/dashboard" className="btn-secondary px-3 py-2">
              Return to dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {matters.map((matter) => (
            <Link
              key={matter.id}
              href={`/matters/${matter.id}`}
              className="block rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{matter.title}</h3>
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusStyle(matter.status)}`}>
                  {matter.status}
                </span>
              </div>
              <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                <p>Client: {matter.clientName}</p>
                <p>Lead advocate: {matter.primaryAdvocateName}</p>
                <p>ID: {matter.id}</p>
              </div>
              <p className="text-xs text-slate-500 mt-2">Next milestone: {matter.nextMilestone}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
