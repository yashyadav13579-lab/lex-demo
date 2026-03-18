export default function MattersLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-8 w-24 rounded bg-slate-200" />
        <div className="h-10 w-28 rounded bg-slate-200" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="h-5 w-1/3 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-1/4 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  )
}
