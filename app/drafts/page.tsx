import Link from 'next/link'

export default function DraftsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Drafts</h1>
        <p className="mt-1 text-sm text-slate-600">Review and manage document drafts with validation controls.</p>
      </div>
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">No drafts yet</h2>
        <p className="mt-2 text-sm text-slate-600">Generated and manually created drafts will appear here.</p>
        <div className="mt-4 flex gap-3">
          <Link href="/matters" className="rounded bg-accent px-4 py-2 text-white">
            Open matters
          </Link>
          <Link href="/dashboard" className="rounded border px-4 py-2">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
