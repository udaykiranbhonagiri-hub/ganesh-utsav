"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Game = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  format: string;
};

const gameVisuals: Record<
  string,
  {
    eyebrow: string;
    icon: string;
    accent: string;
    light: string;
  }
> = {
  chess: {
    eyebrow: "Mind • Strategy",
    icon: "♟",
    accent: "bg-orange-600",
    light: "bg-orange-50",
  },
  cricket: {
    eyebrow: "Team Sport",
    icon: "🏏",
    accent: "bg-amber-500",
    light: "bg-amber-50",
  },
  carrom: {
    eyebrow: "Precision • Skill",
    icon: "◎",
    accent: "bg-orange-500",
    light: "bg-orange-50",
  },
  quiz: {
    eyebrow: "Knowledge • Team",
    icon: "?",
    accent: "bg-red-500",
    light: "bg-red-50",
  },
  fun: {
    eyebrow: "Everyone",
    icon: "✦",
    accent: "bg-yellow-500",
    light: "bg-yellow-50",
  },
};

export default function GameRegistrationClient({
  gameSlug,
}: {
  gameSlug: string;
}) {
  const supabase = createClient();

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadGame() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("games")
        .select("id, name, slug, description, format")
        .eq("slug", gameSlug)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        setError("This game could not be found.");
        setLoading(false);
        return;
      }

      setGame(data);
      setLoading(false);
    }

    loadGame();
  }, [gameSlug]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanRoom = roomNumber.trim();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (!cleanPhone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!cleanRoom) {
      setError("Please enter your room number.");
      return;
    }

    if (!game) {
      setError("Game information is unavailable.");
      return;
    }

    setSubmitting(true);

    const { data: participant, error: participantError } =
      await supabase
        .from("participants")
        .insert({
          full_name: cleanName,
          phone: cleanPhone,
          room_number: cleanRoom,
        })
        .select("id")
        .single();

    if (participantError || !participant) {
      setError(
        participantError?.message ||
          "Unable to create your participant record.",
      );
      setSubmitting(false);
      return;
    }

    const { error: registrationError } = await supabase
      .from("registrations")
      .insert({
        participant_id: participant.id,
        game_id: game.id,
      });

    if (registrationError) {
      setError(registrationError.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
  }

  const visual =
    gameVisuals[gameSlug] ?? {
      eyebrow: "Festival Game",
      icon: "✦",
      accent: "bg-orange-600",
      light: "bg-orange-50",
    };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf3]">
        <div className="mx-auto max-w-xl px-5 py-16 sm:px-8">
          <div className="animate-pulse rounded-[32px] border border-orange-100 bg-white p-8 shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-orange-100" />
            <div className="mt-7 h-4 w-32 rounded bg-gray-100" />
            <div className="mt-3 h-9 w-56 rounded bg-gray-100" />
            <div className="mt-3 h-5 w-full rounded bg-gray-100" />
            <div className="mt-10 space-y-4">
              <div className="h-14 rounded-2xl bg-gray-100" />
              <div className="h-14 rounded-2xl bg-gray-100" />
              <div className="h-14 rounded-2xl bg-gray-100" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="min-h-screen bg-[#fffaf3]">
        <div className="mx-auto max-w-xl px-5 py-20 text-center sm:px-8">
          <div className="rounded-[32px] border border-red-100 bg-white p-10 shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-xl">
              !
            </div>

            <h1 className="mt-5 text-2xl font-black text-gray-950">
              Game unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              {error || "We could not load this game."}
            </p>

            <Link
              href="/games"
              className="mt-7 inline-flex rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white"
            >
              Back to Games
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#fffaf3]">
        <div className="mx-auto max-w-xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="overflow-hidden rounded-[32px] border border-orange-100 bg-white shadow-sm">
            <div className={`${visual.accent} px-7 py-10 text-white`}>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl">
                ✓
              </div>

              <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-white/70">
                Registration complete
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-tight">
                You&apos;re in.
              </h1>

              <p className="mt-3 text-sm leading-6 text-white/80">
                Your registration for {game.name} has been submitted.
              </p>
            </div>

            <div className="p-7 sm:p-8">
              <div className="rounded-2xl bg-orange-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-orange-600">
                  Registered game
                </p>

                <p className="mt-2 text-xl font-black text-gray-950">
                  {game.name}
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  Your details have been recorded for the festival.
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/games"
                  className="flex-1 rounded-2xl bg-orange-600 px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-orange-700"
                >
                  Explore More Games
                </Link>

                <Link
                  href="/schedule"
                  className="flex-1 rounded-2xl border border-gray-200 px-5 py-3.5 text-center text-sm font-bold text-gray-800 transition hover:border-orange-200 hover:text-orange-700"
                >
                  View Schedule
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf3]">
      <section className="relative overflow-hidden border-b border-orange-100">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(234,88,12,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(234,88,12,0.045)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="relative mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
          <Link
            href="/games"
            className="text-sm font-bold text-gray-500 transition hover:text-orange-600"
          >
            ← Back to Games
          </Link>

          <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl text-2xl text-white shadow-lg ${visual.accent}`}
              >
                {visual.icon}
              </div>

              <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                {visual.eyebrow}
              </p>

              <h1 className="mt-2 text-5xl font-black tracking-[-0.04em] text-gray-950 sm:text-6xl">
                Register for
                <br />
                <span className="text-orange-600">{game.name}.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600">
                {game.description ||
                  "Register now and take part in the Ganesh Utsav competition."}
              </p>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Format
              </p>

              <p className="mt-1 font-black capitalize text-gray-900">
                {game.format}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[32px] border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                Your details
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-gray-950">
                Tell us who you are
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                No account is required. Enter your hostel details and submit
                your registration.
              </p>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your name"
                  autoComplete="name"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Enter your phone number"
                  autoComplete="tel"
                  inputMode="tel"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="room"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  Room Number
                </label>

                <input
                  id="room"
                  type="text"
                  value={roomNumber}
                  onChange={(event) =>
                    setRoomNumber(event.target.value)
                  }
                  placeholder="Example: A-204"
                  className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-orange-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-100 transition hover:-translate-y-0.5 hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting Registration..."
                  : `Register for ${game.name}`}
              </button>
            </form>
          </div>

          <aside className="h-fit rounded-[32px] border border-orange-100 bg-orange-50 p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
              Before you submit
            </p>

            <div className="mt-6 space-y-5">
              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-orange-600">
                  1
                </span>

                <div>
                  <p className="font-bold text-gray-900">
                    Use your real details
                  </p>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Your name, phone and room help the organisers identify
                    you.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-orange-600">
                  2
                </span>

                <div>
                  <p className="font-bold text-gray-900">
                    Check your game
                  </p>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Make sure you are registering for the correct event.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-orange-600">
                  3
                </span>

                <div>
                  <p className="font-bold text-gray-900">
                    Submit once
                  </p>

                  <p className="mt-1 text-sm leading-5 text-gray-500">
                    Avoid sending the form multiple times.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}