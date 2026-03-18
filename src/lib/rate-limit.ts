type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const existing = buckets.get(key)
  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterMs: windowMs }
  }

  existing.count += 1
  buckets.set(key, existing)

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, existing.resetAt - now) }
  }

  return { allowed: true, remaining: Math.max(0, limit - existing.count), retryAfterMs: Math.max(0, existing.resetAt - now) }
}
