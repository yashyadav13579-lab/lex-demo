import { NextResponse } from 'next/server'
import { createMatter } from '@/services/matter'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['ADVOCATE', 'FIRM_ADMIN', 'FIRM_MEMBER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const matter = await createMatter({
    title: body.title,
    description: body.description,
    clientId: body.clientId,
    primaryAdvocateId: session.user.id,
    firmId: body.firmId,
    proBono: body.proBono,
    actorId: session.user.id
  })

  return NextResponse.json(matter)
}
