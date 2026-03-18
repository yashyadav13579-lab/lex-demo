import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateDraft } from '@/services/ai'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const draft = await generateDraft({
    matterId: body.matterId,
    createdById: session.user.id,
    title: body.title,
    template: body.template,
    context: body.context
  })

  return NextResponse.json(draft)
}
