import Link from 'next/link'

export default function NewMatterPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">New matter</h1>
      <p className="text-slate-600">
        Matter creation is under construction and will be available in an upcoming phase.
      </p>
      <Link href="/matters" className="inline-block rounded border px-4 py-2">
        Back to matters
      </Link>
    </div>
  )
}
