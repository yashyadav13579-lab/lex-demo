'use client'

import Link from 'next/link'
import { useDemoAuth } from '@/lib/demo-auth'
import { getDemoMattersForRole } from '@/lib/demo-data'

export function DemoMattersPage() {
  const { isReady, isSignedIn, session } = useDemoAuth()

  if (!isReady) {
    return <p className="text-sm text-slate-600">Loading demo session...</p>
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-2xl font-semibold">Matters</h1>
        <p className="text-slate-600">Please sign in with a demo persona to access this page.</p>
        <Link href="/auth/sign-in" className="inline-block rounded bg-accent px-4 py-2 text-white">
          Go to sign in
        </Link>
      </div>
    )
  }

  const role = session?.user.role
  const matters = role ? getDemoMattersForRole(role) : []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Matters</h1>
        <Link className="px-3 py-2 bg-accent text-white rounded" href="/matters/new">
          New matter
        </Link>
      </div>
      {matters.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">No matters yet</h2>
          <p className="mt-1 text-sm text-slate-600">
            Demo mode does not load backend records for this role yet. Use this view to review layout and navigation.
          </p>
          <Link href="/matters/new" className="mt-4 inline-block rounded bg-accent px-3 py-2 text-white">
            Create matter
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {matters.map((matter) => (
            <Link
              key={matter.id}
              href={`/matters/${matter.id}`}
              className="block rounded-lg border bg-white p-4 shadow-sm"
            >
              <div className="font-semibold">{matter.title}</div>
              <div className="mt-1 text-sm text-slate-600">Status: {matter.status}</div>
              <div className="text-sm text-slate-600">
                Client: {matter.clientName} | Advocate: {matter.primaryAdvocateName}
              </div>
              <div className="text-xs text-slate-500 mt-2">Next: {matter.nextMilestone}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
