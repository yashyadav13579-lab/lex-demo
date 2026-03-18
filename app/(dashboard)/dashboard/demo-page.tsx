'use client'

import Link from 'next/link'
import { useDemoAuth } from '@/lib/demo-auth'
import { getDemoDashboardSnapshot } from '@/lib/demo-data'

export function DemoDashboardPage() {
  const { isReady, session, isSignedIn } = useDemoAuth()

  if (!isReady) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-600">Loading demo command center...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-slate-600">Please sign in with a demo persona to access this page.</p>
        <Link href="/auth/sign-in" className="inline-block rounded bg-accent px-4 py-2 text-white">
          Go to sign in
        </Link>
      </div>
    )
  }

  const snapshot = session?.user ? getDemoDashboardSnapshot(session.user) : null
  const visibleCards = snapshot?.cards ?? []
  const roleLabel = session?.user.role?.replace('_', ' ').toLowerCase() ?? 'user'

  return (
    <div className="page-shell">
      <section className="page-header md:p-7">
        <p className="section-kicker">Command center</p>
        <h1 className="mt-1 text-2xl font-semibold">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Signed in as <span className="font-medium text-slate-900">{session?.user.name}</span> ({roleLabel}).
          {snapshot ? ` ${snapshot.roleSummary.detail}` : ''}
        </p>
        {snapshot ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {snapshot.queue.map((item) => (
              <div key={item.label} className="rounded-lg border bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900">{item.count}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {snapshot ? (
        <section className="section-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Urgent actions</h2>
            <span className="text-xs text-slate-500">{snapshot.roleSummary.title}</span>
          </div>
          <div className="mt-4 space-y-3">
            {snapshot.urgentActions.map((action) => (
              <Link key={action.title} href={action.href} className="block rounded border p-3 hover:bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-900">{action.title}</p>
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      action.priority === 'High'
                        ? 'bg-red-50 text-red-700'
                        : action.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {action.priority}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{action.detail}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Module overview</h2>
          <p className="text-sm text-slate-600">Primary and secondary operational modules for your current role.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {snapshot?.moduleOverview.map((module) => (
            <Link key={module.module} href={module.href} className="metric-card block">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{module.module}</p>
                <span
                  className={`text-xs ${
                    module.status === 'Attention'
                      ? 'text-red-700'
                      : module.status === 'Monitoring'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                  }`}
                >
                  {module.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">{module.metricLabel}</p>
              <p className="text-2xl font-semibold text-slate-900">{module.value}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-semibold">Quick access</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {visibleCards.map((card) => (
            <Link key={card.title} href={card.href} className="metric-card block">
              <h3 className="font-semibold">{card.title}</h3>
              <p className="text-sm text-slate-600">{card.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="section-card p-4">
          <h2 className="font-semibold">Recent activity</h2>
          <ul className="mt-3 space-y-3">
            {snapshot?.recentActivity.map((activity) => (
              <li key={activity.id} className="rounded border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                  <span className="text-xs text-slate-500">{activity.occurredAt}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{activity.detail}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="section-card p-4 space-y-4">
          <div>
            <h2 className="font-semibold">Next steps</h2>
            <p className="mt-1 text-sm text-slate-600">Recommended actions to keep workflow continuity.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {snapshot?.nextSteps.map((step) => (
                <Link key={step.label} href={step.href} className="rounded border px-3 py-1.5 text-sm hover:bg-slate-50">
                  {step.label}
                </Link>
              ))}
            </div>
          </div>
          {snapshot?.advocateProfile ? (
            <div className="rounded border bg-slate-50 p-3">
              <h3 className="text-sm font-semibold text-slate-900">Advocate profile summary</h3>
              <p className="mt-1 text-sm text-slate-700">{snapshot.advocateProfile.headline}</p>
              <p className="mt-1 text-xs text-slate-600">
                Verification: {snapshot.advocateProfile.verificationStatus}
                {snapshot.advocateProfile.firmName ? ` • ${snapshot.advocateProfile.firmName}` : ''}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {snapshot.advocateProfile.practiceAreas.map((area) => (
                  <span key={area} className="rounded bg-white px-2 py-1 text-xs text-slate-700 border">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {snapshot?.clientBrief ? (
            <div className="rounded border bg-slate-50 p-3">
              <h3 className="text-sm font-semibold text-slate-900">Client brief</h3>
              <p className="mt-1 text-sm text-slate-700">{snapshot.clientBrief.note}</p>
              <p className="mt-1 text-xs text-slate-600">
                Active matters: {snapshot.clientBrief.activeMatters} • Open intakes: {snapshot.clientBrief.openIntakes}
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
