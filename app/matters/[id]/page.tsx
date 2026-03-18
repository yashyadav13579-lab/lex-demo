import Link from 'next/link'
import { isDemoAuthEnabled } from '@/lib/demo-auth'
import { DemoMatterDetailPage } from './demo-page'

export default function MatterDetailPage({ params }: { params: { id: string } }) {
  if (isDemoAuthEnabled()) {
    return <DemoMatterDetailPage id={params.id} />
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold">Matter details</h1>
      <p className="text-slate-600">
        The matter workspace for this record is under construction and will be available in an upcoming phase.
      </p>
      <p className="text-sm text-slate-500">Matter ID: {params.id}</p>
      <Link href="/matters" className="inline-block rounded border px-4 py-2">
        Back to matters
      </Link>
    </div>
  )
}
