import { isDemoAuthEnabled } from '@/lib/demo-auth'
import { DemoMattersPage } from './demo-page'

function statusStyle(status: string) {
  const normalized = status.toUpperCase()
  if (normalized === 'OPEN' || normalized === 'ACTIVE') return 'bg-emerald-50 text-emerald-700'
  if (normalized === 'DRAFT' || normalized === 'PENDING') return 'bg-amber-50 text-amber-700'
  if (normalized === 'PAUSED') return 'bg-slate-100 text-slate-700'
  if (normalized === 'CLOSED') return 'bg-slate-200 text-slate-800'
  return 'bg-slate-100 text-slate-700'
}

type MatterListItem = {
  id: string
  title: string
  status: string
  client: { name: string | null } | null
  primaryAdvocate: { name: string | null } | null
}

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
  const userId = session?.user?.id
  if (!userId) redirect('/auth/sign-in')

  const matters = (await prisma.matter.findMany({
    where: {
      OR: [
        { primaryAdvocateId: userId },
        { clientId: userId },
        { assignments: { some: { userId } } }
      ]
    },
    include: { client: true, primaryAdvocate: true }
  })) as MatterListItem[]

  return (
    <div className="page-shell">
      <div className="page-header">
        <p className="section-kicker">Matter workspace</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Matters</h1>
            <p className="mt-1 text-sm text-slate-600">
              Legal workspaces with status, role context, and progression milestones.
            </p>
          </div>
          <div className="flex gap-2">
            <Link className="btn-secondary px-3 py-2" href="/dashboard">
              Back to dashboard
            </Link>
            <Link className="btn-primary px-3 py-2" href="/matters/new">
              New matter
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total matters</p>
          <p className="mt-2 text-2xl font-semibold">{matters.length}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Active / open</p>
          <p className="mt-2 text-2xl font-semibold">
            {matters.filter((matter: MatterListItem) => ['OPEN', 'ACTIVE'].includes(matter.status.toUpperCase())).length}
          </p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-wide text-slate-500">Draft / pending</p>
          <p className="mt-2 text-2xl font-semibold">
            {matters.filter((matter: MatterListItem) => ['DRAFT', 'PENDING'].includes(matter.status.toUpperCase())).length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Matter list</h2>
        {matters.length === 0 ? (
          <div className="section-card p-6">
            <h3 className="text-lg font-semibold">No matters available yet</h3>
            <p className="mt-1 text-sm text-slate-600">
              Create a matter to initialize legal chronology, evidence linkage, draft workflow, and activity tracking.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/matters/new" className="btn-primary px-3 py-2">
                Create first matter
              </Link>
              <Link href="/intake" className="btn-secondary px-3 py-2">
                Start from intake
              </Link>
            </div>
          </div>
        ) : (
          matters.map(
            (m: MatterListItem) => (
              <Link key={m.id} href={`/matters/${m.id}`} className="block rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{m.title}</h3>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusStyle(m.status)}`}>{m.status}</span>
                </div>
                <div className="mt-2 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                  <p>Client: {m.client?.name ?? 'Unassigned'}</p>
                  <p>Lead advocate: {m.primaryAdvocate?.name ?? 'Unassigned'}</p>
                  <p>Record ID: {m.id}</p>
                </div>
              </Link>
            )
          )
        )}
      </div>
    </div>
  )
}
