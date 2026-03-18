import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { registerEvidence } from '@/services/evidence'
import { requiresRoles } from '@/lib/rbac'
import { z } from 'zod'

const evidenceSchema = z.object({
  matterId: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  storageUrl: z.string().min(1),
  tags: z.array(z.string()).optional(),
  base64: z.string().optional()
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!requiresRoles(session.user.role, ['CLIENT', 'ADVOCATE', 'FIRM_MEMBER', 'FIRM_ADMIN', 'SUPER_ADMIN'])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = evidenceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid evidence payload' }, { status: 400 })
  }

  const { matterId, filename, mimeType, sizeBytes, storageUrl, tags, base64 } = parsed.data

  const buffer = base64 ? Buffer.from(base64, 'base64') : undefined
  const evidence = await registerEvidence({
    matterId,
    uploadedById: session.user.id,
    filename,
    mimeType,
    sizeBytes,
    storageUrl,
    buffer,
    tags
  })

  return NextResponse.json(evidence)
}
