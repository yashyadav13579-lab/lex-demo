import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSOSIncident } from '@/services/sos'
import { requiresRoles } from '@/lib/rbac'
import { z } from 'zod'

const sosSchema = z.object({
  description: z.string().trim().max(1000).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional()
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requiresRoles(session.user.role, ['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'SUPER_ADMIN'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = sosSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid incident payload' }, { status: 400 })
  }

  const incident = await createSOSIncident({
    advocateId: session.user.id,
    description: parsed.data.description,
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude
  })

  return NextResponse.json(incident)
}
