export default function FacultyLoading() {
  return (
    <main className="min-h-screen">
      {/* Hero skeleton */}
      <section className="bg-navy">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="h-4 w-24 bg-white/10 rounded mb-6 animate-pulse" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-white/10 rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-white/10 rounded-full animate-pulse" />
              </div>
              <div className="h-9 w-64 bg-white/15 rounded animate-pulse" />
              <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-14 w-24 bg-white/15 rounded animate-pulse" />
              <div className="h-3 w-20 bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Body skeleton */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="order-2 lg:order-1 lg:col-span-1 space-y-5">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            <div className="h-12 bg-gold/30 rounded-xl animate-pulse" />
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-3">
              <div className="h-5 w-36 bg-slate-200 rounded animate-pulse mb-4" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <div className="h-3 w-28 bg-slate-100 rounded animate-pulse mb-2" />
                  <div className="flex gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-4 w-5 bg-slate-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="order-1 lg:order-2 lg:col-span-2 space-y-5">
            <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mb-7" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm p-6 sm:p-7 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j}>
                      <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse mb-1.5" />
                      <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-20 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
