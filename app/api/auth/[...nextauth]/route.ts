import { isDemoAuthEnabled } from '@/lib/demo-auth'

async function handleDemoAwareAuth(request: Request, context: unknown) {
  if (isDemoAuthEnabled()) {
    return Response.json(
      {
        error: 'Demo auth mode is enabled. NextAuth API routes are disabled in this environment.'
      },
      { status: 404 }
    )
  }

  const NextAuth = (await import('next-auth')).default
  const { authOptions } = await import('@/lib/auth')
  const handler = NextAuth(authOptions)
  return handler(request, context as never)
}

export async function GET(request: Request, context: unknown) {
  return handleDemoAwareAuth(request, context)
}

export async function POST(request: Request, context: unknown) {
  return handleDemoAwareAuth(request, context)
}
