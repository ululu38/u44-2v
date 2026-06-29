export default function SolutionLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-pulse">
      {/* Header skeleton */}
      <div className="text-center space-y-3 pt-4">
        <div className="h-12 w-64 bg-white/5 rounded-xl mx-auto" />
        <div className="w-20 h-1 bg-white/10 mx-auto rounded-full" />
        <div className="h-4 w-80 bg-white/5 rounded mx-auto" />
      </div>

      {/* Hero Swiper Skeleton */}
      <div className="relative pt-12 pb-16 px-4 overflow-hidden border border-neutral-800 rounded-3xl bg-neutral-900/50">
        <div className="h-8 w-48 bg-white/5 rounded-xl mx-auto mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-[1200px] mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/2] rounded-xl bg-white/5 border border-white/5" />
          ))}
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/2] rounded-2xl bg-white/5 border border-white/5 overflow-hidden"
          >
            <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
          </div>
        ))}
      </div>
    </div>
  );
}
