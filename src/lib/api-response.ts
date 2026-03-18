import { NextResponse } from 'next/server'

type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'INVALID_PAYLOAD'
  | 'INTERNAL_ERROR'
  | 'BAD_REQUEST'

export function apiSuccess<T>(data: T, init?: { status?: number }) {
  return NextResponse.json({ ok: true, data }, { status: init?.status ?? 200 })
}

export function apiError(
  status: number,
  error: string,
  code: ApiErrorCode,
  details?: Record<string, string | number | boolean | null | undefined>
) {
  return NextResponse.json(
    {
      ok: false,
      error,
      code,
      details: details ?? null
    },
    { status }
  )
}

export function parseQueryLimit(searchParams: URLSearchParams, fallback = 25, max = 100) {
  const raw = searchParams.get('limit')
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed) || parsed <= 0) return fallback
  return Math.min(parsed, max)
}

export function parseQueryOffset(searchParams: URLSearchParams, fallback = 0) {
  const raw = searchParams.get('offset')
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed) || parsed < 0) return fallback
  return parsed
}

export function apiPaginatedSuccess<T>(
  items: T[],
  pagination: {
    limit: number
    offset: number
    total: number
  }
) {
  return apiSuccess({
    items,
    page: {
      limit: pagination.limit,
      offset: pagination.offset,
      total: pagination.total,
      hasMore: pagination.offset + items.length < pagination.total
    }
  })
}
