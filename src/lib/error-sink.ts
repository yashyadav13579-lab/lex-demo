type ErrorEvent = {
  requestId: string
  route: string
  method: string
  status: number
  durationMs: number
  message: string
  meta?: Record<string, string | number | boolean | null | undefined>
}

function hasOtelConfig() {
  return Boolean(process.env.OTEL_LOGS_ENDPOINT)
}

function hasSentryConfig() {
  return Boolean(process.env.SENTRY_DSN)
}

async function sendToOtel(event: ErrorEvent) {
  const endpoint = process.env.OTEL_LOGS_ENDPOINT as string
  const authHeader = process.env.OTEL_LOGS_AUTH_HEADER

  await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authHeader ? { Authorization: authHeader } : {})
    },
    body: JSON.stringify({
      timestamp: new Date().toISOString(),
      severityText: 'ERROR',
      body: event.message,
      attributes: {
        requestId: event.requestId,
        route: event.route,
        method: event.method,
        status: event.status,
        durationMs: event.durationMs,
        ...(event.meta ?? {})
      }
    })
  })
}

function sentryStoreUrlFromDsn(dsn: string) {
  const parsed = new URL(dsn)
  const projectId = parsed.pathname.replace('/', '')
  const publicKey = parsed.username
  if (!projectId || !publicKey) return null
  return `${parsed.protocol}//${parsed.host}/api/${projectId}/store/?sentry_version=7&sentry_key=${publicKey}`
}

async function sendToSentry(event: ErrorEvent) {
  const dsn = process.env.SENTRY_DSN as string
  const storeUrl = sentryStoreUrlFromDsn(dsn)
  if (!storeUrl) return

  await fetch(storeUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: event.message,
      level: 'error',
      tags: {
        request_id: event.requestId,
        route: event.route,
        method: event.method
      },
      extra: {
        status: event.status,
        durationMs: event.durationMs,
        ...(event.meta ?? {})
      }
    })
  })
}

export async function emitErrorEvent(event: ErrorEvent) {
  try {
    if (hasOtelConfig()) {
      await sendToOtel(event)
    } else if (hasSentryConfig()) {
      await sendToSentry(event)
    }
  } catch {
    // Sink failures should not break API requests.
  }
}
