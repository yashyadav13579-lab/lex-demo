import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-widest text-muted">Advocate-first</p>
        <h1 className="text-3xl font-semibold text-slate-900">LexSovereign</h1>
        <p className="text-lg text-slate-700">
          Verified legal workflow and professional network built for advocates, chambers, and clients with safety,
          evidence integrity, and neutral discovery at the core.
        </p>
        <div className="flex gap-3">
          <Link className="px-4 py-2 bg-accent text-white rounded" href="/auth/sign-up">
            Get started
          </Link>
          <Link className="px-4 py-2 border rounded" href="/pricing">
            View pricing
          </Link>
        </div>
      </section>
      <section className="grid md:grid-cols-3 gap-4">
        {[
          {
            title: 'Verified Advocate Registry',
            body: 'Licence-backed profiles, verification queue, and compliance-first onboarding.'
          },
          {
            title: 'Evidence Integrity',
            body: 'Hashing, original vs working copies, access logs, and chain-of-custody exports.'
          },
          {
            title: 'AI with Counsel Validation',
            body: 'Draft faster with guardrails and human sign-off before export.'
          }
        ].map((card) => (
          <div key={card.title} className="border rounded-lg bg-white p-4 shadow-sm">
            <h3 className="font-semibold mb-2">{card.title}</h3>
            <p className="text-sm text-slate-600">{card.body}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
