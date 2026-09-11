"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { isSupaAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/client";

type Participant = {
  id: string;
  full_name: string;
  phone: string;
  room_number: string | null;
  team_id: string | null;
  created_at: string;
};

type Team = {
  id: string;
  name: string;
};

export default function ParticipantsClient() {
  const router = useRouter();
  const supabase = createClient();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login?next=/admin/participants");
        return;
      }

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (profileError) {
        throw profileError;
      }

      if (!isSupaAdmin(profile?.role)) {
        router.replace("/");
        return;
      }

      const [
        { data: participantData, error: participantError },
        { data: teamData, error: teamError },
      ] = await Promise.all([
        supabase
          .from("participants")
          .select(
            "id, full_name, phone, room_number, team_id, created_at"
          )
          .order("created_at", { ascending: false }),

        supabase
          .from("teams")
          .select("id, name")
          .order("name", { ascending: true }),
      ]);

      if (participantError) {
        throw participantError;
      }

      if (teamError) {
        throw teamError;
      }

      setParticipants(participantData ?? []);
      setTeams(teamData ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load participants."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function assignTeam(
    participantId: string,
    teamId: string
  ) {
    setSaving(participantId);
    setError("");

    const { error: updateError } = await supabase
      .from("participants")
      .update({
        team_id: teamId === "none" ? null : teamId,
      })
      .eq("id", participantId);

    if (updateError) {
      setError(updateError.message);
      setSaving(null);
      return;
    }

    setParticipants((current) =>
      current.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              team_id:
                teamId === "none" ? null : teamId,
            }
          : participant
      )
    );

    setSaving(null);
  }

  return (
    <main className="min-h-screen bg-orange-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Ganesh Utsav 2026
            </p>

            <h1 className="text-xl font-bold text-gray-900">
              Admin — Participants
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
        <div className="mx-auto max-w-6xl">
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
                Participants
              </h2>

              <p className="mt-2 text-gray-600">
                Manage people registered for games.
              </p>
            </div>

            <div className="rounded-xl bg-white px-5 py-3 shadow">
              <p className="text-sm text-gray-500">
                Total Participants
              </p>

              <p className="text-2xl font-bold text-orange-600">
                {participants.length}
              </p>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow">
            {loading ? (
              <div className="p-10 text-center text-gray-500">
                Loading participants...
              </div>
            ) : participants.length === 0 ? (
              <div className="p-10 text-center">
                <p className="font-semibold text-gray-800">
                  No participants registered yet.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  People who register for games will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Name
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Phone
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Room
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Team
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold">
                        Registered
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {participants.map((participant) => {
                      return (
                        <tr
                          key={participant.id}
                          className="border-t"
                        >
                          <td className="px-6 py-4 font-medium">
                            {participant.full_name}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {participant.phone}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {participant.room_number || "-"}
                          </td>

                          <td className="px-6 py-4">
                            <select
                              value={
                                participant.team_id ?? "none"
                              }
                              disabled={
                                saving === participant.id
                              }
                              onChange={(e) =>
                                assignTeam(
                                  participant.id,
                                  e.target.value
                                )
                              }
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                            >
                              <option value="none">
                                No Team
                              </option>

                              {teams.map((team) => (
                                <option
                                  key={team.id}
                                  value={team.id}
                                >
                                  {team.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(
                              participant.created_at
                            ).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
