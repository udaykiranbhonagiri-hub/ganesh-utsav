"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getSavedParticipantId } from "@/lib/participant-session";
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

export default function GameRegistrationClient({ gameSlug }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const displayName = gameNames[gameSlug];
  const registrationPath = `/register?next=${encodeURIComponent(
    `/games/${gameSlug}`,
  )}`;

  const [game, setGame] = useState<Game | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [participantChecked, setParticipantChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setParticipantId(getSavedParticipantId());
    setParticipantChecked(true);
  }, []);

  useEffect(() => {
    if (!displayName) {
      router.replace("/games");
      return;
    }

    async function loadGame() {
      const { data, error: gameError } = await supabase
        .from("games")
        .select(
          "id, name, game_type, description, max_players, registration_open",
        )
        .eq("name", displayName)
        .maybeSingle();

      if (gameError) {
        setError(gameError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("This game has not been configured yet.");
        setLoading(false);
        return;
      }

      setGame(data);
      setLoading(false);
    }

    loadGame();
  }, [displayName, router, supabase]);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setRegistering(true);
    setError("");
    setSuccess("");

    try {
      if (!game) {
        throw new Error("Game information is unavailable.");
      }

      if (!participantId) {
        throw new Error("Please register as a participant and choose your team first.");
      }

      if (!game.registration_open) {
        throw new Error("Registration for this game is closed.");
      }

      const { error: registrationError } = await supabase
        .from("registrations")
        .insert({
          participant_id: participantId,
          game_id: game.id,
          status: "confirmed",
        });

      if (registrationError) {
        throw registrationError;
      }

      setSuccess(`You have successfully registered for ${game.name}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete registration.",
      );
    } finally {
      setRegistering(false);
    }
  }

  return (
    <main className="min-h-screen bg-orange-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold text-orange-600">
            Ganesh Utsav 2026
          </Link>

          <div className="flex gap-3">
            <Link
              href="/my-games"
              className="hidden rounded-xl border border-orange-200 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-50 sm:block"
            >
              My Games
            </Link>
            <Link
              href="/games"
              className="rounded-xl border border-orange-200 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-50"
            >
              Games
            </Link>
          </div>
        </div>
      </header>

      <section className="px-4 py-10 md:px-6">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/games"
            className="text-sm font-medium text-orange-700 hover:underline"
          >
            &larr; Back to Games
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

                {!game.registration_open ? (
                  <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                    Registration is currently closed.
                  </div>
                ) : !participantChecked ? (
                  <div className="mt-6 rounded-xl bg-orange-50 p-4 text-sm text-gray-600">
                    Checking your participant registration...
                  </div>
                ) : !participantId ? (
                  <div className="mt-6 rounded-xl bg-orange-50 p-5 text-gray-700">
                    <p className="font-bold">Register before choosing a game</p>
                    <p className="mt-1 text-sm">
                      First register as a participant and choose your team. You
                      do not need to create an account or log in.
                    </p>
                    <Link
                      href={registrationPath}
                      className="mt-4 inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
                    >
                      Register and choose a team
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="mt-8 space-y-5">
                    <div className="rounded-xl bg-orange-50 p-4 text-sm text-gray-700">
                      Your participant registration and team selection will be
                      used for this game.
                    </div>

                    {error && (
                      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                        <p className="font-bold">Registration successful</p>
                        <p className="mt-1">{success}</p>
                        <Link
                          href="/my-games"
                          className="mt-3 inline-block font-semibold text-green-800 underline"
                        >
                          View my games
                        </Link>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={registering || Boolean(success)}
                      className="w-full rounded-xl bg-orange-600 px-5 py-4 font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {registering
                        ? "Registering..."
                        : `Register for ${game.name}`}
                    </button>
                  </form>
                )}
              </>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
