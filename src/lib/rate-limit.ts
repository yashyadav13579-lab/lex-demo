type Bucket = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterMs: number
}

const localBuckets = new Map<string, Bucket>()

function hasUpstashConfig() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return 'unknown'
}

function localRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const existing = localBuckets.get(key)
  if (!existing || now >= existing.resetAt) {
    localBuckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterMs: windowMs }
  }

  existing.count += 1
  localBuckets.set(key, existing)

  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, existing.resetAt - now) }
  }

  return { allowed: true, remaining: Math.max(0, limit - existing.count), retryAfterMs: Math.max(0, existing.resetAt - now) }
}

async function runUpstashCommand(command: Array<string | number>): Promise<number> {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL as string
  const token = process.env.UPSTASH_REDIS_REST_TOKEN as string
  const response = await fetch(`${baseUrl}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([command])
  })

  if (!response.ok) {
    throw new Error(`Upstash command failed with ${response.status}`)
  }

  const payload = (await response.json()) as Array<{ result?: number; error?: string }>
  const first = payload?.[0]
  if (!first || typeof first.result !== 'number') {
    throw new Error(first?.error || 'Invalid Upstash response')
  }
  return first.result
}

async function sharedRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const count = await runUpstashCommand(['INCR', key])
  if (count === 1) {
    await runUpstashCommand(['PEXPIRE', key, windowMs])
  }

  const ttl = await runUpstashCommand(['PTTL', key])
  if (count > limit) {
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(0, ttl) }
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - count),
    retryAfterMs: Math.max(0, ttl)
  }
}

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  if (!hasUpstashConfig()) {
    return localRateLimit(key, limit, windowMs)
  }

  try {
    return await sharedRateLimit(key, limit, windowMs)
  } catch {
    // Safe fallback so rate-limit outages don't break request handling.
    return localRateLimit(key, limit, windowMs)
  }
}
