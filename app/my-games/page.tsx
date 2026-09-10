"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getSavedParticipantId } from "@/lib/participant-session";
import { createClient } from "@/lib/supabase/client";

type Registration = {
  id: string;
  status: string;
  registered_at: string;
  games: {
    id: string;
    name: string;
    game_type: string;
    description: string | null;
  } | null;
};

export default function MyGamesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registrationRequired, setRegistrationRequired] = useState(false);

  useEffect(() => {
    async function loadRegistrations() {
      setLoading(true);
      setError("");
      setRegistrationRequired(false);

      try {
        const participantId = getSavedParticipantId();
        if (!participantId) {
          setRegistrationRequired(true);
          return;
        }

        const { data, error: registrationsError } =
          await supabase
            .from("registrations")
            .select(
              `
              id,
              status,
              registered_at,
              games (
                id,
                name,
                game_type,
                description
              )
            `
            )
            .eq("participant_id", participantId)
            .order("registered_at", {
              ascending: false,
            });

        if (registrationsError) {
          throw registrationsError;
        }

        setRegistrations(
          (data as unknown as Registration[]) ?? []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your games."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRegistrations();
  }, [supabase]);

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

          <div className="flex items-center gap-3">
            <Link
              href="/games"
              className="rounded-xl border border-orange-200 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-50"
            >
              Games
            </Link>

            <Link
            href="/register?next=/my-games"
            className="hidden rounded-xl border border-orange-200 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-50 sm:block"
          >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="px-4 py-10 md:px-6">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/games"
            className="text-sm font-medium text-orange-700 hover:underline"
          >
            ← Back to Games
          </Link>

          <div className="mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Participant
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              My Games
            </h1>

            <p className="mt-2 text-gray-600">
              Games and activities you have registered for.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-8 rounded-2xl bg-white p-8 text-center shadow">
              <p className="text-gray-600">
                Loading your registrations...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="mt-8 rounded-2xl bg-red-50 p-5 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && registrationRequired && (
            <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow">
              <div className="text-4xl">Games</div>

              <h2 className="mt-4 text-xl font-bold text-gray-900">
                Participant registration required
              </h2>

              <p className="mt-2 text-gray-500">
                Register and choose your team before viewing or joining games.
              </p>

              <Link
                href="/register?next=/my-games"
                className="mt-6 inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
              >
                Register and choose a team
              </Link>
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            !registrationRequired &&
            registrations.length === 0 && (
              <div className="mt-8 rounded-2xl bg-white p-10 text-center shadow">
                <div className="text-4xl">🎮</div>

                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  No game registrations yet
                </h2>

                <p className="mt-2 text-gray-500">
                  Register for a game to see it here.
                </p>

                <Link
                  href="/games"
                  className="mt-6 inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
                >
                  Browse Games
                </Link>
              </div>
            )}

          {/* Registrations */}
          {!loading &&
            !error &&
            !registrationRequired &&
            registrations.length > 0 && (
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {registrations.map((registration) => (
                  <article
                    key={registration.id}
                    className="rounded-2xl bg-white p-6 shadow"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
                          {registration.games?.game_type ??
                            "game"}
                        </p>

                        <h2 className="mt-1 text-2xl font-bold text-gray-900">
                          {registration.games?.name ??
                            "Unknown Game"}
                        </h2>
                      </div>

                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                        {registration.status}
                      </span>
                    </div>

                    <p className="mt-4 leading-6 text-gray-600">
                      {registration.games?.description ??
                        "Ganesh Utsav game registration."}
                    </p>

                    <div className="mt-5 border-t pt-4">
                      <p className="text-xs text-gray-500">
                        Registered on
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {new Date(
                          registration.registered_at
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}

          {/* Browse Games */}
          {!loading &&
            !error &&
            !registrationRequired &&
            registrations.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  href="/games"
                  className="inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
                >
                  Register for More Games
                </Link>
              </div>
            )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-6 py-6">
        <div className="mx-auto text-center text-sm text-gray-500">
          Ganesh Utsav 2026
        </div>
      </footer>
    </main>
  );
}
