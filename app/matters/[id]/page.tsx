import Link from 'next/link'
import { isDemoAuthEnabled } from '@/lib/demo-auth'
import { DemoMatterDetailPage } from './demo-page'

export default function MatterDetailPage({ params }: { params: { id: string } }) {
  if (isDemoAuthEnabled()) {
    return <DemoMatterDetailPage id={params.id} />
  }

  return (
    <div className="max-w-5xl page-shell">
      <div className="page-header">
        <p className="section-kicker">Matter workspace</p>
        <h1 className="mt-1 text-2xl font-semibold">Matter details</h1>
        <p className="mt-1 text-sm text-slate-600">
          Structured legal workspace for chronology, evidence, drafts, and matter-linked activity.
        </p>
        <p className="mt-2 text-xs text-slate-500">Matter ID: {params.id}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="section-card p-4 lg:col-span-2">
          <h2 className="font-semibold">Matter overview</h2>
          <p className="mt-2 text-sm text-slate-600">
            Core matter sections are arranged for legal execution: chronology, evidence linkage, draft validation, and
            operational activity.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded border bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Chronology</p>
              <p className="mt-1 text-sm text-slate-700">Hearing events, filing dates, and milestone order.</p>
            </div>
            <div className="rounded border bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Linked evidence</p>
              <p className="mt-1 text-sm text-slate-700">Provenance-aware files and access logs.</p>
            </div>
            <div className="rounded border bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Drafts + validation</p>
              <p className="mt-1 text-sm text-slate-700">Draft pipeline with sign-off controls.</p>
            </div>
            <div className="rounded border bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Activity + notes</p>
              <p className="mt-1 text-sm text-slate-700">Team commentary and operational audit trail.</p>
            </div>
          </div>
        </section>

        <aside className="section-card p-4 space-y-3">
          <h2 className="font-semibold">Workspace sections</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="rounded border p-2">Matter chronology timeline</li>
            <li className="rounded border p-2">Evidence register and provenance</li>
            <li className="rounded border p-2">Draft and validation queue</li>
            <li className="rounded border p-2">Tasks, notes, and linked activity</li>
          </ul>
        </aside>
      </div>

      <div className="section-card">
        <h2 className="font-semibold">Matter detail architecture is active</h2>
        <p className="mt-2 text-sm text-slate-600">
          Backend-bound records will populate these sections directly. The workspace hierarchy, section logic, and
          module pathways are ready for full matter hydration.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/matters" className="btn-primary">
            Back to matters
          </Link>
          <Link href="/evidence" className="btn-secondary">
            Open evidence workspace
          </Link>
          <Link href="/drafts" className="btn-secondary">
            Open drafts workspace
          </Link>
        </div>
      </div>
    </div>
  )
}
