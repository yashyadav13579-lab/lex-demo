import Link from 'next/link'

export default function DraftsPage() {
  const pipeline = [
    { state: 'Draft', count: 0, tone: 'bg-slate-100 text-slate-700', detail: 'Initial preparation' },
    { state: 'In Review', count: 0, tone: 'bg-amber-50 text-amber-700', detail: 'Peer or lead review pending' },
    { state: 'Awaiting Validation', count: 0, tone: 'bg-red-50 text-red-700', detail: 'Counsel sign-off required' },
    { state: 'Approved', count: 0, tone: 'bg-emerald-50 text-emerald-700', detail: 'Cleared for controlled export' }
  ]

  return (
    <div className="max-w-4xl page-shell">
      <div>
        <p className="section-kicker">Draft governance workspace</p>
        <h1 className="mt-1 text-2xl font-semibold">Drafts</h1>
        <p className="mt-1 text-sm text-slate-600">
          Prepare legal documents with controlled drafting stages and mandatory counsel validation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">DR-01</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">Needs review</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting advocate or reviewer sign-off.</p>
        </div>
        <div className="metric-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">DR-02</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">Approved</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Ready for controlled export.</p>
        </div>
        <div className="metric-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">DR-03</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">Rejected / revision</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Requires rework before release.</p>
        </div>
      </div>

      <section className="section-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Draft control pipeline</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {pipeline.map((column) => (
            <div key={column.state} className="rounded border bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-900">{column.state}</p>
                <span className={`rounded px-2 py-0.5 text-xs ${column.tone}`}>{column.count}</span>
              </div>
              <p className="mt-2 text-xs text-slate-600">{column.detail}</p>
            </div>
          ))}
        </div>
        <div className="rounded border bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Counsel sign-off policy</p>
          <p className="mt-1">
            Documents in <span className="font-medium">Awaiting Validation</span> cannot be exported until a reviewing
            counsel marks the draft approved.
          </p>
        </div>
      </section>

      <div className="section-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">No drafts have been created yet</h2>
        <p className="text-sm text-slate-600">
          Drafts are linked to matters and move through validation checkpoints before they can be finalized. This page
          will become the control surface for drafting status, reviewers, and release readiness.
        </p>
        <div className="rounded border bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Expected module surfaces</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Draft pipeline by status</li>
            <li>Reviewer assignment and sign-off records</li>
            <li>Controlled export actions after approval</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/matters/new" className="btn-primary">
            Create matter to start drafting
          </Link>
          <Link href="/matters" className="btn-secondary">
            Open matters
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
