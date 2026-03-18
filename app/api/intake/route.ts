import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'CLIENT') {
    return NextResponse.json({ error: 'Only clients can start intake' }, { status: 403 })
  }

  const body = await request.json()
  const submission = await prisma.intakeSubmission.create({
    data: {
      clientId: session.user.id,
      issueCategory: body.issueCategory,
      urgency: body.urgency,
      answers: {
        create: (body.answers || []).map((ans: { key: string; value: string }) => ({
          questionKey: ans.key,
          answer: ans.value
        }))
      }
    }
  })

  return NextResponse.json(submission)
}
