import { NextResponse } from 'next/server'
import { createRequestContext, finalizeRequest } from '@/lib/request-context'

function hasValue(value: string | undefined) {
  return Boolean(value && value.trim().length > 0)
}

export async function GET(request: Request) {
  const context = createRequestContext(request, 'GET /api/internal/deployment-status')
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

  if (!cronSecret || !bearer || bearer !== cronSecret) {
    return finalizeRequest(context, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  }

  const status = {
    ok: true,
    mode: {
      demoAuthEnabled: process.env.NEXT_PUBLIC_DEMO_AUTH_ENABLED === 'true'
    },
    env: {
      hasDatabaseUrl: hasValue(process.env.DATABASE_URL),
      hasNextAuthSecret: hasValue(process.env.NEXTAUTH_SECRET),
      hasNextAuthUrl: hasValue(process.env.NEXTAUTH_URL),
      hasCronSecret: hasValue(process.env.CRON_SECRET),
      hasUpstashUrl: hasValue(process.env.UPSTASH_REDIS_REST_URL),
      hasUpstashToken: hasValue(process.env.UPSTASH_REDIS_REST_TOKEN),
      hasSentryDsn: hasValue(process.env.SENTRY_DSN),
      hasOtelLogsEndpoint: hasValue(process.env.OTEL_LOGS_ENDPOINT)
    }
  }

  return finalizeRequest(context, NextResponse.json(status))
}
