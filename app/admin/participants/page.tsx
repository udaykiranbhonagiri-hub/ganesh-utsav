import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const instant = false;

type Participant = {
  id: string;
  full_name: string | null;
  phone: string | null;
  room_number: string | null;
  role: string;
  team_id: string | null;
  created_at: string;
};

type Team = {
  id: string;
  name: string;
};

export default async function AdminParticipantsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin =
    profile?.role === "super_admin" ||
    profile?.role === "event_admin";

  if (!isAdmin) {
    redirect("/");
  }

  const [
    { data: participants, error: participantError },
    { data: teams, error: teamError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, phone, room_number, role, team_id, created_at"
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("teams")
      .select("id, name")
      .order("name", { ascending: true }),
  ]);

  if (participantError || teamError) {
    return (
      <main className="min-h-screen bg-orange-50 p-6">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/admin"
            className="text-sm font-medium text-orange-700 hover:underline"
          >
            ← Admin Dashboard
          </Link>

          <div className="mt-6 rounded-2xl bg-red-50 p-5 text-red-700">
            Unable to load participants or teams.
          </div>
        </div>
      </main>
    );
  }

  const items: Participant[] = participants ?? [];
  const teamList: Team[] = teams ?? [];

  return (
    <main className="min-h-screen bg-orange-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Ganesh Utsav 2026
            </p>

            <h1 className="text-xl font-bold text-gray-900">
              Admin
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

          <div className="mt-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Event Management
            </p>

            <h2 className="mt-1 text-3xl font-bold text-gray-900">
              Participants
            </h2>

            <p className="mt-2 text-gray-600">
              Assign registered participants to event teams.
            </p>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow">
            {items.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-semibold text-gray-800">
                  No participants yet.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Registered users will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Name
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Phone
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Room
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Current Team
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Assign Team
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((participant) => {
                      const currentTeam = teamList.find(
                        (team) => team.id === participant.team_id
                      );

                      return (
                        <tr
                          key={participant.id}
                          className="border-t hover:bg-orange-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {participant.full_name || "Unnamed"}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {participant.phone || "-"}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {participant.room_number || "-"}
                          </td>

                          <td className="px-6 py-4">
                            {currentTeam ? (
                              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                                {currentTeam.name}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                Not assigned
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <form
                              action={async (formData) => {
                                "use server";

                                const teamId =
                                  formData.get("team_id");

                                const participantId =
                                  formData.get("participant_id");

                                const serverSupabase =
                                  await createClient();

                                const {
                                  data: {
                                    user: currentUser,
                                  },
                                } =
                                  await serverSupabase.auth.getUser();

                                if (!currentUser) {
                                  redirect("/login");
                                }

                                const {
                                  data: adminProfile,
                                } =
                                  await serverSupabase
                                    .from("profiles")
                                    .select("role")
                                    .eq(
                                      "id",
                                      currentUser.id
                                    )
                                    .single();

                                if (
                                  adminProfile?.role !==
                                    "super_admin" &&
                                  adminProfile?.role !==
                                    "event_admin"
                                ) {
                                  redirect("/");
                                }

                                const { error } =
                                  await serverSupabase
                                    .from("profiles")
                                    .update({
                                      team_id:
                                        teamId === "none"
                                          ? null
                                          : teamId,
                                    })
                                    .eq(
                                      "id",
                                      participantId
                                    );

                                if (error) {
                                  throw new Error(
                                    error.message
                                  );
                                }

                                redirect(
                                  "/admin/participants"
                                );
                              }}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="hidden"
                                name="participant_id"
                                value={participant.id}
                              />

                              <select
                                name="team_id"
                                defaultValue={
                                  participant.team_id ?? "none"
                                }
                                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500"
                              >
                                <option value="none">
                                  No Team
                                </option>

                                {teamList.map((team) => (
                                  <option
                                    key={team.id}
                                    value={team.id}
                                  >
                                    {team.name}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="submit"
                                className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                              >
                                Save
                              </button>
                            </form>
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