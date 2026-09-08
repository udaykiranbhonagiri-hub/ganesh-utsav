"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type ScheduleItem = {
  id: string;
  title: string;
  description: string | null;
  day_number: number;
  event_date: string | null;
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

      const { data, error: scheduleError } = await supabase
        .from("event_schedule")
        .select(
          "id, title, description, day_number, event_date, start_time, end_time, location"
        )
        .eq("is_published", true)
        .order("day_number", { ascending: true })
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true });

      if (scheduleError) {
        setError(scheduleError.message);
        setLoading(false);
        return;
      }

      setSchedule(data ?? []);
      setLoading(false);
    }

    loadSchedule();
  }, [supabase]);

  const groupedSchedule = schedule.reduce<
    Record<number, ScheduleItem[]>
  >((groups, item) => {
    if (!groups[item.day_number]) {
      groups[item.day_number] = [];
    }

    groups[item.day_number].push(item);

    return groups;
  }, {});

  function formatDate(date: string | null) {
    if (!date) return "";

    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }

  function formatTime(time: string | null) {
    if (!time) return "";

    const [hour, minute] = time.split(":").map(Number);

    const date = new Date();
    date.setHours(hour, minute, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <main className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link
            href="/"
            className="text-xl font-bold text-orange-600"
          >
            Ganesh Utsav 2026
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/games"
              className="hidden rounded-xl border border-orange-200 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-50 sm:block"
            >
              Games
            </Link>

            <Link
              href="/chanda"
              className="rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white hover:bg-orange-700"
            >
              Chanda
            </Link>
          </div>
        </div>
      </header>

      {/* Heading */}
      <section className="px-4 py-10 md:px-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Ganesh Utsav 2026
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Event Schedule
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            See the latest activities and timings planned for the
            celebration.
          </p>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <section className="px-4 pb-16 md:px-6">
          <div className="mx-auto max-w-5xl rounded-2xl bg-white p-10 text-center shadow">
            <p className="text-gray-600">
              Loading schedule...
            </p>
          </div>
        </section>
      )}

      {/* Error */}
      {!loading && error && (
        <section className="px-4 pb-16 md:px-6">
          <div className="mx-auto max-w-5xl rounded-2xl bg-red-50 p-5 text-red-700">
            Unable to load the schedule.
          </div>
        </section>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        schedule.length === 0 && (
          <section className="px-4 pb-16 md:px-6">
            <div className="mx-auto max-w-5xl rounded-2xl bg-white p-10 text-center shadow">
              <h2 className="text-xl font-bold text-gray-900">
                Schedule coming soon
              </h2>

              <p className="mt-2 text-gray-500">
                Event activities will appear here.
              </p>
            </div>
          </section>
        )}

      {/* Schedule */}
      {!loading &&
        !error &&
        schedule.length > 0 && (
          <section className="px-4 pb-16 md:px-6">
            <div className="mx-auto max-w-5xl space-y-6">
              {Object.entries(groupedSchedule).map(
                ([day, items]) => (
                  <article
                    key={day}
                    className="overflow-hidden rounded-2xl bg-white shadow"
                  >
                    <div className="bg-orange-600 px-6 py-5 text-white">
                      <p className="text-sm font-semibold uppercase tracking-wider text-orange-100">
                        Day {day}
                      </p>

                      <h2 className="mt-1 text-2xl font-bold">
                        Ganesh Utsav Activities
                      </h2>

                      {items[0]?.event_date && (
                        <p className="mt-1 text-sm text-orange-100">
                          {formatDate(items[0].event_date)}
                        </p>
                      )}
                    </div>

                    <div className="divide-y">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-5 md:p-6"
                        >
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900">
                                {item.title}
                              </h3>

                              {item.description && (
                                <p className="mt-2 leading-6 text-gray-600">
                                  {item.description}
                                </p>
                              )}

                              {item.location && (
                                <p className="mt-3 text-sm font-medium text-orange-700">
                                  📍 {item.location}
                                </p>
                              )}
                            </div>

                            {(item.start_time ||
                              item.end_time) && (
                              <div className="shrink-0 rounded-xl bg-orange-50 px-4 py-3 text-left md:text-right">
                                <p className="text-sm font-bold text-orange-700">
                                  {formatTime(item.start_time)}
                                  {item.end_time
                                    ? ` – ${formatTime(
                                        item.end_time
                                      )}`
                                    : ""}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                )
              )}
            </div>
          </section>
        )}

      {/* Footer */}
      <footer className="border-t bg-white px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-gray-500">
          <p>Ganesh Utsav 2026</p>

          <Link
            href="/chanda"
            className="font-semibold text-orange-600 hover:underline"
          >
            Contribute Chanda
          </Link>
        </div>
      </footer>
    </main>
  );
}