import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const { data, error } = await supabase
    .from("faculties")
    .select("*");

  return (
    <main className="p-10">
      <h1>Supabase Test</h1>

      <pre>
        {JSON.stringify(
          { data, error },
          null,
          2
        )}
      </pre>
    </main>
  );
}
