'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createDemoSessionForPersona, DEMO_PERSONAS, useDemoAuth } from '@/lib/demo-auth'

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
      setFormError('Demo mode is active. Use a demo persona below to sign in.')
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
    <div className="max-w-md mx-auto bg-white border p-6 rounded-lg shadow-sm space-y-4">
      <h1 className="text-xl font-semibold">Sign in</h1>
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
        <button
          type="submit"
          className="w-full bg-accent text-white rounded py-2"
          disabled={isSubmitting || !!demoSigningInId}
        >
          {isSubmitting ? 'Signing in...' : demoEnabled ? 'Real sign-in unavailable in demo mode' : 'Sign in'}
        </button>
      </form>
      {demoEnabled ? (
        <div className="border-t pt-4 space-y-3">
          <div>
            <h2 className="text-sm font-semibold">Demo mode sign-in</h2>
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
    </div>
  )
}
