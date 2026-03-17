'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
// Note: In a real app this would be an API route; simplified placeholder that posts to an API route.

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CLIENT' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: replace with server action / API call. Placeholder to indicate flow.
    await fetch('/api/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' }
    })
    setLoading(false)
    router.push('/auth/sign-in')
  }

  return (
    <div className="max-w-md mx-auto bg-white border p-6 rounded-lg shadow-sm space-y-4">
      <h1 className="text-xl font-semibold">Create account</h1>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Role</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="CLIENT">Client</option>
            <option value="ADVOCATE">Advocate</option>
            <option value="FIRM_ADMIN">Firm Admin</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-accent text-white rounded py-2" disabled={loading}>
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
