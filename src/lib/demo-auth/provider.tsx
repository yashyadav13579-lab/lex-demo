'use client'

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { isDemoAuthEnabled } from './config'
import { clearDemoSession, getDemoSession, getDemoSessionStorageKey, setDemoSession } from './storage'
import type { DemoSession } from './types'

type DemoAuthContextValue = {
  enabled: boolean
  isReady: boolean
  session: DemoSession | null
  isSignedIn: boolean
  setSession: (session: DemoSession) => void
  clearSession: () => void
}

const DemoAuthContext = createContext<DemoAuthContextValue | null>(null)

export function DemoAuthProvider({ children }: { children: ReactNode }) {
  const enabled = isDemoAuthEnabled()
  const [isReady, setIsReady] = useState(false)
  const [session, setSessionState] = useState<DemoSession | null>(null)

  useEffect(() => {
    if (!enabled) {
      setSessionState(null)
      setIsReady(true)
      return
    }

    setSessionState(getDemoSession())
    setIsReady(true)
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    const storageKey = getDemoSessionStorageKey()
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return
      setSessionState(getDemoSession())
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [enabled])

  const value = useMemo<DemoAuthContextValue>(
    () => ({
      enabled,
      isReady,
      session,
      isSignedIn: !!session?.user,
      setSession: (nextSession) => {
        setDemoSession(nextSession)
        setSessionState(nextSession)
      },
      clearSession: () => {
        clearDemoSession()
        setSessionState(null)
      }
    }),
    [enabled, isReady, session]
  )

  return <DemoAuthContext.Provider value={value}>{children}</DemoAuthContext.Provider>
}

export function useDemoAuth() {
  const context = useContext(DemoAuthContext)
  if (!context) {
    throw new Error('useDemoAuth must be used inside DemoAuthProvider')
  }
  return context
}
