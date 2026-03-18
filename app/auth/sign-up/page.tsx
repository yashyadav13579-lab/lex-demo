'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
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
const ROLE_EXPLANATIONS: Record<(typeof APPROVED_ROLES)[number], { label: string; detail: string }> = {
  ADVOCATE: {
    label: 'Advocate',
    detail: 'For legal professionals managing matters, evidence, drafting, and counsel review workflow.'
  },
  CLIENT: {
    label: 'Client',
    detail: 'For individuals or organizations submitting intake and collaborating with assigned counsel.'
  },
  FIRM_ADMIN: {
    label: 'Firm/Chamber Admin',
    detail: 'For practice leads coordinating teams, assignments, and governance visibility.'
  }
}

export default function SignUpPage() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const {
    watch,
    setValue,
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
  const selectedRole = watch('role')

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
    <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[1.1fr_1fr]">
      <section className="section-card">
        <p className="section-kicker">Structured onboarding</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Create your LexSovereign account</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Accounts are role-scoped so workflow, permissions, and validation paths align with legal operations from day
          one.
        </p>
        <div className="mt-5 space-y-2 text-sm text-slate-600">
          <p>• Professional role framing for advocate, client, and chamber operations</p>
          <p>• Verification-aware account posture for trusted collaboration</p>
          <p>• Intake, matter, evidence, and draft workflow continuity</p>
        </div>
      </section>

      <section className="section-card space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Account details</h2>
          <p className="mt-1 text-sm text-slate-600">Use at least 8 characters with letters and numbers.</p>
        </div>
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

          <div className="space-y-2">
            <p className="text-sm font-medium">Role</p>
            <input type="hidden" {...register('role')} />
            <div className="space-y-2">
              {(Object.keys(ROLE_EXPLANATIONS) as Array<(typeof APPROVED_ROLES)[number]>).map((role) => {
                const roleMeta = ROLE_EXPLANATIONS[role]
                const selected = selectedRole === role
                return (
                  <button
                    key={role}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setValue('role', role, { shouldValidate: true })}
                    className={`w-full rounded border p-3 text-left transition ${
                      selected ? 'border-accent bg-slate-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-900">{roleMeta.label}</p>
                    <p className="mt-1 text-xs text-slate-600">{roleMeta.detail}</p>
                  </button>
                )
              })}
            </div>
            {errors.role ? <p className="text-sm text-red-600">{errors.role.message}</p> : null}
          </div>

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          {successMessage ? <p className="text-sm text-green-700">{successMessage}</p> : null}
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : DEMO_AUTH_ENABLED ? 'Continue in demo mode' : 'Create account'}
          </button>
          <div className="flex items-center justify-between text-sm">
            <Link className="text-slate-600 hover:text-slate-900" href="/auth/sign-in">
              Already have an account
            </Link>
            <Link className="text-slate-600 hover:text-slate-900" href="/pricing">
              Review plans
            </Link>
          </div>
        </form>
      </section>
    </div>
  )
}
