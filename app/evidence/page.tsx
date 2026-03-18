import Link from 'next/link'

export default function EvidencePage() {
  const registerPreview = [
    {
      item: 'Witness statement bundle',
      source: 'Client upload',
      hash: 'Pending',
      access: 'No access events',
      version: 'v1',
      copyState: 'Original only'
    },
    {
      item: 'Contract annexure',
      source: 'Matter import',
      hash: 'Pending',
      access: 'No access events',
      version: 'v1',
      copyState: 'Original only'
    }
  ]

  return (
    <div className="max-w-4xl page-shell">
      <div>
        <p className="section-kicker">Evidence integrity workspace</p>
        <h1 className="mt-1 text-2xl font-semibold">Evidence</h1>
        <p className="mt-1 text-sm text-slate-600">
          Maintain provenance, access traceability, and document integrity across active matters.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">EV-01</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">Items tracked</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Original files and working copies.</p>
        </div>
        <div className="metric-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">EV-02</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">Integrity alerts</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Hash mismatch or missing provenance.</p>
        </div>
        <div className="metric-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">EV-03</p>
          <p className="text-xs uppercase tracking-wide text-slate-500">Recent access events</p>
          <p className="mt-2 text-2xl font-semibold">0</p>
          <p className="mt-1 text-xs text-slate-500">Role-bound evidence access records.</p>
        </div>
      </div>

      <section className="section-card p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Evidence provenance register</h2>
          <span className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">Preview mode</span>
        </div>
        <div className="overflow-x-auto rounded border">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 font-medium">Evidence item</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Hash status</th>
                <th className="px-3 py-2 font-medium">Access trail</th>
                <th className="px-3 py-2 font-medium">Version</th>
                <th className="px-3 py-2 font-medium">Copy state</th>
              </tr>
            </thead>
            <tbody>
              {registerPreview.map((row) => (
                <tr key={row.item} className="border-t">
                  <td className="px-3 py-2 text-slate-900">{row.item}</td>
                  <td className="px-3 py-2 text-slate-700">{row.source}</td>
                  <td className="px-3 py-2 text-slate-700">{row.hash}</td>
                  <td className="px-3 py-2 text-slate-700">{row.access}</td>
                  <td className="px-3 py-2 text-slate-700">{row.version}</td>
                  <td className="px-3 py-2 text-slate-700">{row.copyState}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="section-card p-6 space-y-4">
        <h2 className="text-lg font-semibold">No evidence has been registered yet</h2>
        <p className="text-sm text-slate-600">
          Evidence records are created when files are attached to a matter and initial provenance metadata is captured.
          This workspace will then show file lineage, access activity, and export readiness.
        </p>
        <div className="rounded border bg-slate-50 p-4 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Expected module surfaces</p>
          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>Original vs working copy inventory</li>
            <li>Hash and timestamp provenance trail</li>
            <li>Access timeline and export package status</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/matters/new" className="btn-primary">
            Create matter to add evidence
          </Link>
          <Link href="/matters" className="btn-secondary">
            Open matters
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
