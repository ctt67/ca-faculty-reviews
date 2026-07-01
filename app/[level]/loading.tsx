export default function LevelLoading() {
  return (
    <main className="min-h-screen">
      <section className="bg-navy">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="h-4 w-16 bg-white/10 rounded mb-6 animate-pulse" />
          <div className="h-10 w-40 bg-white/15 rounded animate-pulse" />
          <div className="h-4 w-52 bg-white/10 rounded mt-3 animate-pulse" />
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="h-8 w-28 bg-slate-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-slate-100 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="h-[3px] bg-slate-200" />
              <div className="p-6 sm:p-7 space-y-3">
                <div className="h-7 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-4 w-48 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gold/20 rounded animate-pulse mt-6" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
