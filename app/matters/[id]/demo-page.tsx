'use client'

import Link from 'next/link'
import { useDemoAuth } from '@/lib/demo-auth'
import { getDemoMatterById } from '@/lib/demo-data'

export function DemoMatterDetailPage({ id }: { id: string }) {
  const { isReady, isSignedIn, session } = useDemoAuth()

  if (!isReady) {
    return <p className="text-sm text-slate-600">Loading demo session...</p>
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Matter details</h1>
        <p className="text-slate-600">Please sign in with a demo persona to access this page.</p>
        <Link href="/auth/sign-in" className="inline-block rounded bg-accent px-4 py-2 text-white">
          Go to sign in
        </Link>
      </div>
    )
  }

  const role = session?.user.role
  const matter = role ? getDemoMatterById(id, role) : null

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Matter details</h1>
      {matter ? (
        <div className="rounded-lg border bg-white p-5 shadow-sm space-y-2">
          <h2 className="text-lg font-semibold">{matter.title}</h2>
          <p className="text-sm text-slate-600">Status: {matter.status}</p>
          <p className="text-sm text-slate-600">
            Client: {matter.clientName} | Advocate: {matter.primaryAdvocateName}
          </p>
          <p className="text-sm text-slate-700">Next milestone: {matter.nextMilestone}</p>
          <p className="text-xs text-slate-500">Record ID: {matter.id}</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <p className="text-slate-600">No demo matter found for this route.</p>
        </div>
      )}
      <Link href="/matters" className="inline-block rounded border px-4 py-2">
        Back to matters
      </Link>
    </div>
  )
}
