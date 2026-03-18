import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { isDemoAuthEnabled } from '@/lib/demo-auth'
import { z } from 'zod'
import { createRequestContext, finalizeRequest } from '@/lib/request-context'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { runWithIdempotency } from '@/lib/idempotency'

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
  const context = createRequestContext(request, 'POST /api/auth/sign-up')
  const ip = getClientIp(request)
  const rate = checkRateLimit(`signup:${ip}`, 10, 60_000)
  if (!rate.allowed) {
    return finalizeRequest(
      context,
      NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 }),
      { rateLimited: true }
    )
  }

  if (isDemoAuthEnabled()) {
    return finalizeRequest(
      context,
      NextResponse.json(
        { ok: true, demo: true, message: 'Demo mode: sign-up is preview-only and does not create accounts.' },
        { status: 200 }
      ),
      { demo: true }
    )
  }

  const raw = await request.json().catch(() => null)
  const parsed = signUpSchema.safeParse(raw)
  const { prisma } = await import('@/lib/prisma')

  if (!parsed.success) {
    return finalizeRequest(context, NextResponse.json({ error: 'Invalid sign-up payload' }, { status: 400 }))
  }

  const name = parsed.data.name.trim()
  const email = parsed.data.email.trim().toLowerCase()
  const password = parsed.data.password
  const role = parsed.data.role

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return finalizeRequest(context, NextResponse.json({ error: 'Email is already registered' }, { status: 409 }))
  }

  const idempotencyKey = request.headers.get('idempotency-key')
  const actorKey = `signup:${email}`
  let idempotent: { status: number; body: { ok?: boolean; error?: string }; replayed: boolean }
  try {
    idempotent = await runWithIdempotency({
      route: '/api/auth/sign-up',
      method: 'POST',
      actorKey,
      key: idempotencyKey,
      payload: { name, email, role: role ?? 'CLIENT' },
      execute: async () => {
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

        return { status: 200, body: { ok: true } }
      }
    })
  } catch {
    return finalizeRequest(context, NextResponse.json({ error: 'Unable to create account right now' }, { status: 500 }))
  }

  if (idempotent.status === 409) {
    return finalizeRequest(context, NextResponse.json(idempotent.body, { status: 409 }), { replayed: true })
  }

  if (idempotent.replayed) {
    const replay = NextResponse.json(idempotent.body, { status: idempotent.status })
    replay.headers.set('x-idempotent-replay', 'true')
    return finalizeRequest(context, replay, { replayed: true })
  }

  if (idempotent.status >= 500) {
    return finalizeRequest(context, NextResponse.json({ error: 'Unable to create account right now' }, { status: 500 }))
  }

  return finalizeRequest(context, NextResponse.json({ ok: true }))
}
