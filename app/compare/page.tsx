"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ComparePage() {
  const router = useRouter();

  const [faculties, setFaculties] =
    useState<any[]>([]);

  const [subject, setSubject] =
    useState("");

  const [faculty1, setFaculty1] =
    useState("");

  const [faculty2, setFaculty2] =
    useState("");

  useEffect(() => {
    const loadFaculties = async () => {
      const { data } = await supabase
        .from("faculties")
        .select("*")
        .eq("active", true);

      setFaculties(data ?? []);
    };

    loadFaculties();
  }, []);

  const subjects = [
    ...new Set(
      faculties.map(
        (faculty) => faculty.subject
      )
    ),
  ];

  const filteredFaculties =
    faculties.filter(
      (faculty) =>
        faculty.subject === subject
    );

  const handleCompare = () => {
    if (!faculty1 || !faculty2) {
      alert(
        "Please select both faculties"
      );
      return;
    }

    if (faculty1 === faculty2) {
      alert(
        "Please select different faculties"
      );
      return;
    }

    router.push(
      `/compare/${faculty1}/${faculty2}`
    );
  };

  return (
    <main className="max-w-3xl mx-auto p-10">

      <h1 className="text-4xl font-bold">
        Compare Faculties
      </h1>

      <p className="mt-2 text-gray-500">
        Select a subject and two faculties.
      </p>

      <div className="mt-8 space-y-6">

        <div>

          <label className="block mb-2">
            Subject
          </label>

          <select
            value={subject}
            onChange={(e) => {
              setSubject(
                e.target.value
              );
              setFaculty1("");
              setFaculty2("");
            }}
            className="w-full border rounded-lg p-3"
          >

            <option value="">
              Select Subject
            </option>

            {subjects.map(
              (subject) => (
                <option
                  key={subject}
                  value={subject}
                >
                  {subject}
                </option>
              )
            )}

          </select>

        </div>

        {subject && (
          <>
            <div>

              <label className="block mb-2">
                Faculty 1
              </label>

              <select
                value={faculty1}
                onChange={(e) =>
                  setFaculty1(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              >

                <option value="">
                  Select Faculty
                </option>

                {filteredFaculties.map(
                  (faculty) => (
                    <option
                      key={
                        faculty.slug
                      }
                      value={
                        faculty.slug
                      }
                    >
                      {
                        faculty.faculty_name
                      }
                    </option>
                  )
                )}

              </select>

            </div>

            <div>

              <label className="block mb-2">
                Faculty 2
              </label>

              <select
                value={faculty2}
                onChange={(e) =>
                  setFaculty2(
                    e.target.value
                  )
                }
                className="w-full border rounded-lg p-3"
              >

                <option value="">
                  Select Faculty
                </option>

                {filteredFaculties.map(
                  (faculty) => (
                    <option
                      key={
                        faculty.slug
                      }
                      value={
                        faculty.slug
                      }
                    >
                      {
                        faculty.faculty_name
                      }
                    </option>
                  )
                )}

              </select>

            </div>
          </>
        )}

        <button
          onClick={handleCompare}
          className="border rounded-xl px-6 py-3 hover:bg-gray-50"
        >
          Compare
        </button>

      </div>

    </main>
  );
}