export default function LoadingSkeleton({ count = 1, className = "" }) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="mb-4 rounded-2xl border border-charcoal-100 bg-white p-5"
        >
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-charcoal-100" />
            <div className="h-5 w-16 animate-pulse rounded bg-charcoal-100" />
          </div>
          <div className="mt-4 h-8 w-24 animate-pulse rounded bg-charcoal-100" />
          <div className="mt-2 h-4 w-20 animate-pulse rounded bg-charcoal-100" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-charcoal-100 bg-white">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-charcoal-50 px-5 py-4 last:border-0">
          <div className="h-8 w-8 animate-pulse rounded-full bg-charcoal-100" />
          <div className="flex-1">
            <div className="h-4 w-32 animate-pulse rounded bg-charcoal-100" />
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-charcoal-100" />
          </div>
          <div className="h-4 w-16 animate-pulse rounded bg-charcoal-100" />
        </div>
      ))}
    </div>
  );
}
