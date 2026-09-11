"use client";

import { useEffect, useState } from "react";
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
  is_published: boolean;
};

const emptyForm = {
  title: "",
  description: "",
  event_date: "",
  start_time: "",
  end_time: "",
  location: "",
  is_published: true,
};

export default function ScheduleClient() {
  const supabase = createClient();

  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadSchedule() {
    setLoading(true);

    const { data, error } = await supabase
      .from("event_schedule")
      .select(
        "id, title, description, event_date, start_time, end_time, location, is_published",
      )
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadSchedule();
  }, []);

  function updateField(
    field: keyof typeof emptyForm,
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function addSchedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim() || !form.event_date) {
      setMessage("Title and event date are required.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase.from("event_schedule").insert({
      title: form.title.trim(),
      description: form.description.trim() || null,
      event_date: form.event_date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      location: form.location.trim() || null,
      is_published: form.is_published,
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setForm(emptyForm);
    setMessage("Schedule item added successfully.");
    setSaving(false);

    await loadSchedule();
  }

  async function togglePublished(item: ScheduleItem) {
    const { error } = await supabase
      .from("event_schedule")
      .update({
        is_published: !item.is_published,
      })
      .eq("id", item.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              is_published: !entry.is_published,
            }
          : entry,
      ),
    );
  }

  async function deleteItem(id: string) {
    const confirmed = window.confirm(
      "Delete this schedule item permanently?",
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("event_schedule")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    setMessage("Schedule item deleted.");
  }

  function formatDate(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
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

      <main className="min-h-screen bg-orange-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Admin Panel
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              Festival Schedule
            </h1>

            <p className="mt-2 text-gray-600">
              Create, publish, and manage festival events.
            </p>
          </div>

          {message && (
            <div className="mb-6 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-700">
              {message}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-orange-100">
              <h2 className="text-xl font-black text-gray-900">
                Add Event
              </h2>

              <form onSubmit={addSchedule} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Title
                  </label>

                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      updateField("title", event.target.value)
                    }
                    placeholder="Ganesh Aarti"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Event details"
                    rows={3}
                    className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Date
                  </label>

                  <input
                    type="date"
                    value={form.event_date}
                    onChange={(event) =>
                      updateField("event_date", event.target.value)
                    }
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Start
                    </label>

                    <input
                      type="time"
                      value={form.start_time}
                      onChange={(event) =>
                        updateField("start_time", event.target.value)
                      }
                      className="w-full rounded-2xl border border-gray-200 px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      End
                    </label>

                    <input
                      type="time"
                      value={form.end_time}
                      onChange={(event) =>
                        updateField("end_time", event.target.value)
                      }
                      className="w-full rounded-2xl border border-gray-200 px-3 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Location
                  </label>

                  <input
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      updateField("location", event.target.value)
                    }
                    placeholder="Hostel Ground"
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-2xl bg-orange-50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(event) =>
                      updateField("is_published", event.target.checked)
                    }
                    className="h-4 w-4"
                  />

                  <span className="text-sm font-semibold text-gray-700">
                    Publish immediately
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-2xl bg-orange-600 px-5 py-3.5 font-bold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Adding..." : "Add Schedule Item"}
                </button>
              </form>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900">
                  Existing Events
                </h2>

                <span className="rounded-full bg-white px-3 py-1.5 text-sm font-bold text-gray-600 ring-1 ring-orange-100">
                  {items.length} events
                </span>
              </div>

              {loading ? (
                <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-orange-100">
                  <p className="text-gray-600">Loading schedule...</p>
                </div>
              ) : items.length === 0 ? (
                <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-orange-100">
                  <h3 className="text-lg font-bold text-gray-900">
                    No schedule items
                  </h3>

                  <p className="mt-2 text-gray-600">
                    Add your first festival event using the form.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-orange-100"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black text-gray-900">
                              {item.title}
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                item.is_published
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {item.is_published
                                ? "Published"
                                : "Draft"}
                            </span>
                          </div>

                          <p className="mt-2 text-sm font-semibold text-orange-600">
                            {formatDate(item.event_date)}
                            {item.start_time
                              ? ` • ${formatTime(item.start_time)}`
                              : ""}
                            {item.end_time
                              ? ` - ${formatTime(item.end_time)}`
                              : ""}
                          </p>

                          {item.location && (
                            <p className="mt-1 text-sm text-gray-500">
                              {item.location}
                            </p>
                          )}

                          {item.description && (
                            <p className="mt-3 text-sm leading-6 text-gray-600">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 gap-2">
                          <button
                            type="button"
                            onClick={() => togglePublished(item)}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                          >
                            {item.is_published ? "Unpublish" : "Publish"}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteItem(item.id)}
                            className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </>
  );
}