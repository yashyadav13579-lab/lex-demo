'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import type { Session } from 'next-auth'
import { DemoAuthProvider, isDemoAuthEnabled } from '@/lib/demo-auth'

export function Providers({ children, session }: { children: ReactNode; session: Session | null }) {
  if (isDemoAuthEnabled()) {
    return <DemoAuthProvider>{children}</DemoAuthProvider>
  }

  return (
    <SessionProvider session={session}>
      <DemoAuthProvider>{children}</DemoAuthProvider>
    </SessionProvider>
  )
}
