export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="h-8 w-40 rounded bg-slate-200" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="h-5 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-full rounded bg-slate-200" />
            <div className="mt-2 h-4 w-4/5 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
