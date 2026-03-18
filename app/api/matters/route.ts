import { NextResponse } from 'next/server'
import { createMatter } from '@/services/matter'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requiresRoles } from '@/lib/rbac'
import { z } from 'zod'

const matterSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(4000).optional(),
  clientId: z.string().min(1).optional(),
  firmId: z.string().min(1).optional(),
  proBono: z.boolean().optional()
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requiresRoles(session.user.role, ['ADVOCATE', 'FIRM_ADMIN', 'FIRM_MEMBER', 'SUPER_ADMIN'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = matterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid matter payload' }, { status: 400 })
  }

  const matter = await createMatter({
    title: parsed.data.title,
    description: parsed.data.description,
    clientId: parsed.data.clientId,
    primaryAdvocateId: session.user.id,
    firmId: parsed.data.firmId,
    proBono: parsed.data.proBono,
    actorId: session.user.id
  })

  return NextResponse.json(matter)
}
