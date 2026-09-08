import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";

export const instant = false;

type Announcement = {
  id: string;
  title: string;
  message: string;
  priority: number;
  created_at: string;
};

export default async function Home() {
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, title, message, priority, created_at")
    .eq("published", true)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  const latestAnnouncements: Announcement[] = announcements ?? [];

  return (
    <main className="min-h-screen bg-orange-50">
      <Navbar />

      {/* Hero */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-orange-600 px-6 py-16 text-center text-white shadow-xl md:px-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">
              Hostel Ganesh Utsav 2026
            </p>

            <h1 className="mt-4 text-4xl font-bold md:text-6xl">
              Ganpati Bappa Morya
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-lg text-orange-100">
              Celebrating Ganesh Chaturthi together as one hostel family.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/chanda"
                className="rounded-xl bg-white px-6 py-3 font-bold text-orange-700 hover:bg-orange-50"
              >
                Contribute Chanda
              </Link>

              <Link
                href="/schedule"
                className="rounded-xl border border-white px-6 py-3 font-bold text-white hover:bg-orange-500"
              >
                View Schedule
              </Link>

              <Link
                href="/announcements"
                className="rounded-xl border border-white px-6 py-3 font-bold text-white hover:bg-orange-500 sm:hidden"
              >
                Announcements
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info */}
      <section className="px-6 pb-12">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm font-semibold text-orange-600">
              Event
            </p>

            <h2 className="mt-2 text-xl font-bold text-gray-900">
              Ganesh Utsav 2026
            </h2>

            <p className="mt-2 text-gray-600">
              Hostel celebration
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm font-semibold text-orange-600">
              Chanda
            </p>

            <h2 className="mt-2 text-xl font-bold text-gray-900">
              Support the Celebration
            </h2>

            <p className="mt-2 text-gray-600">
              Make a contribution using UPI.
            </p>

            <Link
              href="/chanda"
              className="mt-4 inline-block font-semibold text-orange-600 hover:underline"
            >
              Contribute →
            </Link>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow">
            <p className="text-sm font-semibold text-orange-600">
              Community
            </p>

            <h2 className="mt-2 text-xl font-bold text-gray-900">
              One Hostel, One Family
            </h2>

            <p className="mt-2 text-gray-600">
              Events, games and celebrations together.
            </p>
          </div>
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="px-6 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
                Updates
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Latest Announcements
              </h2>
            </div>

            <Link
              href="/announcements"
              className="text-sm font-semibold text-orange-600 hover:underline"
            >
              View all →
            </Link>
          </div>

          {latestAnnouncements.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-white p-8 text-center shadow">
              <p className="font-semibold text-gray-800">
                No announcements yet.
              </p>

              <p className="mt-1 text-sm text-gray-500">
                New event updates will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {latestAnnouncements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="rounded-2xl bg-white p-6 shadow"
                >
                  {announcement.priority > 0 && (
                    <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                      Important
                    </span>
                  )}

                  <h3 className="mt-3 text-xl font-bold text-gray-900">
                    {announcement.title}
                  </h3>

                  <p className="mt-3 line-clamp-4 whitespace-pre-line text-sm leading-6 text-gray-600">
                    {announcement.message}
                  </p>

                  <p className="mt-4 text-xs text-gray-400">
                    {new Date(
                      announcement.created_at
                    ).toLocaleString("en-IN")}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Schedule Preview */}
      <section id="schedule" className="px-6 pb-16">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Event Schedule
              </h2>

              <Link
                href="/schedule"
                className="text-sm font-semibold text-orange-600 hover:underline"
              >
                Full schedule →
              </Link>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-orange-50 p-4">
                <p className="font-bold text-orange-700">
                  Day 1 — Ganesh Sthapana
                </p>

                <p className="mt-1 text-gray-600">
                  Ganesh installation, opening ceremony and aarti.
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-4">
                <p className="font-bold text-orange-700">
                  Day 2 — Sports & Games
                </p>

                <p className="mt-1 text-gray-600">
                  Chess, cricket, carrom and fun activities.
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-4">
                <p className="font-bold text-orange-700">
                  Day 3 — Quiz & Cultural Events
                </p>

                <p className="mt-1 text-gray-600">
                  Quiz, creative events and cultural programs.
                </p>
              </div>

              <div className="rounded-xl bg-orange-50 p-4">
                <p className="font-bold text-orange-700">
                  Final Day — Celebration & Closing
                </p>

                <p className="mt-1 text-gray-600">
                  Finals, prizes, group photo and closing activities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-6 py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 text-sm text-gray-500 sm:flex-row">
          <p>Ganesh Utsav 2026</p>

          <div className="flex gap-5">
            <Link
              href="/schedule"
              className="hover:text-orange-600"
            >
              Schedule
            </Link>

            <Link
              href="/announcements"
              className="hover:text-orange-600"
            >
              Announcements
            </Link>

            <Link
              href="/chanda"
              className="font-semibold text-orange-600 hover:underline"
            >
              Chanda
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}