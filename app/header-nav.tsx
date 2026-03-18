'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useMemo, useState } from 'react'
import { isDemoAuthEnabled, useDemoAuth } from '@/lib/demo-auth'
import { DemoPersonaSwitcher } from './demo-persona-switcher'

type NavLink = {
  href: string
  label: string
}

function linksForRole(role?: string): NavLink[] {
  const baseLinks: NavLink[] = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/matters', label: 'Matters' }
  ]

  if (role === 'CLIENT') {
    return [...baseLinks, { href: '/intake', label: 'Intake' }, { href: '/messages', label: 'Messages' }]
  }

  if (role === 'ADVOCATE' || role === 'FIRM_MEMBER' || role === 'FIRM_ADMIN') {
    return [
      ...baseLinks,
      { href: '/messages', label: 'Messages' },
      { href: '/evidence', label: 'Evidence' },
      { href: '/drafts', label: 'Drafts' },
      { href: '/sos', label: 'SOS' }
    ]
  }

  if (role === 'ADMIN' || role === 'COMPLIANCE_ADMIN' || role === 'SUPER_ADMIN' || role === 'REVIEWER') {
    return [...baseLinks, { href: '/messages', label: 'Messages' }]
  }

  return baseLinks
}

function SignedOutNav() {
  return (
    <nav className="flex gap-4 text-sm text-slate-600">
      <Link href="/pricing">Pricing</Link>
      <Link href="/auth/sign-in">Sign in</Link>
      <Link href="/auth/sign-up" className="text-accent font-medium">
        Get started
      </Link>
    </nav>
  )
}

function DemoHeaderNav() {
  const router = useRouter()
  const { isReady, session, isSignedIn, clearSession } = useDemoAuth()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const roleLinks = useMemo(() => linksForRole(session?.user.role), [session?.user.role])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    clearSession()
    router.push('/auth/sign-in')
    setIsSigningOut(false)
  }

  if (!isReady) {
    return <nav className="text-sm text-slate-500">Loading session...</nav>
  }

  if (!isSignedIn) return <SignedOutNav />

  return (
    <nav className="flex items-center gap-4 text-sm text-slate-600">
      {roleLinks.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
      <DemoPersonaSwitcher />
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="rounded border px-3 py-1 text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSigningOut ? 'Signing out...' : 'Sign out'}
      </button>
    </nav>
  )
}

function RealHeaderNav() {
  const { data: session, status } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const signedIn = status === 'authenticated' && !!session?.user
  const roleLinks = useMemo(() => linksForRole(session?.user?.role), [session?.user?.role])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    await signOut({ callbackUrl: '/auth/sign-in' })
  }

  if (!signedIn) return <SignedOutNav />

  return (
    <nav className="flex items-center gap-4 text-sm text-slate-600">
      {roleLinks.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="rounded border px-3 py-1 text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSigningOut ? 'Signing out...' : 'Sign out'}
      </button>
    </nav>
  )
}

export function HeaderNav() {
  if (isDemoAuthEnabled()) return <DemoHeaderNav />
  return <RealHeaderNav />
}
