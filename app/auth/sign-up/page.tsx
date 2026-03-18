'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { isDemoAuthEnabled } from '@/lib/demo-auth'

const APPROVED_ROLES = ['CLIENT', 'ADVOCATE', 'FIRM_ADMIN'] as const

const signUpSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must include at least one letter')
    .regex(/[0-9]/, 'Password must include at least one number'),
  role: z.enum(APPROVED_ROLES, { message: 'Select a valid role' })
})

type SignUpValues = z.infer<typeof signUpSchema>
const DEMO_AUTH_ENABLED = isDemoAuthEnabled()

export default function SignUpPage() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'CLIENT'
    }
  })

  const onSubmit = async (values: SignUpValues) => {
    setFormError(null)
    setSuccessMessage(null)
    if (DEMO_AUTH_ENABLED) {
      setSuccessMessage('Demo mode preview: account creation is not persisted. Use demo sign-in personas to continue.')
      router.push('/auth/sign-in')
      return
    }

    const response = await fetch('/api/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(values),
      headers: { 'Content-Type': 'application/json' }
    })

    const data = (await response.json().catch(() => null)) as { error?: string } | null
    if (!response.ok) {
      setFormError(data?.error || 'Unable to create account right now. Please try again.')
      return
    }

    setSuccessMessage('Account created successfully. Redirecting to sign in...')
    router.push('/auth/sign-in')
  }

  return (
    <div className="max-w-md mx-auto bg-white border p-6 rounded-lg shadow-sm space-y-4">
      <h1 className="text-xl font-semibold">Create account</h1>
      <p className="text-sm text-slate-600">Use at least 8 characters with letters and numbers.</p>
      {DEMO_AUTH_ENABLED ? (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Demo mode: sign-up is preview-only and does not create persistent backend accounts.
        </div>
      ) : null}
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            className="w-full border rounded px-3 py-2"
            autoComplete="name"
            disabled={isSubmitting}
            {...register('name')}
          />
          {errors.name ? <p className="mt-1 text-sm text-red-600">{errors.name.message}</p> : null}
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            {...register('email')}
          />
          {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email.message}</p> : null}
        </div>
        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            className="w-full border rounded px-3 py-2"
            type="password"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register('password')}
          />
          {errors.password ? <p className="mt-1 text-sm text-red-600">{errors.password.message}</p> : null}
        </div>
        <div>
          <label className="block text-sm mb-1">Role</label>
          <select
            className="w-full border rounded px-3 py-2"
            disabled={isSubmitting}
            {...register('role')}
          >
            <option value="CLIENT">Client</option>
            <option value="ADVOCATE">Advocate</option>
            <option value="FIRM_ADMIN">Firm Admin</option>
          </select>
          {errors.role ? <p className="mt-1 text-sm text-red-600">{errors.role.message}</p> : null}
        </div>
        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
        {successMessage ? <p className="text-sm text-green-700">{successMessage}</p> : null}
        <button type="submit" className="w-full bg-accent text-white rounded py-2" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : DEMO_AUTH_ENABLED ? 'Continue in demo mode' : 'Create account'}
        </button>
      </form>
    </div>
  )
}
