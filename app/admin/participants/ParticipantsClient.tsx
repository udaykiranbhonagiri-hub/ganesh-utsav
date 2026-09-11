"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";

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
  const supabase = createClient();

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setMessage("");

    const [
      { data: participantData, error: participantError },
      { data: teamData, error: teamError },
    ] = await Promise.all([
      supabase
        .from("participants")
        .select("id, full_name, phone, room_number, team_id, created_at")
        .order("created_at", { ascending: false }),

      supabase
        .from("teams")
        .select("id, name")
        .order("name", { ascending: true }),
    ]);

    if (participantError) {
      setMessage(participantError.message);
      setLoading(false);
      return;
    }

    if (teamError) {
      setMessage(teamError.message);
      setLoading(false);
      return;
    }

    setParticipants(participantData ?? []);
    setTeams(teamData ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function updateTeam(participantId: string, teamId: string) {
    const { error } = await supabase
      .from("participants")
      .update({
        team_id: teamId || null,
      })
      .eq("id", participantId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setParticipants((current) =>
      current.map((participant) =>
        participant.id === participantId
          ? {
              ...participant,
              team_id: teamId || null,
            }
          : participant,
      ),
    );

    setMessage("Team updated successfully.");
  }

  function getTeamName(teamId: string | null) {
    if (!teamId) return "Unassigned";

    return (
      teams.find((team) => team.id === teamId)?.name ?? "Unknown team"
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-orange-50 px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Admin Panel
            </p>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                  Participants
                </h1>

                <p className="mt-2 text-gray-600">
                  Manage registered participants and assign teams.
                </p>
              </div>

              <div className="rounded-2xl bg-white px-5 py-3 shadow-sm ring-1 ring-orange-100">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Total Participants
                </p>

                <p className="mt-1 text-2xl font-black text-orange-600">
                  {participants.length}
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div className="mb-6 rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-700">
              {message}
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-orange-100">
              <p className="text-gray-600">Loading participants...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-orange-100">
              <h2 className="text-xl font-bold text-gray-900">
                No participants yet
              </h2>

              <p className="mt-2 text-gray-600">
                Participants will appear here after they register for a game.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-orange-100">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="border-b border-orange-100 bg-orange-50">
                    <tr>
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Name
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Phone
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Room
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Team
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                        Registered
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {participants.map((participant) => (
                      <tr
                        key={participant.id}
                        className="transition hover:bg-orange-50/50"
                      >
                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {participant.full_name}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {participant.phone}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {participant.room_number || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={participant.team_id ?? ""}
                            onChange={(event) =>
                              updateTeam(
                                participant.id,
                                event.target.value,
                              )
                            }
                            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                          >
                            <option value="">Unassigned</option>

                            {teams.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name}
                              </option>
                            ))}
                          </select>

                          <p className="mt-1 text-xs text-gray-400">
                            {getTeamName(participant.team_id)}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {new Date(
                            participant.created_at,
                          ).toLocaleDateString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}