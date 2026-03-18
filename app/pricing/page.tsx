import Link from 'next/link'

const plans = [
  {
    name: 'Solo Advocate',
    price: '$39/mo',
    who: 'Independent advocates and small private practices',
    why: 'Built for practitioners who need full matter execution discipline without firm overhead.',
    workflow: 'Intake triage, active matter management, evidence integrity, and counsel-reviewed drafting.',
    cta: 'Start Advocate Workspace',
    features: [
      'Verified profile and trust-ready identity state',
      'Matter workspace with timeline and assignments',
      'Evidence hashing and provenance posture',
      'AI drafting with mandatory validation gate'
    ]
  },
  {
    name: 'Chambers/Firm',
    price: '$99/mo',
    who: 'Chambers, legal teams, and multi-advocate practices',
    why: 'Designed for structured collaboration, delegation, and institutional oversight.',
    workflow: 'Shared matter execution, role-based handoffs, review queues, and admin governance.',
    cta: 'Activate Chamber Plan',
    features: [
      'Team roles with controlled access boundaries',
      'Shared matters and assignment controls',
      'Review and validation queues',
      'Admin console and operational oversight'
    ]
  },
  {
    name: 'Enterprise / Panel',
    price: 'Custom',
    who: 'Large institutions, legal networks, and compliance-led operations',
    why: 'For organizations requiring higher governance, panel workflows, and formal controls.',
    workflow: 'Institutional rollout, compliance review layers, and managed implementation support.',
    cta: 'Request Enterprise Review',
    features: [
      'Structured panel and oversight workflows',
      'Advanced compliance and operational controls',
      'Deployment planning and dedicated support',
      'Custom governance alignment'
    ]
  }
]

const comparisonRows = [
  {
    label: 'Core matter workflow',
    solo: 'Included',
    firm: 'Included',
    enterprise: 'Included'
  },
  {
    label: 'Team role controls',
    solo: 'Basic',
    firm: 'Advanced',
    enterprise: 'Institutional'
  },
  {
    label: 'Validation and review controls',
    solo: 'Single-team',
    firm: 'Multi-user queue',
    enterprise: 'Multi-layer governance'
  },
  {
    label: 'Compliance support posture',
    solo: 'Standard',
    firm: 'Enhanced',
    enterprise: 'Custom program'
  }
]

export default function PricingPage() {
  return (
    <div className="page-shell">
      <section className="page-header">
        <p className="section-kicker">Plans and packaging</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">Pricing built around legal workflow maturity</h1>
        <p className="mt-3 max-w-3xl text-slate-700">
          LexSovereign plans are structured by operating model: individual advocate execution, chamber collaboration,
          and institutional governance. Each tier aligns with how legal work is actually delivered.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.name} className="section-card">
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="text-2xl font-bold mt-2">{plan.price}</p>
            <p className="mt-3 text-sm font-medium text-slate-900">Who it is for</p>
            <p className="mt-1 text-sm text-slate-600">{plan.who}</p>
            <p className="mt-3 text-sm font-medium text-slate-900">Why this plan exists</p>
            <p className="mt-1 text-sm text-slate-600">{plan.why}</p>
            <p className="mt-3 text-sm font-medium text-slate-900">Workflow fit</p>
            <p className="mt-1 text-sm text-slate-600">{plan.workflow}</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 list-disc pl-4">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <Link className="btn-primary mt-5 flex w-full" href="/auth/sign-up">
              {plan.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="section-card">
        <h2 className="text-xl font-semibold text-slate-900">Plan comparison at a glance</h2>
        <p className="mt-2 text-sm text-slate-600">
          Compare plans by operational depth, not marketing labels. Upgrade when your team structure and governance
          requirements expand.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="py-2 font-medium">Capability</th>
                <th className="py-2 font-medium">Solo Advocate</th>
                <th className="py-2 font-medium">Chambers/Firm</th>
                <th className="py-2 font-medium">Enterprise / Panel</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-b last:border-b-0">
                  <td className="py-2 font-medium text-slate-900">{row.label}</td>
                  <td className="py-2 text-slate-700">{row.solo}</td>
                  <td className="py-2 text-slate-700">{row.firm}</td>
                  <td className="py-2 text-slate-700">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
