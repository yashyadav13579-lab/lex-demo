import { isDemoAuthEnabled } from '@/lib/demo-auth'
import { DemoDashboardPage } from './demo-page'

export default async function DashboardPage() {
  if (isDemoAuthEnabled()) {
    return <DemoDashboardPage />
  }

  const { getServerSession } = await import('next-auth')
  const { redirect } = await import('next/navigation')
  const Link = (await import('next/link')).default
  const { authOptions } = await import('@/lib/auth')
  const { prisma } = await import('@/lib/prisma')

  const session = await getServerSession(authOptions)
  const userId = session?.user?.id
  if (!userId) redirect('/auth/sign-in')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { advocateProfile: true, clientProfile: true, firmMemberships: true }
  })

  const role = user?.role ?? 'CLIENT'

  const cards = [
    { title: 'Matters', href: '/matters', description: 'View and manage matters' },
    { title: 'Evidence', href: '/evidence', description: 'Uploads, hashes, and chain-of-custody' },
    { title: 'Drafts', href: '/drafts', description: 'AI-assisted drafts with validation' },
    { title: 'Messages', href: '/messages', description: 'Secure messaging' },
    { title: 'SOS', href: '/sos', description: 'Safety alert trigger and history', role: 'ADVOCATE' }
  ].filter((card) => !card.role || card.role === role || role === 'SUPER_ADMIN')

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-600">Welcome back</p>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href} className="border bg-white rounded-lg p-4 shadow-sm block">
            <h3 className="font-semibold">{card.title}</h3>
            <p className="text-sm text-slate-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
