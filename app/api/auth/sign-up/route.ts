import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'
import { Role, VerificationStatus } from '@prisma/client'

export async function POST(request: Request) {
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

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: (role as Role) ?? Role.CLIENT
    }
  })

  if (role === Role.ADVOCATE) {
    await prisma.advocateProfile.create({
      data: {
        userId: user.id,
        verificationStatus: VerificationStatus.PENDING
      }
    })
  }

  if (role === Role.CLIENT) {
    await prisma.clientProfile.create({ data: { userId: user.id } })
  }

  return NextResponse.json({ ok: true })
}
