import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { registerEvidence } from '@/services/evidence'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { matterId, filename, mimeType, sizeBytes, storageUrl, tags, base64 } = body

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
