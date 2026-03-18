import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { isDemoAuthEnabled } from '@/lib/demo-auth'
import { z } from 'zod'

const ALLOWED_ROLES = ['CLIENT', 'ADVOCATE', 'FIRM_ADMIN', 'FIRM_MEMBER'] as const
type Role = (typeof ALLOWED_ROLES)[number]
const signUpSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Za-z]/, 'Password must include at least one letter')
    .regex(/[0-9]/, 'Password must include at least one number'),
  role: z.enum(ALLOWED_ROLES).optional()
})

export async function POST(request: Request) {
  if (isDemoAuthEnabled()) {
    return NextResponse.json(
      { ok: true, demo: true, message: 'Demo mode: sign-up is preview-only and does not create accounts.' },
      { status: 200 }
    )
  }

  const raw = await request.json().catch(() => null)
  const parsed = signUpSchema.safeParse(raw)
  const { prisma } = await import('@/lib/prisma')

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid sign-up payload' }, { status: 400 })
  }

  const name = parsed.data.name.trim()
  const email = parsed.data.email.trim().toLowerCase()
  const password = parsed.data.password
  const role = parsed.data.role

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email is already registered' }, { status: 409 })
  }

  const passwordHash = await hash(password, 10)
  const normalizedRole: Role = ALLOWED_ROLES.includes(role as Role) ? (role as Role) : 'CLIENT'
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: normalizedRole
      }
    })

    if (normalizedRole === 'ADVOCATE') {
      await prisma.advocateProfile.create({
        data: {
          userId: user.id,
          verificationStatus: 'PENDING'
        }
      })
    }

    if (normalizedRole === 'CLIENT') {
      await prisma.clientProfile.create({ data: { userId: user.id } })
    }
  } catch {
    return NextResponse.json({ error: 'Unable to create account right now' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
