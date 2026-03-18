'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { isDemoAuthEnabled, useDemoAuth } from '@/lib/demo-auth'

const DEMO_AUTH_ENABLED = isDemoAuthEnabled()

function RealIntakePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [issueCategory, setIssueCategory] = useState('Civil')
  const [urgency, setUrgency] = useState('Normal')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueCategory, urgency, answers: [{ key: 'summary', value: description }] })
      })

      const data = (await res.json().catch(() => null)) as { id?: string; error?: string } | null
      if (!res.ok) {
        if (res.status === 401) {
          setFormError('Your session has expired. Please sign in again to continue intake.')
        } else if (res.status === 403) {
          setFormError('Only client accounts can start intake submissions.')
        } else {
          setFormError(data?.error || 'Unable to save intake right now. Please try again.')
        }
        return
      }

      if (data?.id) {
        router.push(`/intake/${data.id}/summary`)
        return
      }

      setFormError('Intake was saved but no summary was returned. Please try again.')
    } catch {
      setFormError('Network error while submitting intake. Please check your connection and retry.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="max-w-2xl page-header">
        <h1 className="text-2xl font-semibold">Structured intake</h1>
        <p className="mt-2 text-sm text-slate-600">Checking account access and intake permissions...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-2xl page-header space-y-3">
        <h1 className="text-2xl font-semibold">Structured intake</h1>
        <p className="text-slate-600">
          Sign in to begin a structured issue intake. Submission details are used to open a traceable legal matter.
        </p>
        <div className="flex gap-3">
          <Link href="/auth/sign-in" className="btn-primary">
            Sign in
          </Link>
          <Link href="/auth/sign-up" className="btn-secondary">
            Create account
          </Link>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== 'CLIENT') {
    return (
      <div className="max-w-2xl page-header space-y-3">
        <h1 className="text-2xl font-semibold">Structured intake</h1>
        <p className="text-slate-600">
          Intake submission is reserved for client accounts so issue statements remain source-authored.
        </p>
        <div className="flex gap-3">
          <Link href="/dashboard" className="btn-primary">
            Back to dashboard
          </Link>
          <Link href="/matters" className="btn-secondary">
            Go to matters
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl page-shell">
      <div className="page-header">
        <p className="section-kicker">Client issue intake</p>
        <h1 className="mt-1 text-2xl font-semibold">Structured intake</h1>
        <p className="mt-1 text-sm text-slate-600">
          Capture issue context in a consistent format to initialize matter triage and advocate assignment.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Submissions</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Intake packets created by your account.</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Urgent cases</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Marked high/emergency for priority routing.</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Converted matters</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Intake records moved to active matters.</p>
        </div>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">Issue category</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={issueCategory}
            onChange={(e) => setIssueCategory(e.target.value)}
          >
            <option>Civil</option>
            <option>Criminal</option>
            <option>Corporate</option>
            <option>Family</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Urgency</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option>Normal</option>
            <option>High</option>
            <option>Emergency</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Describe the issue</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Save and continue'}
        </button>
        <div className="rounded border bg-slate-50 p-3 text-sm text-slate-600">
          Intake data is used for internal legal triage and matter setup. You can review a structured summary before
          final downstream workflow.
        </div>
        {formError ? (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p>{formError}</p>
            {formError.includes('sign in') ? (
              <Link href="/auth/sign-in" className="mt-2 inline-block underline">
                Go to sign in
              </Link>
            ) : null}
          </div>
        ) : null}
      </form>
    </div>
  )
}

function DemoIntakePage() {
  const router = useRouter()
  const { isReady, isSignedIn, session } = useDemoAuth()
  const [issueCategory, setIssueCategory] = useState('Civil')
  const [urgency, setUrgency] = useState('Normal')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setLoading(true)
    const demoId = `demo-${Date.now()}`
    router.push(`/intake/${demoId}/summary`)
  }

  if (!isReady) {
    return (
      <div className="max-w-2xl page-header">
        <h1 className="text-2xl font-semibold">Structured intake</h1>
        <p className="mt-2 text-sm text-slate-600">Checking demo session access and role eligibility...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-2xl page-header space-y-3">
        <h1 className="text-2xl font-semibold">Structured intake</h1>
        <p className="text-slate-600">Sign in with a client demo persona to preview intake flow behavior.</p>
        <Link href="/auth/sign-in" className="btn-primary">
          Go to sign in
        </Link>
      </div>
    )
  }

  if (session?.user?.role !== 'CLIENT') {
    return (
      <div className="max-w-2xl page-header space-y-3">
        <h1 className="text-2xl font-semibold">Structured intake</h1>
        <p className="text-slate-600">This module is client-facing. Switch to a client persona to review this workflow.</p>
        <div className="flex gap-3">
          <Link href="/dashboard" className="btn-primary">
            Back to dashboard
          </Link>
          <Link href="/matters" className="btn-secondary">
            Go to matters
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl page-shell">
      <div className="page-header">
        <p className="section-kicker">Client issue intake</p>
        <h1 className="mt-1 text-2xl font-semibold">Structured intake</h1>
        <p className="mt-1 text-sm text-slate-600">
          Preview a client-originated intake path that feeds matter triage and assignment.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Demo submissions</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Local-only submissions in this session.</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Priority flags</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Items marked high or emergency.</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Converted matters</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Demo submissions promoted to matter view.</p>
        </div>
      </div>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">Issue category</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={issueCategory}
            onChange={(e) => setIssueCategory(e.target.value)}
          >
            <option>Civil</option>
            <option>Criminal</option>
            <option>Corporate</option>
            <option>Family</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Urgency</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option>Normal</option>
            <option>High</option>
            <option>Emergency</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Describe the issue</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Continuing...' : 'Save and continue'}
        </button>
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Demo mode: intake submission is local-only and does not call backend services.
        </div>
        {formError ? (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p>{formError}</p>
          </div>
        ) : null}
      </form>
    </div>
  )
}

export default function IntakeStartPage() {
  if (DEMO_AUTH_ENABLED) return <DemoIntakePage />
  return <RealIntakePage />
}
