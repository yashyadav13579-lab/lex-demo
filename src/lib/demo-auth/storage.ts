import type { DemoSession } from './types'

const DEMO_SESSION_STORAGE_KEY = 'lexsovereign.demo.session'

function canUseBrowserStorage() {
  return typeof window !== 'undefined' && !!window.localStorage
}

export function getDemoSession() {
  if (!canUseBrowserStorage()) return null

  const raw = window.localStorage.getItem(DEMO_SESSION_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as DemoSession
    if (!parsed?.user?.id || !parsed?.user?.email || !parsed?.user?.role) return null
    return parsed
  } catch {
    return null
  }
}

export function setDemoSession(session: DemoSession) {
  if (!canUseBrowserStorage()) return
  window.localStorage.setItem(DEMO_SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearDemoSession() {
  if (!canUseBrowserStorage()) return
  window.localStorage.removeItem(DEMO_SESSION_STORAGE_KEY)
}

export function getDemoSessionStorageKey() {
  return DEMO_SESSION_STORAGE_KEY
}
