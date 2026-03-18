import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateDraft } from '@/services/ai'
import { requiresRoles } from '@/lib/rbac'
import { z } from 'zod'

const draftSchema = z.object({
  matterId: z.string().min(1),
  title: z.string().trim().min(3).max(200),
  template: z.string().trim().min(1).optional(),
  context: z.unknown().optional()
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requiresRoles(session.user.role, ['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'SUPER_ADMIN'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = draftSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid draft payload' }, { status: 400 })
  }

  const draft = await generateDraft({
    matterId: parsed.data.matterId,
    createdById: session.user.id,
    title: parsed.data.title,
    template: parsed.data.template,
    context: parsed.data.context as Record<string, unknown> | unknown[] | string | number | boolean | null | undefined
  })

  return NextResponse.json(draft)
}
