"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";

type ScheduleItem = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
};

export default function SchedulePage() {
  const supabase = createClient();

  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSchedule() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("event_schedule")
        .select(
          "id, title, description, event_date, start_time, end_time, location"
        )
        .eq("is_published", true)
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSchedule(data ?? []);
      setLoading(false);
    }

    loadSchedule();
  }, []);

  const groupedSchedule = useMemo(() => {
    return schedule.reduce<Record<string, ScheduleItem[]>>((groups, item) => {
      if (!groups[item.event_date]) {
        groups[item.event_date] = [];
      }

      groups[item.event_date].push(item);
      return groups;
    }, {});
  }, [schedule]);

  function formatDay(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  function formatShortDay(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      weekday: "short",
    });
  }

  function formatDateNumber(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
    });
  }

  function formatMonth(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      month: "short",
    });
  }

  function formatTime(time: string | null) {
    if (!time) return "";

    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

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
                Ganesh Utsav 2026
              </div>

              <h1 className="mt-6 text-5xl font-black tracking-[-0.04em] text-gray-950 sm:text-6xl lg:text-7xl">
                The festival
                <br />
                <span className="text-orange-600">starts here.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                Keep track of aarti, games, competitions, celebrations and
                every important moment of the Utsav.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="/games"
                  className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-700"
                >
                  Explore Games
                </Link>

                <Link
                  href="/announcements"
                  className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-700"
                >
                  View Updates
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Schedule */}
        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
          <div className="mb-10">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
              Festival calendar
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              What&apos;s happening
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
              All published festival events appear here in chronological
              order.
            </p>
          </div>

          {loading ? (
            <div className="space-y-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex gap-5">
                    <div className="h-16 w-16 rounded-2xl bg-orange-100" />

                    <div className="flex-1">
                      <div className="h-4 w-32 rounded bg-gray-100" />
                      <div className="mt-3 h-6 w-64 rounded bg-gray-100" />
                      <div className="mt-3 h-4 w-48 rounded bg-gray-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-[28px] border border-red-100 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-bold text-red-600">
                Unable to load the schedule.
              </p>

              <p className="mt-2 text-sm text-gray-500">{error}</p>
            </div>
          ) : schedule.length === 0 ? (
            <div className="rounded-[28px] border border-orange-100 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                🗓
              </div>

              <h3 className="mt-5 text-xl font-black text-gray-950">
                Schedule coming soon
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Festival events will appear here once the admin publishes
                them.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(groupedSchedule).map(([date, events]) => (
                <section key={date}>
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {formatMonth(date)}
                      </span>

                      <span className="text-2xl font-black leading-none">
                        {formatDateNumber(date)}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                        {formatShortDay(date)}
                      </p>

                      <h3 className="mt-1 text-xl font-black text-gray-950 sm:text-2xl">
                        {formatDay(date)}
                      </h3>
                    </div>
                  </div>

                  <div className="relative ml-8 border-l-2 border-orange-100 pl-7 sm:ml-8 sm:pl-9">
                    <div className="space-y-4">
                      {events.map((event) => (
                        <article
                          key={event.id}
                          className="group relative rounded-[26px] border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg sm:p-6"
                        >
                          <span className="absolute -left-[39px] top-7 h-4 w-4 rounded-full border-4 border-[#fffaf3] bg-orange-500" />

                          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                {event.start_time && (
                                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                                    {formatTime(event.start_time)}
                                    {event.end_time
                                      ? ` – ${formatTime(event.end_time)}`
                                      : ""}
                                  </span>
                                )}

                                {event.location && (
                                  <span className="rounded-full bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
                                    {event.location}
                                  </span>
                                )}
                              </div>

                              <h4 className="mt-4 text-xl font-black tracking-tight text-gray-950 sm:text-2xl">
                                {event.title}
                              </h4>

                              {event.description && (
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                                  {event.description}
                                </p>
                              )}
                            </div>

                            <span className="shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-orange-500">
                              →
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
          <div className="overflow-hidden rounded-[32px] bg-gray-950 px-6 py-10 text-white sm:px-10 sm:py-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">
                  Stay connected
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Something changed?
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
                  Check the latest announcements for important festival
                  updates.
                </p>
              </div>

              <Link
                href="/announcements"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-orange-500"
              >
                View Announcements
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}