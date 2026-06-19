export default function HomePage() {
  return (
    <main className="max-w-5xl mx-auto p-10">

      <h1 className="text-5xl font-bold">
        CA Faculty Reviews
      </h1>

      <p className="mt-3 text-gray-500">
        Reviews, ratings and comparisons
        by students.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-10">

        <a
          href="/final"
          className="border rounded-xl p-8 hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-bold">
            CA Final
          </h2>

          <p className="text-gray-500 mt-2">
            Faculty reviews for Final.
          </p>
        </a>

        <a
          href="/inter"
          className="border rounded-xl p-8 hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-bold">
            CA Intermediate
          </h2>

          <p className="text-gray-500 mt-2">
            Faculty reviews for Inter.
          </p>
        </a>

        <a
          href="/foundation"
          className="border rounded-xl p-8 hover:shadow-lg transition"
        >
          <h2 className="text-2xl font-bold">
            CA Foundation
          </h2>

          <p className="text-gray-500 mt-2">
            Faculty reviews for Foundation.
          </p>
        </a>

      </div>

      <div className="mt-10">

        <a
          href="/compare"
          className="border rounded-xl px-6 py-3 inline-block hover:shadow-md transition"
        >
          Compare Faculties
        </a>

      </div>

    </main>
  );
}