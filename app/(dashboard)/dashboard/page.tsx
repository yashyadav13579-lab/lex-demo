import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { Role } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { advocateProfile: true, clientProfile: true, firmMemberships: true }
  })

  const role = user?.role ?? Role.CLIENT

  const cards = [
    { title: 'Matters', href: '/matters', description: 'View and manage matters' },
    { title: 'Evidence', href: '/evidence', description: 'Uploads, hashes, and chain-of-custody' },
    { title: 'Drafts', href: '/drafts', description: 'AI-assisted drafts with validation' },
    { title: 'Messages', href: '/messages', description: 'Secure messaging' },
    { title: 'SOS', href: '/sos', description: 'Safety alert trigger and history', role: Role.ADVOCATE }
  ].filter((card) => !card.role || card.role === role || role === Role.SUPER_ADMIN)

  return (
    <div className=\"space-y-6\">
      <div>
        <p className=\"text-sm text-slate-600\">Welcome back</p>
        <h1 className=\"text-2xl font-semibold\">Dashboard</h1>
      </div>
      <div className=\"grid md:grid-cols-3 gap-4\">
        {cards.map((card) => (
          <a key={card.title} href={card.href} className=\"border bg-white rounded-lg p-4 shadow-sm block\">
            <h3 className=\"font-semibold\">{card.title}</h3>
            <p className=\"text-sm text-slate-600\">{card.description}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
