import Link from 'next/link'

export default function IntakeSummaryPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-3xl page-shell">
      <div className="page-header">
        <p className="section-kicker">Intake checkpoint</p>
        <h1 className="mt-1 text-2xl font-semibold">Submission summary</h1>
        <p className="mt-1 text-sm text-slate-600">
          Review the structured intake packet before this issue is routed into matter assignment and legal review.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Submission ID</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{params.id}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Review state</p>
          <p className="mt-2 text-sm font-medium text-slate-900">Pending structured review</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Next stage</p>
          <p className="mt-2 text-sm font-medium text-slate-900">Matter triage and assignment</p>
        </div>
      </div>

      <div className="section-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Structured summary view</h2>
        <p className="text-sm text-slate-600">
          This view standardizes issue details, urgency indicators, and routing recommendations so matter assignment can
          proceed with consistent intake context.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/intake" className="btn-primary">
            Start another intake
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
