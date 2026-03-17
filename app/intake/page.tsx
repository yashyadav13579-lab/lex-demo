'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function IntakeStartPage() {
  const router = useRouter()
  const [issueCategory, setIssueCategory] = useState('Civil')
  const [urgency, setUrgency] = useState('Normal')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/intake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueCategory, urgency, answers: [{ key: 'summary', value: description }] })
    })
    const data = await res.json()
    setLoading(false)
    if (data?.id) router.push(`/intake/${data.id}/summary`)
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
      </form>
    </div>
  )
}
