import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

type TeamMember = {
  team_id: string;
  team_name: string;
  short_name: string | null;
  member_id: string | null;
  full_name: string | null;
};

type Team = {
  id: string;
  name: string;
  short_name: string | null;
  members: string[];
};

export default async function TeamsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "get_public_team_members"
  );

  if (error) {
    return (
      <main className="min-h-screen bg-orange-50">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link
              href="/"
              className="text-xl font-bold text-orange-600"
            >
              Ganesh Utsav 2026
            </Link>

            <Link
              href="/chanda"
              className="rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
            >
              Chanda
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="rounded-2xl bg-red-50 p-5 text-red-700">
            Unable to load teams.
          </div>
        </div>
      </main>
    );
  }

  const rows: TeamMember[] = data ?? [];

  const teamMap = new Map<string, Team>();

  for (const row of rows) {
    if (!teamMap.has(row.team_id)) {
      teamMap.set(row.team_id, {
        id: row.team_id,
        name: row.team_name,
        short_name: row.short_name,
        members: [],
      });
    }

    if (row.member_id && row.full_name) {
      teamMap.get(row.team_id)?.members.push(row.full_name);
    }
  }

  const teams = Array.from(teamMap.values());

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

          <div className="flex gap-3">
            <Link
              href="/schedule"
              className="hidden rounded-xl border border-orange-200 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-50 sm:block"
            >
              Schedule
            </Link>

            <Link
              href="/chanda"
              className="rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
            >
              Chanda
            </Link>
          </div>
        </div>
      </header>

      {/* Heading */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Ganesh Utsav 2026
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Our Teams
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            Four teams competing together throughout the Ganesh Utsav.
          </p>
        </div>
      </section>

      {/* Teams */}
      <section className="px-6 pb-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2">
          {teams.map((team) => (
            <article
              key={team.id}
              className="rounded-2xl bg-white p-6 shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
                    {team.short_name}
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-gray-900">
                    {team.name}
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                  {team.members.length}
                </div>
              </div>

              <div className="mt-5 border-t pt-5">
                <p className="mb-3 text-sm font-semibold text-gray-500">
                  Team Members
                </p>

                {team.members.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    Members will be assigned soon.
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {team.members.map((member, index) => (
                      <div
                        key={`${team.id}-${member}-${index}`}
                        className="rounded-lg bg-orange-50 px-4 py-3 text-sm font-medium text-gray-800"
                      >
                        {member}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-6xl rounded-2xl bg-orange-600 p-8 text-center text-white">
          <h2 className="text-2xl font-bold">
            Ready for the Utsav?
          </h2>

          <p className="mt-2 text-orange-100">
            Check the schedule and support the celebration.
          </p>

          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/schedule"
              className="rounded-xl bg-white px-6 py-3 font-bold text-orange-700 hover:bg-orange-50"
            >
              View Schedule
            </Link>

            <Link
              href="/chanda"
              className="rounded-xl border border-white px-6 py-3 font-bold text-white hover:bg-orange-500"
            >
              Contribute Chanda
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white px-6 py-6">
        <div className="mx-auto max-w-6xl text-center text-sm text-gray-500">
          Ganesh Utsav 2026
        </div>
      </footer>
    </main>
  );
}