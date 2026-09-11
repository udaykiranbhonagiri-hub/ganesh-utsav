import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";

type Team = {
  id: string;
  name: string;
  short_name: string | null;
  description: string | null;
};

type TeamMember = {
  team_id: string;
  full_name: string | null;
};

const teamStyles: Record<
  string,
  {
    code: string;
    label: string;
    light: string;
    text: string;
  }
> = {
  Ekdant: {
    code: "EKD",
    label: "Strength & Spirit",
    light: "bg-orange-50",
    text: "text-orange-700",
  },
  Modak: {
    code: "MOD",
    label: "Energy & Unity",
    light: "bg-amber-50",
    text: "text-amber-700",
  },
  Morya: {
    code: "MOR",
    label: "Fire & Focus",
    light: "bg-red-50",
    text: "text-red-700",
  },
  Siddhivinayak: {
    code: "SID",
    label: "Discipline & Drive",
    light: "bg-yellow-50",
    text: "text-yellow-700",
  },
};

export const instant = false;

export default async function TeamsPage() {
  const supabase = await createClient();

  const [{ data: teams }, { data: members }] = await Promise.all([
    supabase
      .from("teams")
      .select("id, name, short_name, description")
      .order("name", { ascending: true }),

    supabase
      .from("get_public_team_members")
      .select("team_id, full_name"),
  ]);

  const safeTeams = (teams ?? []) as Team[];
  const safeMembers = (members ?? []) as TeamMember[];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#fffaf3]">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-orange-100">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(234,88,12,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(234,88,12,0.045)_1px,transparent_1px)] bg-[size:32px_32px]" />

          <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Ganesh Utsav 2026
              </div>

              <h1 className="mt-6 text-5xl font-black tracking-[-0.04em] text-gray-950 sm:text-6xl lg:text-7xl">
                One festival.
                <br />
                <span className="text-orange-600">Four teams.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                Four hostel teams. One celebration. Every game, challenge and
                moment adds to the team spirit.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/games"
                className="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:-translate-y-0.5 hover:bg-orange-700"
              >
                Explore Games
              </Link>

              <Link
                href="/schedule"
                className="rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-700"
              >
                View Schedule
              </Link>
            </div>
          </div>
        </section>

        {/* Teams */}
        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                The competition
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
                Meet the teams
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-gray-500">
              Represent your team across games, challenges and festival
              activities.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {safeTeams.map((team, index) => {
              const style =
                teamStyles[team.name] ?? {
                  code: team.short_name ?? `T0${index + 1}`,
                  label: "Team Spirit",
                  light: "bg-orange-50",
                  text: "text-orange-700",
                };

              const teamMembers = safeMembers.filter(
                (member) => member.team_id === team.id,
              );

              return (
                <article
                  key={team.id}
                  className="group overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex min-h-[270px] flex-col justify-between p-6 sm:p-7">
                    <div>
                      <div className="flex items-start justify-between gap-5">
                        <div
                          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-black ${style.light} ${style.text}`}
                        >
                          {style.code}
                        </div>

                        <span className="text-xs font-black tracking-[0.18em] text-gray-300">
                          0{index + 1}
                        </span>
                      </div>

                      <p
                        className={`mt-7 text-xs font-bold uppercase tracking-[0.16em] ${style.text}`}
                      >
                        {style.label}
                      </p>

                      <h3 className="mt-2 text-3xl font-black tracking-tight text-gray-950">
                        {team.name}
                      </h3>

                      <p className="mt-3 max-w-lg text-sm leading-6 text-gray-600">
                        {team.description ||
                          `Represent ${team.name} across the Ganesh Utsav competitions.`}
                      </p>
                    </div>

                    <div className="mt-7 border-t border-gray-100 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                            Team Members
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            {teamMembers.length > 0
                              ? "Members are being assigned."
                              : "Members will be assigned soon."}
                          </p>
                        </div>

                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${style.light} text-lg ${style.text} transition group-hover:translate-x-1`}
                        >
                          →
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Festival CTA */}
        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
          <div className="overflow-hidden rounded-[32px] bg-gray-950 px-6 py-10 text-white sm:px-10 sm:py-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">
                  Team spirit
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Your team is ready.
                  <br />
                  Are you?
                </h2>

                <p className="mt-4 text-sm leading-6 text-gray-400 sm:text-base">
                  Choose your game and represent your team in the festival.
                </p>
              </div>

              <Link
                href="/games"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-orange-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-orange-500"
              >
                Join a Game
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}