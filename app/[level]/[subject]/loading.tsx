export default function SubjectLoading() {
  return (
    <main className="min-h-screen">
      <section className="bg-navy">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="h-4 w-24 bg-white/10 rounded mb-6 animate-pulse" />
          <div className="h-9 w-48 bg-white/15 rounded animate-pulse" />
          <div className="h-4 w-64 bg-white/10 rounded mt-3 animate-pulse" />
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="h-[3px] bg-slate-200" />
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="h-6 w-40 bg-slate-200 rounded animate-pulse" />
                    <div className="flex gap-1.5">
                      <div className="h-5 w-20 bg-slate-100 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="h-8 w-14 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-10 bg-slate-100 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gold/20 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
