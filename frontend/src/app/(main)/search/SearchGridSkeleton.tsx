export default function SearchGridSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        <div className="h-12 flex-1 bg-neutral-900 border border-neutral-800 rounded-xl animate-shimmer relative overflow-hidden" />
        <div className="h-12 w-24 bg-neutral-900 border border-neutral-800 rounded-xl shrink-0 animate-shimmer relative overflow-hidden" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/2] rounded-md bg-neutral-900 border border-neutral-800 overflow-hidden relative"
          >
            <div className="w-full h-full animate-shimmer absolute inset-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
