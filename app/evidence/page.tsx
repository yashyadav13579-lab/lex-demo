import Link from 'next/link'

export default function EvidencePage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Evidence</h1>
        <p className="mt-1 text-sm text-slate-600">Track uploaded files and chain-of-custody activity.</p>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">No evidence items yet</h2>
        <p className="mt-2 text-sm text-slate-600">
          Uploaded evidence linked to your matters will appear here.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/matters" className="rounded bg-accent px-4 py-2 text-white">
            Go to matters
          </Link>
          <Link href="/dashboard" className="rounded border px-4 py-2">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
