'use client'

import Link from 'next/link'
import { useDemoAuth } from '@/lib/demo-auth'
import { getDemoMatterById } from '@/lib/demo-data'

export function DemoMatterDetailPage({ id }: { id: string }) {
  const { isReady, isSignedIn, session } = useDemoAuth()

  if (!isReady) {
    return <p className="text-sm text-slate-600">Loading demo session...</p>
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Matter details</h1>
        <p className="text-slate-600">Please sign in with a demo persona to access this page.</p>
        <Link href="/auth/sign-in" className="inline-block rounded bg-accent px-4 py-2 text-white">
          Go to sign in
        </Link>
      </div>
    )
  }

  const role = session?.user.role
  const matter = role ? getDemoMatterById(id, role) : null
  const timeline = [
    { label: 'Matter initialized', at: '12 Mar, 10:00', detail: 'Initial facts and participant details recorded.' },
    { label: 'Evidence checklist prepared', at: '13 Mar, 14:25', detail: 'Required exhibits mapped to chronology.' },
    { label: 'Drafting queue updated', at: '14 Mar, 09:30', detail: 'Lead draft moved to validation checkpoint.' }
  ]
  const linkedEvidence = [
    { label: 'Witness affidavit draft', status: 'Pending provenance metadata' },
    { label: 'Contract annexure copy', status: 'Hash verified' }
  ]
  const draftItems = [
    { label: 'Interim relief petition', status: 'Needs review' },
    { label: 'Hearing chronology note', status: 'In progress' }
  ]
  const taskItems = [
    'Confirm hearing bundle ordering',
    'Validate annexure naming convention',
    'Capture client clarification in notes'
  ]

  return (
    <div className="max-w-5xl page-shell">
      <div className="page-header">
        <p className="section-kicker">Matter workspace</p>
        <h1 className="mt-1 text-2xl font-semibold">Matter details</h1>
        <p className="mt-1 text-sm text-slate-600">
          Demo legal workspace showing chronology, linked modules, and progression checkpoints.
        </p>
      </div>
      {matter ? (
        <div className="space-y-4">
          <div className="section-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{matter.title}</h2>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium">{matter.status}</span>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
              <p>Client: {matter.clientName}</p>
              <p>Lead advocate: {matter.primaryAdvocateName}</p>
              <p>Next milestone: {matter.nextMilestone}</p>
            </div>
            <p className="mt-2 text-xs text-slate-500">Record ID: {matter.id}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <section className="section-card p-4 lg:col-span-2">
              <h3 className="font-semibold">Chronology and activity</h3>
              <div className="mt-3 space-y-3">
                {timeline.map((item) => (
                  <div key={item.label} className="rounded border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-900">{item.label}</p>
                      <span className="text-xs text-slate-500">{item.at}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{item.detail}</p>
                  </div>
                ))}
              </div>
            </section>

            <aside className="section-card p-4 space-y-3">
              <h3 className="font-semibold">Tasks and notes</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                {taskItems.map((task) => (
                  <li key={task} className="rounded border p-2">
                    {task}
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <section className="section-card p-4">
              <h3 className="font-semibold">Linked evidence</h3>
              <div className="mt-3 space-y-2">
                {linkedEvidence.map((item) => (
                  <div key={item.label} className="rounded border p-3">
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.status}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="section-card p-4">
              <h3 className="font-semibold">Drafts and validation</h3>
              <div className="mt-3 space-y-2">
                {draftItems.map((item) => (
                  <div key={item.label} className="rounded border p-3">
                    <p className="text-sm font-medium text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{item.status}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-slate-600">No demo matter found for this route.</p>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Link href="/matters" className="btn-primary">
          Back to matters
        </Link>
        <Link href="/evidence" className="btn-secondary">
          Open evidence
        </Link>
        <Link href="/drafts" className="btn-secondary">
          Open drafts
        </Link>
      </div>
    </div>
  )
}
