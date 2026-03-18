import Link from 'next/link'

export default function NewMatterPage() {
  return (
    <div className="max-w-3xl page-shell">
      <div className="page-header">
        <p className="section-kicker">Matter intake setup</p>
        <h1 className="mt-1 text-2xl font-semibold">New matter</h1>
        <p className="mt-1 text-sm text-slate-600">
          Start a legal workspace by defining the client, lead advocate, and initial matter context.
        </p>
      </div>

      <section className="section-card">
        <h2 className="text-lg font-semibold">Creation workflow preview</h2>
        <p className="mt-2 text-sm text-slate-600">
          This route is prepared for full matter creation. The final form will capture party details, matter category,
          jurisdiction, and opening chronology in a single setup flow.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded border bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Step 1</p>
            <p className="mt-1 text-sm text-slate-700">Matter identity, parties, and assigned lead advocate</p>
          </div>
          <div className="rounded border bg-slate-50 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Step 2</p>
            <p className="mt-1 text-sm text-slate-700">Initial chronology, urgency, and evidence checklist</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/matters" className="btn-primary">
            Return to matters
          </Link>
          <Link href="/intake" className="btn-secondary">
            Start from intake instead
          </Link>
        </div>
      </section>
    </div>
  )
}
