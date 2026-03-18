import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export type IdempotentResult<T> = {
  status: number
  body: T
  replayed: boolean
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => (a > b ? 1 : -1))
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`
}

function computeRequestHash(input: { route: string; method: string; actorKey: string; payload: unknown }) {
  return crypto
    .createHash('sha256')
    .update(`${input.route}:${input.method}:${input.actorKey}:${stableStringify(input.payload)}`)
    .digest('hex')
}

export async function runWithIdempotency<T>(params: {
  route: string
  method: 'POST' | 'PATCH' | 'DELETE'
  actorKey: string
  key: string | null
  payload: unknown
  execute: () => Promise<{ status: number; body: T }>
}) {
  const trimmed = params.key?.trim() ?? ''
  if (!trimmed) {
    const executed = await params.execute()
    return { ...executed, replayed: false } satisfies IdempotentResult<T>
  }

  const requestHash = computeRequestHash({
    route: params.route,
    method: params.method,
    actorKey: params.actorKey,
    payload: params.payload
  })

  const existing = await prisma.apiIdempotencyKey.findUnique({
    where: {
      actorKey_route_key: {
        actorKey: params.actorKey,
        route: params.route,
        key: trimmed
      }
    }
  })

  if (existing) {
    if (existing.requestHash !== requestHash) {
      return {
        status: 409,
        body: { error: 'Idempotency key conflict' } as T,
        replayed: true
      }
    }
    return {
      status: existing.statusCode,
      body: existing.responseBody as T,
      replayed: true
    }
  }

  const executed = await params.execute()
  try {
    await prisma.apiIdempotencyKey.create({
      data: {
        actorKey: params.actorKey,
        route: params.route,
        key: trimmed,
        method: params.method,
        requestHash,
        statusCode: executed.status,
        responseBody: executed.body as never
      }
    })
  } catch {
    // best effort; request already succeeded
  }

  return { ...executed, replayed: false } satisfies IdempotentResult<T>
}
