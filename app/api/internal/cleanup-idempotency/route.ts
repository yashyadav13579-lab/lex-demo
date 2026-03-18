import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createRequestContext, finalizeRequest } from '@/lib/request-context'

export async function GET(request: Request) {
  const context = createRequestContext(request, 'GET /api/internal/cleanup-idempotency')
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get('authorization')
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null

  if (!cronSecret || !bearer || bearer !== cronSecret) {
    return finalizeRequest(context, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }))
  }

  const ttlHours = Number.parseInt(process.env.IDEMPOTENCY_TTL_HOURS || '168', 10)
  const cutoff = new Date(Date.now() - ttlHours * 60 * 60 * 1000)

  const deleted = await prisma.apiIdempotencyKey.deleteMany({
    where: {
      createdAt: {
        lt: cutoff
      }
    }
  })

  return finalizeRequest(
    context,
    NextResponse.json({
      ok: true,
      deletedCount: deleted.count,
      ttlHours,
      cutoff: cutoff.toISOString()
    })
  )
}
