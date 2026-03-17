import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function MattersPage() {
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
        <a className="px-3 py-2 bg-accent text-white rounded" href="/matters/new">
          New matter
        </a>
      </div>
      <div className="space-y-2">
        {matters.map((m) => (
          <a key={m.id} href={`/matters/${m.id}`} className="block border bg-white p-4 rounded-lg shadow-sm">
            <div className="font-semibold">{m.title}</div>
            <div className="text-sm text-slate-600">Status: {m.status}</div>
            <div className="text-sm text-slate-600">
              Client: {m.client?.name ?? 'N/A'} | Advocate: {m.primaryAdvocate?.name ?? 'N/A'}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
