import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createSOSIncident } from '@/services/sos'
import { Role } from '@prisma/client'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== Role.ADVOCATE && session.user.role !== Role.FIRM_MEMBER && session.user.role !== Role.FIRM_ADMIN) {
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
