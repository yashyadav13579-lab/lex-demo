import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { isDemoAuthEnabled } from '@/lib/demo-auth'

const ALLOWED_ROLES = ['CLIENT', 'ADVOCATE', 'FIRM_ADMIN', 'FIRM_MEMBER'] as const
type Role = (typeof ALLOWED_ROLES)[number]

export async function POST(request: Request) {
  if (isDemoAuthEnabled()) {
    return NextResponse.json(
      { ok: true, demo: true, message: 'Demo mode: sign-up is preview-only and does not create accounts.' },
      { status: 200 }
    )
  }

  const data = await request.json()
  const { name, email, password, role } = data || {}

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'User exists' }, { status: 400 })
  }

  const passwordHash = await hash(password, 10)
  const normalizedRole: Role = ALLOWED_ROLES.includes(role as Role) ? (role as Role) : 'CLIENT'

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

  return NextResponse.json({ ok: true })
}
