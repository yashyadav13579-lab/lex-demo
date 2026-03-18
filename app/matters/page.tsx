import { isDemoAuthEnabled } from '@/lib/demo-auth'
import { DemoMattersPage } from './demo-page'

export default async function MattersPage() {
  if (isDemoAuthEnabled()) {
    return <DemoMattersPage />
  }

  const { getServerSession } = await import('next-auth')
  const { authOptions } = await import('@/lib/auth')
  const { prisma } = await import('@/lib/prisma')
  const { redirect } = await import('next/navigation')
  const Link = (await import('next/link')).default

  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/auth/sign-in')

  const matters = await prisma.matter.findMany({
    where: {
      OR: [
        { primaryAdvocateId: session.user.id },
        { clientId: session.user.id },
        { assignments: { some: { userId: session.user.id } } }
      ]
    },
    include: { client: true, primaryAdvocate: true }
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Matters</h1>
        <Link className="px-3 py-2 bg-accent text-white rounded" href="/matters/new">
          New matter
        </Link>
      </div>
      <div className="space-y-2">
        {matters.length === 0 ? (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">No matters yet</h2>
            <p className="mt-1 text-sm text-slate-600">
              Create your first matter to start tracking work, parties, and evidence.
            </p>
            <Link href="/matters/new" className="mt-4 inline-block rounded bg-accent px-3 py-2 text-white">
              Create matter
            </Link>
          </div>
        ) : (
          matters.map((m) => (
            <Link key={m.id} href={`/matters/${m.id}`} className="block border bg-white p-4 rounded-lg shadow-sm">
              <div className="font-semibold">{m.title}</div>
              <div className="text-sm text-slate-600">Status: {m.status}</div>
              <div className="text-sm text-slate-600">
                Client: {m.client?.name ?? 'N/A'} | Advocate: {m.primaryAdvocate?.name ?? 'N/A'}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
