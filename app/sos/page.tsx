import Link from 'next/link'
import { isDemoAuthEnabled } from '@/lib/demo-auth'
import { DemoSOSPage } from './demo-page'

export default function SOSPage() {
  if (isDemoAuthEnabled()) {
    return <DemoSOSPage />
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">SOS</h1>
        <p className="mt-1 text-sm text-slate-600">Monitor emergency incidents and response history.</p>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">No SOS incidents yet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Any future emergency alerts and status updates will be listed here.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/dashboard" className="rounded bg-accent px-4 py-2 text-white">
            Back to dashboard
          </Link>
          <Link href="/messages" className="rounded border px-4 py-2">
            Go to messages
          </Link>
        </div>
      </div>
    </div>
  )
}
