'use client'

import Link from 'next/link'
import { useDemoAuth } from '@/lib/demo-auth'
import { getDemoMessageThreads } from '@/lib/demo-data'

export function DemoMessagesPage() {
  const { isReady, isSignedIn, session } = useDemoAuth()

  if (!isReady) return <p className="text-sm text-slate-600">Loading demo session...</p>

  if (!isSignedIn) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-slate-600">Please sign in with a demo persona to access message previews.</p>
        <Link href="/auth/sign-in" className="inline-block rounded bg-accent px-4 py-2 text-white">
          Go to sign in
        </Link>
      </div>
    )
  }

  const role = session?.user.role
  const threads = role ? getDemoMessageThreads(role) : []

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">Secure communication for matters and collaboration.</p>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h2 className="text-lg font-semibold">Thread preview</h2>
        {threads.length === 0 ? (
          <p className="text-sm text-slate-600">No message previews available for this demo role.</p>
        ) : (
          threads.map((thread) => (
            <div key={thread.id} className="rounded border p-3">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">{thread.subject}</p>
                <span className="text-xs text-slate-500">{thread.updatedAtLabel}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{thread.participantLabel}</p>
              <p className="text-sm text-slate-700 mt-2">{thread.lastMessagePreview}</p>
            </div>
          ))
        )}
        <div className="flex gap-3 pt-1">
          <Link href="/dashboard" className="rounded bg-accent px-4 py-2 text-white">
            Back to dashboard
          </Link>
          <Link href="/matters" className="rounded border px-4 py-2">
            View matters
          </Link>
        </div>
      </div>
    </div>
  )
}
