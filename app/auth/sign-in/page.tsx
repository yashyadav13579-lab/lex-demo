'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createDemoSessionForPersona, DEMO_MASTER_CREDENTIALS, DEMO_PERSONAS, useDemoAuth } from '@/lib/demo-auth'

const signInSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required')
})

type SignInValues = z.infer<typeof signInSchema>

export default function SignInPage() {
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)
  const [demoSigningInId, setDemoSigningInId] = useState<string | null>(null)
  const { enabled: demoEnabled, setSession: setDemoSession } = useDemoAuth()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (values: SignInValues) => {
    setFormError(null)
    if (demoEnabled) {
      const masterPersona = DEMO_PERSONAS.find((item) => item.id === DEMO_MASTER_CREDENTIALS.personaId)
      const isMasterLogin =
        values.email.toLowerCase() === DEMO_MASTER_CREDENTIALS.email &&
        values.password === DEMO_MASTER_CREDENTIALS.password

      if (isMasterLogin && masterPersona) {
        setDemoSession(createDemoSessionForPersona(masterPersona))
        router.push('/dashboard')
        return
      }

      setFormError('Demo mode is active. Use master demo credentials or select a demo persona below.')
      return
    }

    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      callbackUrl: '/dashboard',
      redirect: false
    })

    if (!result) {
      setFormError('Unable to sign in right now. Please try again.')
      return
    }

    if (result.error) {
      setFormError('Invalid email or password.')
      return
    }

    router.push(result.url || '/dashboard')
  }

  const handleDemoSignIn = async (personaId: string) => {
    const persona = DEMO_PERSONAS.find((item) => item.id === personaId)
    if (!persona) return

    setFormError(null)
    setDemoSigningInId(persona.id)
    setDemoSession(createDemoSessionForPersona(persona))
    router.push('/dashboard')
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 md:grid-cols-[1.1fr_1fr]">
      <section className="section-card">
        <p className="section-kicker">Secure access</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Sign in to LexSovereign</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Access your legal workspace with role-aware controls, evidence integrity safeguards, and validation-first
          drafting flow.
        </p>
        <div className="mt-5 space-y-2 text-sm text-slate-600">
          <p>• Structured workflows for matters, evidence, and counsel review</p>
          <p>• Professional role boundaries for advocates, chambers, and clients</p>
          <p>• Operational safety posture with auditable activity context</p>
        </div>
      </section>

      <section className="section-card space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Account sign-in</h2>
          <p className="mt-1 text-sm text-slate-600">Use your registered legal workspace credentials.</p>
        </div>
        <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
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
              autoComplete="current-password"
              disabled={isSubmitting}
              {...register('password')}
            />
            {errors.password ? <p className="mt-1 text-sm text-red-600">{errors.password.message}</p> : null}
          </div>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          <button type="submit" className="btn-primary w-full" disabled={isSubmitting || !!demoSigningInId}>
            {isSubmitting ? 'Signing in...' : demoEnabled ? 'Real sign-in unavailable in demo mode' : 'Sign in'}
          </button>
          <div className="flex items-center justify-between text-sm">
            <Link className="text-slate-600 hover:text-slate-900" href="/auth/sign-up">
              Create account
            </Link>
            <Link className="text-slate-600 hover:text-slate-900" href="/pricing">
              View plans
            </Link>
          </div>
        </form>
        {demoEnabled ? (
          <div className="border-t pt-4 space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Demo mode sign-in</h3>
              <p className="text-xs text-slate-600">
                Development/demo only. Select a predefined persona to enter the app without backend auth.
              </p>
            </div>
            <div className="space-y-2">
              {DEMO_PERSONAS.map((persona) => {
                const isLoading = demoSigningInId === persona.id
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handleDemoSignIn(persona.id)}
                    disabled={isSubmitting || !!demoSigningInId}
                    className="w-full rounded border bg-white px-3 py-2 text-left hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{persona.name}</span>
                      <span className="text-xs text-slate-500">{persona.role}</span>
                    </div>
                    <p className="text-xs text-slate-600">{persona.email}</p>
                    <p className="text-xs text-slate-500">
                      {isLoading ? 'Signing in...' : persona.description}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  )
}
