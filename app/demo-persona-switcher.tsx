'use client'

import { useMemo } from 'react'
import { createDemoSessionForPersona, DEMO_PERSONAS, useDemoAuth } from '@/lib/demo-auth'

export function DemoPersonaSwitcher() {
  const { session, setSession } = useDemoAuth()

  const currentPersonaId = session?.user?.id ?? ''
  const currentRole = session?.user?.role ?? ''

  const options = useMemo(
    () =>
      DEMO_PERSONAS.map((persona) => ({
        id: persona.id,
        label: `${persona.name} (${persona.role})`
      })),
    []
  )

  const onChange = (personaId: string) => {
    const persona = DEMO_PERSONAS.find((item) => item.id === personaId)
    if (!persona) return
    setSession(createDemoSessionForPersona(persona))
  }

  return (
    <div className="flex items-center gap-2">
      <span className="rounded border bg-slate-50 px-2 py-1 text-xs text-slate-600">Demo: {currentRole}</span>
      <label htmlFor="demo-persona-switcher" className="sr-only">
        Switch demo persona
      </label>
      <select
        id="demo-persona-switcher"
        value={currentPersonaId}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border bg-white px-2 py-1 text-xs text-slate-700"
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
