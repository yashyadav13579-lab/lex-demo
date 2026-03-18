import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { requiresRoles } from '@/lib/rbac'
import { z } from 'zod'

const intakeSchema = z.object({
  issueCategory: z.string().trim().min(2).max(120),
  urgency: z.string().trim().min(1).max(40).optional(),
  answers: z
    .array(
      z.object({
        key: z.string().min(1),
        value: z.string().max(5000)
      })
    )
    .optional()
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requiresRoles(session.user.role, ['CLIENT'])) {
    return NextResponse.json({ error: 'Only clients can start intake' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = intakeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid intake payload' }, { status: 400 })
  }

  const submission = await prisma.intakeSubmission.create({
    data: {
      clientId: session.user.id,
      issueCategory: parsed.data.issueCategory,
      urgency: parsed.data.urgency,
      answers: {
        create: (parsed.data.answers || []).map((ans) => ({
          questionKey: ans.key,
          answer: ans.value
        }))
      }
    }
  })

  return NextResponse.json(submission)
}
