export function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-2 flex items-center justify-between">
        <div className="h-6 w-32 rounded bg-surface-hover" />
        <div className="h-8 w-40 rounded-lg bg-surface-hover" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[68px] rounded-xl border border-border bg-surface" />
        ))}
        <div className="col-span-2 grid grid-cols-3 gap-3 sm:col-span-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[52px] rounded-xl border border-border bg-surface" />
          ))}
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-surface-hover" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-[72px] rounded-xl border border-border bg-surface" />
        ))}
      </div>
    </div>
  );
}
