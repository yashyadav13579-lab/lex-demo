'use client'

import Link from 'next/link'
import { useDemoAuth } from '@/lib/demo-auth'
import { getDemoDashboardSnapshot } from '@/lib/demo-data'

export function DemoDashboardPage() {
  const { isReady, session, isSignedIn } = useDemoAuth()

  if (!isReady) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-slate-600">Loading demo session...</p>
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-600">Welcome back</p>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {visibleCards.map((card) => (
          <Link key={card.title} href={card.href} className="border bg-white rounded-lg p-4 shadow-sm block">
            <h3 className="font-semibold">{card.title}</h3>
            <p className="text-sm text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>
      {snapshot ? (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Work queue</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {snapshot.queue.map((item) => (
                <li key={item.label} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
          {snapshot.advocateProfile ? (
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <h2 className="font-semibold">Advocate profile summary</h2>
              <p className="mt-2 text-sm text-slate-700">{snapshot.advocateProfile.headline}</p>
              <p className="mt-1 text-xs text-slate-600">
                Verification: {snapshot.advocateProfile.verificationStatus}
                {snapshot.advocateProfile.firmName ? ` • ${snapshot.advocateProfile.firmName}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {snapshot.advocateProfile.practiceAreas.map((area) => (
                  <span key={area} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {snapshot.clientBrief ? (
            <div className="rounded-lg border bg-white p-4 shadow-sm md:col-span-2">
              <h2 className="font-semibold">Client brief</h2>
              <p className="mt-2 text-sm text-slate-700">{snapshot.clientBrief.note}</p>
              <p className="mt-2 text-xs text-slate-600">
                Active matters: {snapshot.clientBrief.activeMatters} • Open intakes: {snapshot.clientBrief.openIntakes}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
