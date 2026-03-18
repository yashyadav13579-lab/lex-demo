'use client'

import Link from 'next/link'
import { useDemoAuth } from '@/lib/demo-auth'
import { getDemoSOSHistory } from '@/lib/demo-data'

export function DemoSOSPage() {
  const { isReady, isSignedIn, session } = useDemoAuth()

  if (!isReady) return <p className="text-sm text-slate-600">Loading demo session...</p>

  if (!isSignedIn) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-2xl font-semibold">SOS</h1>
        <p className="text-slate-600">Please sign in with a demo persona to access SOS history.</p>
        <Link href="/auth/sign-in" className="inline-block rounded bg-accent px-4 py-2 text-white">
          Go to sign in
        </Link>
      </div>
    )
  }

  const role = session?.user.role
  const incidents = role ? getDemoSOSHistory(role) : []

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">SOS</h1>
        <p className="mt-1 text-sm text-slate-600">Monitor emergency incidents and response history.</p>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold">Incident history</h2>
        {incidents.length === 0 ? (
          <p className="text-sm text-slate-600">
            No SOS history is available for this demo role. Switch to an advocate or firm persona to preview.
          </p>
        ) : (
          incidents.map((incident) => (
            <div key={incident.id} className="rounded border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{incident.location}</p>
                <span className="text-xs text-slate-500">{incident.triggeredAtLabel}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Status: {incident.status}</p>
              <p className="text-sm text-slate-700 mt-2">{incident.description}</p>
            </div>
          ))
        )}
        <div className="flex gap-3 pt-1">
          <Link href="/dashboard" className="rounded bg-accent px-4 py-2 text-white">
            Back to dashboard
          </Link>
          <Link href="/messages" className="rounded border px-4 py-2">
            Go to messages
          </Link>
        </div>
      </div>
    </div>
  )
}
