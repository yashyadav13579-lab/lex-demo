'use client'

import Link from 'next/link'
import { useDemoAuth } from '@/lib/demo-auth'
import { getDemoMessageThreads } from '@/lib/demo-data'

function threadCategory(subject: string) {
  const normalized = subject.toLowerCase()
  if (normalized.includes('evidence')) return 'Evidence clarification'
  if (normalized.includes('draft')) return 'Draft review'
  return 'Matter thread'
}

export function DemoMessagesPage() {
  const { isReady, isSignedIn, session } = useDemoAuth()

  if (!isReady) return <p className="text-sm text-slate-600">Loading demo messaging workspace...</p>

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
    <div className="max-w-4xl page-shell">
      <div>
        <p className="section-kicker">Secure collaboration workspace</p>
        <h1 className="mt-1 text-2xl font-semibold">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">Role-aware communication previews linked to legal matter context.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Preview threads</p>
          <p className="mt-2 text-2xl font-semibold">{threads.length}</p>
          <p className="mt-1 text-xs text-slate-500">Loaded for the active demo persona.</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Role</p>
          <p className="mt-2 text-sm font-medium text-slate-900">{role ?? 'Unavailable'}</p>
          <p className="mt-1 text-xs text-slate-500">Controls visible communication surfaces.</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Matter-linked threads</p>
          <p className="mt-2 text-2xl font-semibold">{threads.length > 0 ? threads.length : 0}</p>
          <p className="mt-1 text-xs text-slate-500">Demonstrates context-carrying collaboration.</p>
        </div>
      </div>
      <div className="section-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Thread preview</h2>
        {threads.length === 0 ? (
          <p className="text-sm text-slate-600">
            No thread previews are available for this role. Switch to advocate, client, or firm admin to inspect
            conversation structure.
          </p>
        ) : (
          threads.map((thread) => (
            <div key={thread.id} className="rounded border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm">{thread.subject}</p>
                <span className="text-xs text-slate-500">{thread.updatedAtLabel}</span>
              </div>
              <div className="mt-1">
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                  {threadCategory(thread.subject)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{thread.participantLabel}</p>
              <p className="text-sm text-slate-700 mt-2">{thread.lastMessagePreview}</p>
            </div>
          ))
        )}
        <div className="flex gap-3 pt-1">
          <Link href="/dashboard" className="btn-primary">
            Back to dashboard
          </Link>
          <Link href="/matters" className="btn-secondary">
            View matters
          </Link>
        </div>
      </div>

      <section className="section-card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Legal collaboration posture</h2>
        <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600">
          <li>Threads are expected to remain matter-linked and action-oriented.</li>
          <li>Evidence and draft clarifications should stay within relevant module context.</li>
          <li>Urgent safety escalation is routed through SOS when required.</li>
        </ul>
      </section>
    </div>
  )
}
