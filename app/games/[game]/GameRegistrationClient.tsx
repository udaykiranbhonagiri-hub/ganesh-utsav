"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Game = {
  id: string;
  name: string;
  game_type: string;
  description: string | null;
  max_players: number | null;
  registration_open: boolean;
};

type Props = {
  gameSlug: string;
};

const gameNames: Record<string, string> = {
  chess: "Chess",
  cricket: "Cricket",
  carrom: "Carrom",
  quiz: "Quiz",
  fun: "Fun Games",
};

export default function GameRegistrationClient({
  gameSlug,
}: Props) {
  const router = useRouter();
  const supabase = createClient();

  const displayName = gameNames[gameSlug];

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!displayName) {
      router.replace("/games");
      return;
    }

    async function loadGame() {
      setLoading(true);
      setError("");

      const { data, error: gameError } = await supabase
        .from("games")
        .select(
          "id, name, game_type, description, max_players, registration_open"
        )
        .eq("name", displayName)
        .maybeSingle();

      if (gameError) {
        setError(gameError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError(
          "This game has not been configured by the administrator yet."
        );
        setLoading(false);
        return;
      }

      setGame(data);
      setLoading(false);
    }

    loadGame();
  }, [displayName, router, supabase]);

  async function handleRegister() {
    setRegistering(true);
    setError("");
    setMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        router.push(
          `/login?next=/games/${encodeURIComponent(gameSlug)}`
        );
        return;
      }

      if (!game) {
        throw new Error("Game information is unavailable.");
      }

      if (!game.registration_open) {
        throw new Error(
          "Registration for this game is currently closed."
        );
      }

      const { data: existingRegistration, error: existingError } =
        await supabase
          .from("registrations")
          .select("id")
          .eq("game_id", game.id)
          .eq("user_id", user.id)
          .maybeSingle();

      if (existingError) {
        throw existingError;
      }

      if (existingRegistration) {
        setMessage(
          `You are already registered for ${game.name}.`
        );
        return;
      }

      const { error: insertError } = await supabase
        .from("registrations")
        .insert({
          game_id: game.id,
          user_id: user.id,
          status: "confirmed",
        });

      if (insertError) {
        throw insertError;
      }

      setMessage(
        `Successfully registered for ${game.name}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to register for this game."
      );
    } finally {
      setRegistering(false);
    }
  }

  return (
    <main className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-orange-600"
          >
            Ganesh Utsav 2026
          </Link>

          <Link
            href="/games"
            className="rounded-xl border border-orange-200 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-50"
          >
            Games
          </Link>
        </div>
      </header>

      {/* Content */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/games"
            className="text-sm font-medium text-orange-700 hover:underline"
          >
            ← Back to Games
          </Link>

          <div className="mt-5 rounded-3xl bg-white p-6 shadow-lg md:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Game Registration
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {displayName || "Game"}
            </h1>

            {loading ? (
              <div className="mt-8 rounded-xl bg-orange-50 p-5 text-center text-gray-600">
                Loading game...
              </div>
            ) : error && !game ? (
              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : game ? (
              <>
                <p className="mt-3 leading-7 text-gray-600">
                  {game.description ||
                    "Register for this Ganesh Utsav activity."}
                </p>

                {game.max_players !== null && (
                  <div className="mt-5 rounded-xl bg-orange-50 p-4">
                    <p className="text-sm text-gray-500">
                      Maximum participants
                    </p>

                    <p className="mt-1 text-xl font-bold text-orange-700">
                      {game.max_players}
                    </p>
                  </div>
                )}

                {!game.registration_open ? (
                  <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    Registration for this game is currently closed.
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleRegister}
                    disabled={registering}
                    className="mt-8 w-full rounded-xl bg-orange-600 px-5 py-4 font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {registering
                      ? "Registering..."
                      : `Register for ${game.name}`}
                  </button>
                )}

                {error && (
                  <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                    {message}
                  </div>
                )}
              </>
            ) : (
              <div className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-800">
                This game has not been configured yet.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}