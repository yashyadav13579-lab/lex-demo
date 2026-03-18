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
      <div className="max-w-2xl rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Guided intake</h1>
        <p className="mt-2 text-sm text-slate-600">Checking your account access...</p>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="max-w-2xl rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-2xl font-semibold">Guided intake</h1>
        <p className="text-slate-600">You need to sign in before starting an intake submission.</p>
        <div className="flex gap-3">
          <Link href="/auth/sign-in" className="rounded bg-accent px-4 py-2 text-white">
            Sign in
          </Link>
          <Link href="/auth/sign-up" className="rounded border px-4 py-2">
            Create account
          </Link>
        </div>
      </div>
    )
  }

  if (session?.user?.role !== 'CLIENT') {
    return (
      <div className="max-w-2xl rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-2xl font-semibold">Guided intake</h1>
        <p className="text-slate-600">This feature is available only for client accounts.</p>
        <div className="flex gap-3">
          <Link href="/dashboard" className="rounded bg-accent px-4 py-2 text-white">
            Back to dashboard
          </Link>
          <Link href="/matters" className="rounded border px-4 py-2">
            Go to matters
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Guided intake</h1>
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
        <button type="submit" className="px-4 py-2 bg-accent text-white rounded" disabled={loading}>
          {loading ? 'Submitting...' : 'Save and continue'}
        </button>
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
      <div className="max-w-2xl rounded-lg border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Guided intake</h1>
        <p className="mt-2 text-sm text-slate-600">Checking demo session access...</p>
      </div>
    )
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-2xl rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-2xl font-semibold">Guided intake</h1>
        <p className="text-slate-600">Please sign in with a demo persona before starting intake.</p>
        <Link href="/auth/sign-in" className="rounded bg-accent px-4 py-2 text-white inline-block">
          Go to sign in
        </Link>
      </div>
    )
  }

  if (session?.user?.role !== 'CLIENT') {
    return (
      <div className="max-w-2xl rounded-lg border bg-white p-6 shadow-sm space-y-3">
        <h1 className="text-2xl font-semibold">Guided intake</h1>
        <p className="text-slate-600">This feature is available only for client accounts.</p>
        <div className="flex gap-3">
          <Link href="/dashboard" className="rounded bg-accent px-4 py-2 text-white">
            Back to dashboard
          </Link>
          <Link href="/matters" className="rounded border px-4 py-2">
            Go to matters
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Guided intake</h1>
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
        <button type="submit" className="px-4 py-2 bg-accent text-white rounded" disabled={loading}>
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
