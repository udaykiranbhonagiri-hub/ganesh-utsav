"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Registration = {
  id: string;
  participant_id: string;
  status: string | null;
  created_at: string;
  participant: {
    name: string;
    phone: string;
    room: string;
  } | null;
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

type ParticipantGroup = {
  participantId: string;
  name: string;
  phone: string;
  room: string;
  games: string[];
  registrationIds: string[];
  statuses: string[];
  createdAt: string;
  payment?: Payment;
};

export default function RegistrationsClient() {
  const supabase = createClient();

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
      { data: registrationData, error: registrationError },
      { data: paymentData, error: paymentError },
    ] = await Promise.all([
      supabase
        .from("registrations")
        .select(`
          id,
          participant_id,
          status,
          created_at,
          participant:participants (
            name,
            phone,
            room
          ),
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

    setRegistrations(
      (registrationData || []) as unknown as Registration[]
    );

    setPayments((paymentData || []) as Payment[]);
    setLoading(false);
  }

  async function updateParticipantStatus(
    participant: ParticipantGroup,
    status: "pending" | "approved" | "rejected"
  ) {
    setError("");

    const { error: updateError } = await supabase
      .from("registrations")
      .update({ status })
      .in("id", participant.registrationIds);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setRegistrations((current) =>
      current.map((registration) =>
        participant.registrationIds.includes(registration.id)
          ? {
              ...registration,
              status,
            }
          : registration
      )
    );
  }

  const participants = useMemo<ParticipantGroup[]>(() => {
    const grouped = new Map<string, ParticipantGroup>();

    for (const registration of registrations) {
      const participant = registration.participant;

      if (!participant) {
        continue;
      }

      let group = grouped.get(registration.participant_id);

      if (!group) {
        group = {
          participantId: registration.participant_id,
          name: participant.name,
          phone: participant.phone,
          room: participant.room,
          games: [],
          registrationIds: [],
          statuses: [],
          createdAt: registration.created_at,
          payment: payments.find(
            (payment) =>
              payment.participant_id === registration.participant_id
          ),
        };

        grouped.set(registration.participant_id, group);
      }

      if (registration.game?.name) {
        if (!group.games.includes(registration.game.name)) {
          group.games.push(registration.game.name);
        }
      }

      group.registrationIds.push(registration.id);

      group.statuses.push(
        registration.status || "pending"
      );

      if (
        new Date(registration.created_at).getTime() <
        new Date(group.createdAt).getTime()
      ) {
        group.createdAt = registration.created_at;
      }
    }

    return Array.from(grouped.values());
  }, [registrations, payments]);

  const approvedCount = participants.filter((participant) =>
    participant.statuses.every(
      (status) => status === "approved"
    )
  ).length;

  const pendingCount = participants.filter((participant) =>
    participant.statuses.some(
      (status) => !status || status === "pending"
    )
  ).length;

  const paidParticipants = participants.filter(
    (participant) => participant.payment
  ).length;

  const totalCollected = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  function getParticipantStatus(participant: ParticipantGroup) {
    if (
      participant.statuses.every(
        (status) => status === "approved"
      )
    ) {
      return "approved";
    }

    if (
      participant.statuses.some(
        (status) => status === "rejected"
      )
    ) {
      return "rejected";
    }

    return "pending";
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fffaf3] px-4 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <p className="font-semibold text-neutral-600">
              Loading registrations...
            </p>
          </div>
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
              Game Registrations
            </h1>

            <p className="mt-2 text-neutral-600">
              One ₹20 Game Pass can cover multiple selected games.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-bold text-neutral-800 shadow-sm transition hover:bg-neutral-50"
          >
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-neutral-500">
              Participants
            </p>

            <p className="mt-2 text-3xl font-black text-neutral-900">
              {participants.length}
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
              Pending
            </p>

            <p className="mt-2 text-3xl font-black text-yellow-600">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-neutral-500">
              Approved
            </p>

            <p className="mt-2 text-3xl font-black text-green-600">
              {approvedCount}
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

        {/* Participant Cards */}
        <div className="space-y-5">
          {participants.length === 0 ? (
            <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
              <p className="font-bold text-neutral-800">
                No game registrations yet.
              </p>

              <p className="mt-2 text-sm text-neutral-500">
                Participants will appear here after submitting
                the registration form.
              </p>
            </div>
          ) : (
            participants.map((participant) => {
              const status = getParticipantStatus(participant);

              return (
                <div
                  key={participant.participantId}
                  className="rounded-3xl bg-white p-6 shadow-lg"
                >
                  {/* Top section */}
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-black text-neutral-900">
                          {participant.name}
                        </h2>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            status === "approved"
                              ? "bg-green-100 text-green-700"
                              : status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-neutral-500">
                        <span>
                          Room:{" "}
                          <strong className="text-neutral-800">
                            {participant.room}
                          </strong>
                        </span>

                        <span>
                          Phone:{" "}
                          <strong className="text-neutral-800">
                            {participant.phone}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-neutral-400">
                      Registered{" "}
                      {new Date(
                        participant.createdAt
                      ).toLocaleString()}
                    </div>
                  </div>

                  {/* Games */}
                  <div className="mt-6">
                    <p className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                      Selected Games
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {participant.games.map((game) => (
                        <span
                          key={game}
                          className="rounded-full bg-orange-100 px-4 py-2 text-sm font-bold text-orange-700"
                        >
                          {game}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="mt-6 grid gap-4 rounded-2xl bg-neutral-50 p-5 md:grid-cols-3">

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Game Pass
                      </p>

                      {participant.payment ? (
                        <p className="mt-1 text-xl font-black text-green-600">
                          ₹{participant.payment.amount}
                        </p>
                      ) : (
                        <p className="mt-1 font-bold text-red-600">
                          No Payment
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        UTR
                      </p>

                      <p className="mt-1 break-all font-semibold text-neutral-800">
                        {participant.payment?.utr_number || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        Payment Method
                      </p>

                      <p className="mt-1 font-semibold uppercase text-neutral-800">
                        {participant.payment?.payment_method || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={status === "approved"}
                      onClick={() =>
                        updateParticipantStatus(
                          participant,
                          "approved"
                        )
                      }
                      className="rounded-xl bg-green-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      disabled={status === "rejected"}
                      onClick={() =>
                        updateParticipantStatus(
                          participant,
                          "rejected"
                        )
                      }
                      className="rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Reject
                    </button>

                    {status === "rejected" && (
                      <button
                        type="button"
                        onClick={() =>
                          updateParticipantStatus(
                            participant,
                            "pending"
                          )
                        }
                        className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
                      >
                        Move to Pending
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer note */}
        <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800">
          <strong>Payment verification:</strong> Verify the ₹20 UPI
          transaction and UTR against the actual payment before
          approving the participant.
        </div>
      </div>
    </main>
  );
}