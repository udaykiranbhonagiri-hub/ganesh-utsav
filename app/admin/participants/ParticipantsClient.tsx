"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Participant = {
  id: string;
  name: string;
  phone: string;
  room: string;
  created_at: string;
};

type Registration = {
  id: string;
  participant_id: string;
  game_id: string;
  status: string | null;
  game: {
    name: string;
  } | null;
};

type Payment = {
  id: string;
  participant_id: string;
  amount: number;
  utr_number: string;
  payment_method: string | null;
  created_at: string;
};

type ParticipantView = Participant & {
  games: {
    id: string;
    name: string;
    status: string;
  }[];
  payment?: Payment;
};

export default function ParticipantsClient() {
  const supabase = createClient();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    const [
      { data: participantData, error: participantError },
      { data: registrationData, error: registrationError },
      { data: paymentData, error: paymentError },
    ] = await Promise.all([
      supabase
        .from("participants")
        .select("id,name,phone,room,created_at")
        .order("created_at", { ascending: false }),

      supabase
        .from("registrations")
        .select(`
          id,
          participant_id,
          game_id,
          status,
          game:games (
            name
          )
        `)
        .order("created_at", { ascending: false }),

      supabase
        .from("game_pass_payments")
        .select(`
          id,
          participant_id,
          amount,
          utr_number,
          payment_method,
          created_at
        `)
        .order("created_at", { ascending: false }),
    ]);

    if (participantError) {
      setError(participantError.message);
      setLoading(false);
      return;
    }

    if (registrationError) {
      setError(registrationError.message);
      setLoading(false);
      return;
    }

    if (paymentError) {
      setError(paymentError.message);
      setLoading(false);
      return;
    }

    setParticipants(participantData || []);
    setRegistrations(
      (registrationData || []) as unknown as Registration[]
    );
    setPayments(paymentData || []);
    setLoading(false);
  }

  const participantViews = useMemo<ParticipantView[]>(() => {
    return participants.map((participant) => {
      const participantRegistrations = registrations.filter(
        (registration) =>
          registration.participant_id === participant.id
      );

      const games = participantRegistrations
        .filter((registration) => registration.game)
        .map((registration) => ({
          id: registration.game_id,
          name: registration.game!.name,
          status: registration.status || "pending",
        }));

      const payment = payments.find(
        (item) => item.participant_id === participant.id
      );

      return {
        ...participant,
        games,
        payment,
      };
    });
  }, [participants, registrations, payments]);

  const totalParticipants = participantViews.length;

  const paidParticipants = participantViews.filter(
    (participant) => participant.payment
  ).length;

  const unpaidParticipants = participantViews.filter(
    (participant) => !participant.payment
  ).length;

  const totalCollected = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  const approvedGames = registrations.filter(
    (registration) => registration.status === "approved"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf3] px-4 py-10">
        <div className="mx-auto max-w-7xl rounded-3xl bg-white p-8 shadow-sm">
          <p className="font-semibold text-neutral-600">
            Loading participants...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] px-4 py-10">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
              Admin Panel
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-tight text-neutral-900">
              Participants
            </h1>

            <p className="mt-2 text-neutral-600">
              View participants, selected games and Game Pass payments.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-bold text-neutral-800 shadow-sm hover:bg-neutral-50"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-neutral-500">
              Participants
            </p>
            <p className="mt-2 text-3xl font-black text-neutral-900">
              {totalParticipants}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-neutral-500">
              Paid
            </p>
            <p className="mt-2 text-3xl font-black text-green-600">
              {paidParticipants}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-neutral-500">
              Unpaid
            </p>
            <p className="mt-2 text-3xl font-black text-red-600">
              {unpaidParticipants}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-neutral-500">
              Collection
            </p>
            <p className="mt-2 text-3xl font-black text-orange-600">
              ₹{totalCollected}
            </p>
          </div>
        </div>

        {/* Participants */}
        {participantViews.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <p className="font-bold text-neutral-800">
              No participants yet.
            </p>

            <p className="mt-2 text-sm text-neutral-500">
              Participants will appear after game registration.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {participantViews.map((participant) => (
              <div
                key={participant.id}
                className="rounded-3xl bg-white p-6 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-neutral-900">
                      {participant.name}
                    </h2>

                    <div className="mt-2 space-y-1 text-sm text-neutral-500">
                      <p>
                        Phone:{" "}
                        <strong className="text-neutral-800">
                          {participant.phone}
                        </strong>
                      </p>

                      <p>
                        Room:{" "}
                        <strong className="text-neutral-800">
                          {participant.room}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${
                      participant.payment
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {participant.payment ? "PAID" : "UNPAID"}
                  </span>
                </div>

                {/* Games */}
                <div className="mt-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Selected Games
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {participant.games.length > 0 ? (
                      participant.games.map((game) => (
                        <div
                          key={game.id}
                          className="rounded-full bg-orange-100 px-3 py-2 text-sm font-bold text-orange-700"
                        >
                          {game.name}

                          <span className="ml-2 text-xs opacity-70">
                            {game.status}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-neutral-400">
                        No games selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Payment */}
                <div className="mt-6 rounded-2xl bg-neutral-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Game Pass
                  </p>

                  {participant.payment ? (
                    <div className="mt-2">
                      <p className="text-2xl font-black text-green-600">
                        ₹{participant.payment.amount}
                      </p>

                      <p className="mt-2 break-all text-sm text-neutral-600">
                        UTR:{" "}
                        <strong className="text-neutral-900">
                          {participant.payment.utr_number}
                        </strong>
                      </p>

                      <p className="mt-1 text-xs uppercase text-neutral-400">
                        {participant.payment.payment_method || "upi"}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 font-bold text-red-600">
                      No Game Pass payment recorded
                    </p>
                  )}
                </div>

                {/* Registered */}
                <p className="mt-4 text-xs text-neutral-400">
                  Registered{" "}
                  {new Date(
                    participant.created_at
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          <strong>Approved game registrations:</strong> {approvedGames}
        </div>
      </div>
    </main>
  );
}