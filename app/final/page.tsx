import { supabase } from "@/lib/supabase";

export default async function FinalPage() {
  const { data: faculties } = await supabase
    .from("faculties")
    .select("subject");

  const subjects = [
    ...new Set(
      faculties?.map(
        (faculty) => faculty.subject
      ) ?? []
    ),
  ];

  return (
    <main className="max-w-7xl mx-auto p-10">

      <h1 className="text-4xl font-bold">
        CA Final
      </h1>

      <p className="mt-2 text-gray-500">
        Browse faculty reviews by subject.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

        {subjects.map((subject) => (
          <a
            key={subject}
            href={`/final/${subject.toLowerCase()}`}
            className="border rounded-xl p-6 hover:border-gray-400 hover:shadow-lg transition-all block"
          >

            <h2 className="text-2xl font-bold">
              {subject}
            </h2>

            <p className="mt-3 text-gray-600">
              Browse faculty reviews and comparisons.
            </p>

            <div className="mt-6 text-sm font-medium text-gray-500">
              Browse Faculties →
            </div>

          </a>
        ))}

      </div>

    </main>
  );
}