import Link from 'next/link'

export default function HomePage() {
  const workflow = [
    {
      name: 'Intake',
      detail: 'Structured capture with role-aware access and clear client guidance.'
    },
    {
      name: 'Matter',
      detail: 'Single workspace for parties, assignments, timeline, and legal progress.'
    },
    {
      name: 'Evidence',
      detail: 'Provenance, original copies, and access events tracked by default.'
    },
    {
      name: 'Draft',
      detail: 'AI-assisted drafting in a professional workflow with traceable context.'
    },
    {
      name: 'Validation',
      detail: 'Human counsel review gates every output before final export.'
    }
  ]

  const roleSurfaces = [
    {
      title: 'For Advocates',
      body: 'Run active matters, preserve evidence integrity, and ship validated drafts without context switching.'
    },
    {
      title: 'For Chambers and Firms',
      body: 'Coordinate teams, assign responsibilities, and maintain chamber-ready oversight across matters.'
    },
    {
      title: 'For Clients',
      body: 'Start intake confidently, track status clearly, and communicate through a guided legal workflow.'
    }
  ]

  const trustPoints = [
    {
      title: 'Verified Professional Identity',
      body: 'Role and profile states are built for legal verification and operational trust.'
    },
    {
      title: 'Evidence Provenance',
      body: 'Chain-of-custody aware storage model with access events and auditability.'
    },
    {
      title: 'Human Sign-Off Controls',
      body: 'Draft acceleration is available, but counsel approval remains the final gate.'
    },
    {
      title: 'Neutral Discovery and Allocation',
      body: 'Discovery surfaces are structured to reduce bias and keep assignment defensible.'
    },
    {
      title: 'Advocate Safety Layer',
      body: 'SOS and incident-oriented flows are positioned as operational safeguards, not afterthoughts.'
    },
    {
      title: 'Compliance-Ready Operations',
      body: 'Workflow decisions are framed for institutional governance and review.'
    }
  ]

  return (
    <div className="page-shell">
      <section className="page-header md:p-10">
        <div className="max-w-4xl space-y-5">
          <p className="section-kicker tracking-[0.18em]">Advocate-first legal OS</p>
          <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
            LexSovereign brings verified legal workflow, evidence integrity, and counsel validation into one
            institutional platform.
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-slate-700 md:text-lg">
            Built for advocates, chambers, and clients who need serious execution quality. Intake, matter operations,
            evidence controls, draft production, and final legal validation are connected in a workflow designed for
            trust.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link className="btn-primary" href="/auth/sign-up">
              Request access
            </Link>
            <Link className="btn-secondary" href="/pricing">
              View pricing
            </Link>
            <Link className="btn-secondary" href="#how-it-works">
              How it works
            </Link>
          </div>
          <div className="grid gap-2 pt-2 text-sm text-slate-600 md:grid-cols-3">
            <p>Verified identities and role-aware access controls</p>
            <p>Evidence provenance with chain-of-custody posture</p>
            <p>Human legal sign-off before release or export</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="space-y-4">
        <div className="space-y-1">
          <p className="section-kicker">How LexSovereign works</p>
          <h2 className="text-2xl font-semibold text-slate-900">A governed legal workflow from first signal to final output</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {workflow.map((step, index) => (
            <div key={step.name} className="metric-card">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step {index + 1}</p>
              <h3 className="mt-1 font-semibold">{step.name}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="product" className="space-y-4">
        <div className="space-y-1">
          <p className="section-kicker">Product surfaces</p>
          <h2 className="text-2xl font-semibold text-slate-900">Operational views designed for legal teams</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="metric-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Matter Control</p>
            <h3 className="mt-1 font-semibold">Live matter dashboard</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded border bg-slate-50 p-2">Matter #LS-2041 · Active · Assigned Advocate</div>
              <div className="rounded border bg-slate-50 p-2">Client timeline, hearings, filings, and next actions</div>
              <div className="rounded border bg-slate-50 p-2">Team notes and role-based task ownership</div>
            </div>
          </div>
          <div className="metric-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Evidence Integrity</p>
            <h3 className="mt-1 font-semibold">Traceable evidence operations</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded border bg-slate-50 p-2">Original hash recorded at intake</div>
              <div className="rounded border bg-slate-50 p-2">Working copy edits tracked with actor and timestamp</div>
              <div className="rounded border bg-slate-50 p-2">Export package includes provenance context</div>
            </div>
          </div>
          <div className="metric-card">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Draft + Validation</p>
            <h3 className="mt-1 font-semibold">Counsel-reviewed drafting flow</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="rounded border bg-slate-50 p-2">AI-assisted first pass with template controls</div>
              <div className="rounded border bg-slate-50 p-2">Mandatory reviewer handoff before approval</div>
              <div className="rounded border bg-slate-50 p-2">Final release after legal validation checkpoint</div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="section-kicker">Who it serves</p>
          <h2 className="text-2xl font-semibold text-slate-900">Role-specific value without fragmentation</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {roleSurfaces.map((card) => (
            <div key={card.title} className="section-card">
              <h3 className="font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="section-kicker">Trust and governance</p>
          <h2 className="text-2xl font-semibold text-slate-900">Built for legal credibility, not generic productivity</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trustPoints.map((item) => (
            <article key={item.title} className="section-card">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="page-header md:p-8">
        <div className="max-w-3xl space-y-3">
          <h2 className="text-2xl font-semibold text-slate-900">Institutional legal execution starts with trusted workflow design.</h2>
          <p className="text-slate-700">
            LexSovereign is designed to make legal operations defensible, collaborative, and review-ready across every
            core module.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link className="btn-primary" href="/auth/sign-up">
              Create workspace
            </Link>
            <Link className="btn-secondary" href="/pricing">
              Compare plans
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
