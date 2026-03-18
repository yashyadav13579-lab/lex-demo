import Link from 'next/link'

export default function IntakeSummaryPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Intake summary</h1>
      <p className="text-slate-600">
        Intake review for this submission is under construction and will be available in an upcoming phase.
      </p>
      <p className="text-sm text-slate-500">Submission ID: {params.id}</p>
      <Link href="/intake" className="inline-block rounded border px-4 py-2">
        Back to intake
      </Link>
    </div>
  )
}
