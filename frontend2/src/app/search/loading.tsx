export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-pulse">
      {/* Header skeleton */}
      <div className="text-center space-y-3 pt-4">
        <div className="h-12 w-64 bg-white/5 rounded-xl mx-auto" />
        <div className="w-20 h-1 bg-white/10 mx-auto rounded-full" />
        <div className="h-4 w-80 bg-white/5 rounded mx-auto" />
      </div>

      {/* Search bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
        <div className="h-12 flex-1 bg-neutral-900 border border-neutral-700 rounded-xl" />
        <div className="h-12 w-24 bg-neutral-700/30 rounded-xl shrink-0" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/2] rounded-md bg-white/5 border border-white/5 overflow-hidden"
          >
            <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
}
