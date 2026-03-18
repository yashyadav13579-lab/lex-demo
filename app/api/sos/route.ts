import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSOSIncident } from '@/services/sos'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!['ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const incident = await createSOSIncident({
    advocateId: session.user.id,
    description: body.description,
    latitude: body.latitude,
    longitude: body.longitude
  })

  return NextResponse.json(incident)
}
