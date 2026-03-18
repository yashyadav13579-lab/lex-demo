import Link from 'next/link'
import { isDemoAuthEnabled } from '@/lib/demo-auth'
import { DemoMessagesPage } from './demo-page'

export default function MessagesPage() {
  if (isDemoAuthEnabled()) {
    return <DemoMessagesPage />
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">Secure communication for matters and collaboration.</p>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">No messages yet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Conversations will appear here once a thread is started.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/dashboard" className="rounded bg-accent px-4 py-2 text-white">
            Back to dashboard
          </Link>
          <Link href="/matters" className="rounded border px-4 py-2">
            View matters
          </Link>
        </div>
      </div>
    </div>
  )
}
