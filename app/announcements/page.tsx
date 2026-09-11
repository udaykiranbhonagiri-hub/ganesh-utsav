import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";

type Announcement = {
  id: string;
  title: string;
  body: string;
  priority: "info" | "important" | "urgent" | string;
  published_at: string | null;
  created_at: string;
};

function priorityStyles(priority: string) {
  switch (priority) {
    case "urgent":
      return {
        label: "Urgent",
        badge: "bg-red-50 text-red-700 border-red-100",
        dot: "bg-red-500",
      };

    case "important":
      return {
        label: "Important",
        badge: "bg-amber-50 text-amber-700 border-amber-100",
        dot: "bg-amber-500",
      };

    default:
      return {
        label: "Update",
        badge: "bg-orange-50 text-orange-700 border-orange-100",
        dot: "bg-orange-500",
      };
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const instant = false;

export default async function AnnouncementsPage() {
  const supabase = await createClient();

  const { data: announcements, error } = await supabase
    .from("announcements")
    .select("id, title, body, priority, published_at, created_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  const items = (announcements ?? []) as Announcement[];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fffaf3]">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-orange-100">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(234,88,12,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(234,88,12,0.045)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Festival Updates
              </div>

              <h1 className="mt-6 text-5xl font-black tracking-[-0.04em] text-gray-950 sm:text-6xl lg:text-7xl">
                Stay in the
                <br />
                <span className="text-orange-600">loop.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                Important announcements, schedule changes and festival
                updates, all in one place.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/schedule"
                  className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-700"
                >
                  View Schedule
                </Link>

                <Link
                  href="/games"
                  className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-700"
                >
                  Explore Games
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Announcements */}
        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="mb-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
              Latest updates
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              What&apos;s new
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              Official updates published by the festival admin team.
            </p>
          </div>

          {error ? (
            <div className="rounded-[28px] border border-red-100 bg-white p-8 text-center shadow-sm">
              <p className="font-bold text-red-600">
                Unable to load announcements.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Please try again later.
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[28px] border border-orange-100 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                ✦
              </div>

              <h3 className="mt-5 text-xl font-black text-gray-950">
                No announcements yet
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                New festival updates will appear here when they are
                published.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {items.map((announcement) => {
                const priority = priorityStyles(announcement.priority);

                return (
                  <article
                    key={announcement.id}
                    className="group relative overflow-hidden rounded-[28px] border border-gray-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:p-7"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
                        <span
                          className={`h-3 w-3 rounded-full ${priority.dot}`}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-bold ${priority.badge}`}
                          >
                            {priority.label}
                          </span>

                          <span className="text-xs font-semibold text-gray-400">
                            {formatDate(
                              announcement.published_at ??
                                announcement.created_at,
                            )}
                          </span>
                        </div>

                        <h3 className="mt-4 text-xl font-black tracking-tight text-gray-950 sm:text-2xl">
                          {announcement.title}
                        </h3>

                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-600 sm:text-base">
                          {announcement.body}
                        </p>
                      </div>

                      <span className="hidden shrink-0 self-center text-2xl text-gray-200 transition group-hover:translate-x-1 group-hover:text-orange-500 sm:block">
                        →
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom CTA */}
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
          <div className="overflow-hidden rounded-[32px] bg-gray-950 px-6 py-10 text-white sm:px-10 sm:py-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">
                  Keep connected
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Don&apos;t miss the next update.
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
                  Check the schedule regularly for changes to timings and
                  festival events.
                </p>
              </div>

              <Link
                href="/schedule"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-orange-500"
              >
                Open Schedule
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}