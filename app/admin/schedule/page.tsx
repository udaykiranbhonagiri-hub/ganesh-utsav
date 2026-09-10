"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  is_published: boolean;
};

export default function AdminSchedulePage() {
  const router = useRouter();
  const supabase = createClient();

  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dayNumber, setDayNumber] = useState("1");
  const [eventDate, setEventDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [published, setPublished] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function verifyAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth/login?next=/admin/schedule");
      return false;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (
      profile?.role !== "super_admin" &&
      profile?.role !== "event_admin"
    ) {
      router.replace("/");
      return false;
    }

    return true;
  }

  async function loadSchedule() {
    const { data, error: loadError } = await supabase
      .from("event_schedule")
      .select(
        "id, title, description, day_number, event_date, start_time, end_time, location, is_published"
      )
      .order("day_number", { ascending: true })
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      return;
    }

    setItems(data ?? []);
  }

  useEffect(() => {
    async function initialize() {
      const allowed = await verifyAdmin();

      if (allowed) {
        await loadSchedule();
      }

      setLoading(false);
    }

    initialize();
  }, []);

  function clearForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setDayNumber("1");
    setEventDate("");
    setStartTime("");
    setEndTime("");
    setLocation("");
    setPublished(true);
  }

  function startEdit(item: ScheduleItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setDayNumber(String(item.day_number));
    setEventDate(item.event_date ?? "");
    setStartTime(item.start_time?.slice(0, 5) ?? "");
    setEndTime(item.end_time?.slice(0, 5) ?? "");
    setLocation(item.location ?? "");
    setPublished(item.is_published);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!title.trim()) {
        throw new Error("Enter an activity title.");
      }

      if (Number(dayNumber) < 1) {
        throw new Error("Day number must be at least 1.");
      }

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        day_number: Number(dayNumber),
        event_date: eventDate || null,
        start_time: startTime || null,
        end_time: endTime || null,
        location: location.trim() || null,
        is_published: published,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("event_schedule")
          .update(payload)
          .eq("id", editingId);

        if (updateError) {
          throw updateError;
        }

        setSuccess("Schedule item updated.");
      } else {
        const { error: insertError } = await supabase
          .from("event_schedule")
          .insert(payload);

        if (insertError) {
          throw insertError;
        }

        setSuccess("Schedule item added.");
      }

      clearForm();
      await loadSchedule();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save schedule."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this schedule item?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("event_schedule")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSuccess("Schedule item deleted.");
    await loadSchedule();
  }

  async function togglePublished(item: ScheduleItem) {
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("event_schedule")
      .update({
        is_published: !item.is_published,
      })
      .eq("id", item.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadSchedule();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-orange-50">
        <p className="text-gray-600">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Ganesh Utsav 2026
            </p>

            <h1 className="text-xl font-bold text-gray-900">
              Schedule Management
            </h1>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-orange-200 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-50"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <section className="px-4 py-8 md:px-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/admin"
            className="text-sm font-medium text-orange-700 hover:underline"
          >
            ← Admin Dashboard
          </Link>

          {/* Form */}
          <div className="mt-5 rounded-3xl bg-white p-6 shadow-lg md:p-8">
            <h2 className="text-2xl font-bold text-gray-900">
              {editingId ? "Edit Activity" : "Add Activity"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-5 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Activity Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ganesh Sthapana"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Activity details..."
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Day
                </label>

                <input
                  type="number"
                  min="1"
                  value={dayNumber}
                  onChange={(e) =>
                    setDayNumber(e.target.value)
                  }
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Date
                </label>

                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) =>
                    setEventDate(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Start Time
                </label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  End Time
                </label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Location
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(e) =>
                    setLocation(e.target.value)
                  }
                  placeholder="Hostel Common Area"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <label className="flex items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) =>
                    setPublished(e.target.checked)
                  }
                  className="h-5 w-5 accent-orange-600"
                />

                <span className="text-sm font-medium">
                  Published
                </span>
              </label>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 md:col-span-2">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700 md:col-span-2">
                  {success}
                </div>
              )}

              <div className="flex gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Activity"
                    : "Add Activity"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={clearForm}
                    className="rounded-xl border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Existing items */}
          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow">
            <div className="border-b px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">
                Existing Activities
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No schedule items yet.
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 md:p-6"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                            Day {item.day_number}
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              item.is_published
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {item.is_published
                              ? "Published"
                              : "Hidden"}
                          </span>
                        </div>

                        <h3 className="mt-3 text-xl font-bold">
                          {item.title}
                        </h3>

                        {item.description && (
                          <p className="mt-1 text-gray-600">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                          {item.event_date && (
                            <span>📅 {item.event_date}</span>
                          )}

                          {item.start_time && (
                            <span>
                              🕐 {item.start_time.slice(0, 5)}
                              {item.end_time
                                ? ` – ${item.end_time.slice(0, 5)}`
                                : ""}
                            </span>
                          )}

                          {item.location && (
                            <span>📍 {item.location}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          className="rounded-lg border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            togglePublished(item)
                          }
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          {item.is_published
                            ? "Hide"
                            : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteItem(item.id)
                          }
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
