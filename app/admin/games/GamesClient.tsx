"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { isSupaAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";

type Game = {
  id: string;
  name: string;
  slug: string;
  game_type: string;
  description: string | null;
  icon: string | null;
  max_players: number | null;
  registration_open: boolean;
};

const gameTypes = [
  "Individual",
  "Team",
  "Individual / Team",
  "Team / Individual",
  "Fun",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function GamesClient() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [items, setItems] = useState<Game[]>([]);
  const [registrationCounts, setRegistrationCounts] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [gameType, setGameType] = useState("Individual");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [registrationOpen, setRegistrationOpen] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function verifyAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/auth/login?next=/admin/games");
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

  async function loadGames() {
    const { data, error: loadError } = await supabase
      .from("games")
      .select(
        "id, name, slug, game_type, description, icon, max_players, registration_open",
      )
      .order("name", { ascending: true });

    if (loadError) {
      setError(loadError.message);
      return;
    }

    const { data: registrations } = await supabase
      .from("registrations")
      .select("game_id");

    const counts: Record<string, number> = {};

    for (const registration of registrations ?? []) {
      counts[registration.game_id] =
        (counts[registration.game_id] ?? 0) + 1;
    }

    setItems(data ?? []);
    setRegistrationCounts(counts);
  }

  useEffect(() => {
    async function initialize() {
      const allowed = await verifyAdmin();

      if (allowed) {
        await loadGames();
      }

      setLoading(false);
    }

    initialize();
  }, [supabase]);

  function clearForm() {
    setEditingId(null);
    setName("");
    setSlug("");
    setSlugTouched(false);
    setGameType("Individual");
    setDescription("");
    setIcon("");
    setMaxPlayers("");
    setRegistrationOpen(true);
  }

  function startEdit(item: Game) {
    setEditingId(item.id);
    setName(item.name);
    setSlug(item.slug);
    setSlugTouched(true);
    setGameType(item.game_type);
    setDescription(item.description ?? "");
    setIcon(item.icon ?? "");
    setMaxPlayers(item.max_players ? String(item.max_players) : "");
    setRegistrationOpen(item.registration_open);

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
      if (!name.trim()) {
        throw new Error("Enter a game name.");
      }

      const resolvedSlug = slug.trim() || slugify(name);

      if (!resolvedSlug) {
        throw new Error("Enter a web address (slug) for the game.");
      }

      const payload = {
        name: name.trim(),
        slug: resolvedSlug,
        game_type: gameType,
        description: description.trim() || null,
        icon: icon.trim() || null,
        max_players:
          maxPlayers.trim() && Number(maxPlayers) > 0
            ? Number(maxPlayers)
            : null,
        registration_open: registrationOpen,
      };

      if (editingId) {
        const { error: updateError } = await supabase
          .from("games")
          .update(payload)
          .eq("id", editingId);

        if (updateError) {
          throw updateError;
        }

        setSuccess("Game updated.");
      } else {
        const { error: insertError } = await supabase
          .from("games")
          .insert(payload);

        if (insertError) {
          throw insertError;
        }

        setSuccess(
          "Game added. Everyone can now see it on the Games page.",
        );
      }

      clearForm();
      await loadGames();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save game.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleRegistration(item: Game) {
    setError("");
    setSuccess("");

    const { error: updateError } = await supabase
      .from("games")
      .update({
        registration_open: !item.registration_open,
      })
      .eq("id", item.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadGames();
  }

  async function deleteGame(item: Game) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"? Its registrations will also be removed.`,
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("games")
      .delete()
      .eq("id", item.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSuccess("Game deleted.");
    await loadGames();
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
              Games Management
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
                Games
              </h2>

              <p className="mt-2 text-gray-600">
                Add games and open or close participant registration.
              </p>
            </div>

            <div className="rounded-xl bg-white px-5 py-3 shadow">
              <p className="text-sm text-gray-500">Total Games</p>
              <p className="text-2xl font-bold text-orange-600">
                {items.length}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow">
            <div className="border-b px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Game" : "New Game"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Game Name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);

                      if (!slugTouched) {
                        setSlug(slugify(e.target.value));
                      }
                    }}
                    placeholder="Table Tennis"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Web Address (slug)
                  </label>

                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      setSlug(e.target.value);
                    }}
                    placeholder="table-tennis"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />

                  <p className="mt-1 text-xs text-gray-400">
                    Appears in the public link /games/&#123;slug&#125;
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Format
                  </label>

                  <select
                    value={gameType}
                    onChange={(e) => setGameType(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  >
                    {gameTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Icon (emoji)
                  </label>

                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🏓"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>

<div className="mt-5">
                <label className="mb-2 block text-sm font-semibold">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description shown on the public Games page."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Maximum Players (optional)
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(e.target.value)}
                    placeholder="e.g. 32"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={registrationOpen}
                    onChange={(e) =>
                      setRegistrationOpen(e.target.checked)
                    }
                    className="h-5 w-5 accent-orange-600"
                  />

                  <span className="text-sm font-medium">
                    Open for registration
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
                    ? "Update Game"
                    : "Add Game"}
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

{/* Existing games */}
          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow">
            <div className="border-b px-6 py-5">
              <h2 className="text-xl font-bold text-gray-900">
                Existing Games
              </h2>
            </div>

            {items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No games yet. Add a game above to show it on the public
                Games page.
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item) => {
                  const registered = registrationCounts[item.id] ?? 0;

                  return (
                    <div key={item.id} className="p-5 md:p-6">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                          {item.game_type}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            item.registration_open
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.registration_open
                            ? "Registration Open"
                            : "Registration Closed"}
                        </span>

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                          {registered} registered
                        </span>
                      </div>

                      <h3 className="mt-3 text-xl font-bold">
                        {item.icon ? `${item.icon}  ` : ""}
                        {item.name}
                      </h3>

                      {item.description && (
                        <p className="mt-1 text-gray-600">
                          {item.description}
                        </p>
                      )}

                      <p className="mt-2 text-xs text-gray-400">
                        /games/{item.slug}
                        {item.max_players
                          ? `  ·  max ${item.max_players} players`
                          : ""}
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
                          onClick={() => toggleRegistration(item)}
                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          {item.registration_open
                            ? "Close Registration"
                            : "Open Registration"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteGame(item)}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}