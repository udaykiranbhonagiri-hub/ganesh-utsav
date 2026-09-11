"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { isSupaAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";

type Announcement = {
  id: string;
  title: string;
  message: string;
  priority: number;
  published: boolean;
  created_at: string;
};

export default function AnnouncementsClient() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("0");
  const [published, setPublished] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function verifyAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth/login?next=/admin/announcements");
      return false;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!isSupaAdmin(profile?.role)) {
      router.replace("/");
      return false;
    }

    return true;
  }

  async function loadAnnouncements() {
    const { data, error: loadError } = await supabase
      .from("announcements")
      .select("id, title, message, priority, published, created_at")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

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
        await loadAnnouncements();
      }

      setLoading(false);
    }

    initialize();
  }, [supabase]);

  function clearForm() {
    setEditingId(null);
    setTitle("");
    setMessage("");
    setPriority("0");
    setPublished(true);
  }

  function startEdit(item: Announcement) {
    setEditingId(item.id);
    setTitle(item.title);
    setMessage(item.message);
    setPriority(String(item.priority));
    setPublished(item.published);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!title.trim()) {
        throw new Error("Enter an announcement title.");
      }

      if (!message.trim()) {
        throw new Error("Enter the announcement message.");
      }

      const payload = {
        title: title.trim(),
        message: message.trim(),
        priority: Number(priority),
        published,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("announcements")
          .update(payload)
          .eq("id", editingId);

        if (updateError) {
          throw updateError;
        }

        setSuccess("Announcement updated.");
      } else {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        const { error: insertError } = await supabase
          .from("announcements")
          .insert({
            ...payload,
            created_by: user?.id,
          });

        if (insertError) {
          throw insertError;
        }

        setSuccess("Announcement published.");
      }

      clearForm();
      await loadAnnouncements();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save announcement.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteAnnouncement(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement?",
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSuccess("Announcement deleted.");
    await loadAnnouncements();
  }

  async function togglePublished(item: Announcement) {
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("announcements")
      .update({
        published: !item.published,
      })
      .eq("id", item.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadAnnouncements();
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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Ganesh Utsav 2026
            </p>

            <h1 className="text-xl font-bold text-gray-900">
              Announcement Management
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
        <div className="mx-auto max-w-5xl">
          <Link
            href="/admin"
            className="text-sm font-medium text-orange-700 hover:underline"
          >
            ← Admin Dashboard
          </Link>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
                Event Management
              </p>

              <h2 className="mt-1 text-3xl font-bold text-gray-900">
                Announcements
              </h2>

              <p className="mt-2 text-gray-600">
                Publish important event updates for everyone to see.
              </p>
            </div>

            <div className="rounded-xl bg-white px-5 py-3 shadow">
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-2xl font-bold text-orange-600">
                {items.length}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow">
            <div className="border-b px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId
                  ? "Edit Announcement"
                  : "New Announcement"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Title
                </label>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Chanda Collection Open"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  Message
                </label>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Enter the announcement details..."
                  required
                  rows={5}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Priority
                  </label>

                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  >
                    <option value="0">Normal</option>
                    <option value="1">Important</option>
                    <option value="2">Urgent</option>
                  </select>
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="h-5 w-5 accent-orange-600"
                  />

                  <span className="text-sm font-medium">
                    Publish immediately
                  </span>
                </label>
              </div>

{error && (
                <div className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                  {success}
                </div>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-orange-600 px-6 py-3 font-bold text-white hover:bg-orange-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                    ? "Update Announcement"
                    : "Publish Announcement"}
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
                Existing Announcements
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No announcements yet.
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="p-5 md:p-6">
                    <div className="flex flex-wrap gap-2">
                      {item.priority > 0 && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                          {item.priority === 2
                            ? "Urgent"
                            : "Important"}
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          item.published
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.published ? "Published" : "Hidden"}
                      </span>
                    </div>

                    <h3 className="mt-3 text-xl font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-1 whitespace-pre-line text-gray-600">
                      {item.message}
                    </p>

                    <p className="mt-2 text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleString("en-IN")}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="rounded-lg border border-orange-300 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-50"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePublished(item)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        {item.published ? "Hide" : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteAnnouncement(item.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
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