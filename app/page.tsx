export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-100">

      {/* Hero */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-4xl">

            <div className="inline-flex rounded-full bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-slate-300 mb-6">
              For CA Students by CA Students
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight text-white">
              Find the Best
              <span className="text-blue-500"> CA Faculty</span>
            </h1>

            <p className="mt-6 text-xl text-slate-400 max-w-2xl">
              Real reviews, ratings and comparisons across CA Final,
              Intermediate and Foundation — from students who've been there.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <a
                href="/compare"
                className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition"
              >
                Compare Faculties
              </a>
              <a
                href="/final"
                className="border border-slate-700 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition"
              >
                Browse Reviews
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-slate-800 border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-3 divide-x divide-slate-700">
          <div className="text-center px-4">
            <div className="text-2xl font-extrabold text-white">3</div>
            <div className="text-slate-400 text-sm mt-1">CA Levels</div>
          </div>
          <div className="text-center px-4">
            <div className="text-2xl font-extrabold text-white">10+</div>
            <div className="text-slate-400 text-sm mt-1">Subjects</div>
          </div>
          <div className="text-center px-4">
            <div className="text-2xl font-extrabold text-white">6</div>
            <div className="text-slate-400 text-sm mt-1">Rating Metrics</div>
          </div>
        </div>
      </section>

      {/* Levels */}
      <section className="max-w-6xl mx-auto px-6 py-20">

        <div className="mb-12">
          <h2 className="text-4xl font-bold text-slate-900">Browse by Level</h2>
          <p className="text-slate-500 mt-2">
            Choose your CA level and explore faculty reviews.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">

          <a
            href="/final"
            className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
              <span className="text-blue-600 font-extrabold text-lg">F</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">CA Final</h3>
            <p className="mt-3 text-slate-500 text-sm">
              FR, Audit, DT, IDT, AFM and more
            </p>
            <div className="mt-8 text-blue-600 font-semibold text-sm group-hover:underline">
              Browse Faculties →
            </div>
          </a>

          <a
            href="/inter"
            className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
              <span className="text-blue-600 font-extrabold text-lg">I</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">CA Intermediate</h3>
            <p className="mt-3 text-slate-500 text-sm">
              Accounts, Law, Tax, Costing and more
            </p>
            <div className="mt-8 text-blue-600 font-semibold text-sm group-hover:underline">
              Browse Faculties →
            </div>
          </a>

          <a
            href="/foundation"
            className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all group"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
              <span className="text-blue-600 font-extrabold text-lg">F</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">CA Foundation</h3>
            <p className="mt-3 text-slate-500 text-sm">
              All Foundation level subjects
            </p>
            <div className="mt-8 text-blue-600 font-semibold text-sm group-hover:underline">
              Browse Faculties →
            </div>
          </a>

        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-slate-900">How It Works</h2>
          <p className="text-slate-500 mt-2">Find your faculty in three steps.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Choose Your Level", desc: "Select CA Final, Intermediate or Foundation." },
            { step: "02", title: "Browse by Subject", desc: "Pick a subject and see all available faculties with ratings." },
            { step: "03", title: "Compare & Decide", desc: "Use our side-by-side comparison to pick the best faculty for you." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="text-4xl font-extrabold text-blue-100">{step}</div>
              <h3 className="text-xl font-bold text-slate-900 mt-3">{title}</h3>
              <p className="text-slate-500 text-sm mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-bold">
            Can't Decide Between Two Faculties?
          </h2>
          <p className="mt-4 text-blue-100 text-lg">
            Compare ratings, reviews, pricing and student experiences side-by-side.
          </p>
          <a
            href="/compare"
            className="inline-block mt-8 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-slate-100 transition"
          >
            Start Comparing
          </a>
        </div>
      </section>

    </main>
  );
}
