"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { saveParticipantId } from "@/lib/participant-session";

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegistrationLoading />}>
      <RegisterPageContent />
    </Suspense>
  );
}

function RegisterPageContent() {
  const supabase = useMemo(() => createClient(), []);
  const searchParams = useSearchParams();
  const requestedPath = searchParams.get("next");
  const nextPath =
    requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
      ? requestedPath
      : "/games";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (!fullName.trim()) {
        throw new Error("Please enter your name.");
      }

      if (!phone.trim()) {
        throw new Error("Please enter your phone number.");
      }

      const { data: participant, error: participantError } = await supabase
        .from("participants")
        .insert({
          full_name: fullName.trim(),
          phone: phone.trim(),
          room_number: roomNumber.trim() || null,
        })
        .select("id")
        .single();

      if (participantError) {
        throw participantError;
      }

      saveParticipantId(participant.id);
      setSuccess("Your participant registration is saved.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to complete registration.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Link
          href="/"
          className="text-sm font-medium text-orange-700 hover:underline"
        >
          &larr; Back to Home
        </Link>

        <section className="mt-5 rounded-3xl bg-white p-6 shadow-lg md:p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Ganesh Utsav 2026
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Participant Registration
            </h1>

            <p className="mt-2 text-gray-600">
              Register once, then choose the games you want to play. No login
              is needed.
            </p>
          </div>

          {success ? (
            <div className="rounded-xl bg-green-50 p-5 text-green-700">
              <p className="font-bold">Registration successful</p>
              <p className="mt-1 text-sm">{success}</p>
              <Link
                href={nextPath}
                className="mt-5 inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
              >
                Choose a game
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div>
                <label
                  htmlFor="roomNumber"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Room Number
                </label>

                <input
                  id="roomNumber"
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-600 px-5 py-4 font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Registering..." : "Save Registration"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

function RegistrationLoading() {
  return (
    <main className="min-h-screen bg-orange-50 px-4 py-10">
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-lg">
        Loading registration...
      </div>
    </main>
  );
}
