import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type Announcement = {
  id: string;
  title: string;
  message: string;
  priority: number;
  created_at: string;
};

export default async function AnnouncementsPage() {
  const supabase = await createClient();

  const { data: announcements, error } = await supabase
    .from("announcements")
    .select("id, title, message, priority, created_at")
    .eq("published", true)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-orange-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="text-xl font-bold text-orange-600"
            >
              Ganesh Utsav 2026
            </Link>

            <Link
              href="/chanda"
              className="rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
            >
              Chanda
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-2xl bg-red-50 p-5 text-red-700">
            Unable to load announcements.
          </div>
        </div>
      </main>
    );
  }

  const items: Announcement[] = announcements ?? [];

  return (
    <main className="min-h-screen bg-orange-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-orange-600"
          >
            Ganesh Utsav 2026
          </Link>

          <Link
            href="/chanda"
            className="rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
          >
            Chanda
          </Link>
        </div>
      </header>

      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Ganesh Utsav 2026
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Announcements
          </h1>

          <p className="mt-3 text-gray-600">
            Important updates about the Ganesh Utsav.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="mx-auto max-w-4xl">
          {items.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center shadow">
              <p className="text-lg font-semibold text-gray-800">
                No announcements yet.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                New event updates will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((announcement) => (
                <article
                  key={announcement.id}
                  className="rounded-2xl bg-white p-6 shadow"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      {announcement.priority > 0 && (
                        <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          Important
                        </span>
                      )}

                      <h2 className="mt-2 text-2xl font-bold text-gray-900">
                        {announcement.title}
                      </h2>
                    </div>

                    <time
                      className="shrink-0 text-sm text-gray-500"
                      dateTime={announcement.created_at}
                    >
                      {new Date(
                        announcement.created_at
                      ).toLocaleString("en-IN")}
                    </time>
                  </div>

                  <p className="mt-4 whitespace-pre-line leading-7 text-gray-700">
                    {announcement.message}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t bg-white px-6 py-6">
        <div className="mx-auto max-w-6xl text-center text-sm text-gray-500">
          Ganesh Utsav 2026
        </div>
      </footer>
    </main>
  );
}