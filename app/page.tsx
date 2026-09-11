import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

type Announcement = {
  id: string;
  title: string;
  message: string;
  priority: number;
  created_at: string;
};

export const instant = false;

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("announcements")
    .select("id, title, message, priority, created_at")
    .eq("published", true)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(3);

  const announcements: Announcement[] = data ?? [];

  return (
    <main className="min-h-screen bg-[#fffaf2]">
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="festival-grid absolute inset-0" />

        <div className="container-page relative py-14 md:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            {/* Left */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-orange-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Ganesh Utsav 2026
              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-tight text-gray-950 sm:text-6xl lg:text-7xl">
                One Hostel.
                <br />
                <span className="text-gradient">
                  One Ganpati.
                </span>
                <br />
                One Family.
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-gray-600 md:text-lg">
                A shared celebration of devotion, games,
                culture and community — built by us,
                for us.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/chanda"
                  className="rounded-2xl bg-orange-600 px-6 py-3.5 text-center font-bold text-white shadow-lg shadow-orange-600/15 transition hover:-translate-y-0.5 hover:bg-orange-700"
                >
                  Contribute Chanda
                </Link>

                <Link
                  href="/games"
                  className="rounded-2xl border border-orange-200 bg-white px-6 py-3.5 text-center font-bold text-gray-800 transition hover:border-orange-300 hover:bg-orange-50"
                >
                  Explore Games
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-gray-500">
                <span>🪔 Daily Aarti</span>
                <span>🏆 Team Competition</span>
                <span>🎉 Cultural Events</span>
              </div>
            </div>

            {/* Right */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[470px]">
                <div className="absolute -inset-6 rounded-[40px] bg-orange-200/40 blur-3xl" />

                <div className="festival-card relative overflow-hidden p-4">
                  <div className="aspect-[4/5] overflow-hidden rounded-[22px] bg-gradient-to-b from-orange-100 via-orange-50 to-amber-50">
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="float-soft text-8xl md:text-[9rem]">
                        🪔
                      </div>

                      <p className="mt-8 text-xs font-black uppercase tracking-[0.3em] text-orange-600">
                        Ganpati Bappa
                      </p>

                      <p className="mt-2 text-4xl font-black text-gray-950 md:text-5xl">
                        Morya!
                      </p>

                      <div className="mt-7 h-px w-24 bg-orange-300" />

                      <p className="mt-6 max-w-xs px-6 text-sm leading-6 text-gray-600">
                        Together we celebrate devotion,
                        friendship and the spirit of our
                        hostel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-5 -left-3 rounded-2xl border border-orange-100 bg-white px-4 py-3 shadow-xl sm:-left-6">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Community
                  </p>

                  <p className="mt-1 font-black text-gray-900">
                    Morya • Modak • Siddhi • Ekdant
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="border-y border-orange-100 bg-white">
        <div className="container-page grid grid-cols-2 divide-x divide-orange-100 md:grid-cols-4">
          {[
            ["4", "Teams"],
            ["5", "Festival Days"],
            ["5+", "Game Categories"],
            ["∞", "Memories"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="px-4 py-6 text-center md:py-8"
            >
              <p className="text-2xl font-black text-orange-600 md:text-3xl">
                {value}
              </p>

              <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gray-500 md:text-sm">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE / TODAY */}
      <section className="section-space">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                Festival Hub
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
                Everything happening around the Utsav.
              </h2>
            </div>

            <Link
              href="/schedule"
              className="font-bold text-orange-700 hover:underline"
            >
              Full schedule →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <Link
              href="/schedule"
              className="festival-card festival-card-hover group p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-xl">
                  🕐
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                  Live Schedule
                </span>
              </div>

              <h3 className="mt-6 text-xl font-black text-gray-950">
                Today&apos;s Utsav
              </h3>

              <p className="mt-2 leading-6 text-gray-600">
                See aarti, games, cultural events and
                activities planned for today.
              </p>

              <p className="mt-5 font-bold text-orange-700">
                View schedule →
              </p>
            </Link>

            <Link
              href="/games"
              className="festival-card festival-card-hover group p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-xl">
                  🏆
                </div>

                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                  Compete
                </span>
              </div>

              <h3 className="mt-6 text-xl font-black text-gray-950">
                Games & Challenges
              </h3>

              <p className="mt-2 leading-6 text-gray-600">
                Chess, cricket, carrom, quiz and fun
                activities for everyone.
              </p>

              <p className="mt-5 font-bold text-orange-700">
                Explore games →
              </p>
            </Link>

            <Link
              href="/teams"
              className="festival-card festival-card-hover group p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-100 text-xl">
                  👥
                </div>

                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                  Team Battle
                </span>
              </div>

              <h3 className="mt-6 text-xl font-black text-gray-950">
                Meet the Teams
              </h3>

              <p className="mt-2 leading-6 text-gray-600">
                Morya, Modak, Siddhivinayak and Ekdant
                compete across the Utsav.
              </p>

              <p className="mt-5 font-bold text-orange-700">
                View teams →
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">
                Stay Updated
              </p>

              <h2 className="mt-2 text-3xl font-black text-gray-950">
                Latest announcements
              </h2>
            </div>

            <Link
              href="/announcements"
              className="hidden font-bold text-orange-700 hover:underline sm:block"
            >
              View all →
            </Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {announcements.length === 0 ? (
              <div className="festival-card p-8 md:col-span-3">
                <p className="font-bold text-gray-900">
                  No announcements yet.
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  Festival updates will appear here.
                </p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <article
                  key={announcement.id}
                  className="festival-card festival-card-hover p-6"
                >
                  {announcement.priority > 0 && (
                    <span className="inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                      Important
                    </span>
                  )}

                  <h3 className="mt-4 text-xl font-black text-gray-950">
                    {announcement.title}
                  </h3>

                  <p className="mt-3 line-clamp-4 text-sm leading-6 text-gray-600">
                    {announcement.message}
                  </p>

                  <p className="mt-5 text-xs font-semibold text-gray-400">
                    {new Date(
                      announcement.created_at
                    ).toLocaleDateString("en-IN")}
                  </p>
                </article>
              ))
            )}
          </div>

          <Link
            href="/announcements"
            className="mt-6 block text-center font-bold text-orange-700 sm:hidden"
          >
            View all announcements →
          </Link>
        </div>
      </section>

      {/* CHANDA CTA */}
      <section className="section-space">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[32px] bg-gray-950 px-6 py-12 text-white md:px-12 md:py-16">
            <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-orange-600/20 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">
                  Support the Utsav
                </p>

                <h2 className="mt-3 max-w-2xl text-3xl font-black md:text-4xl">
                  Every contribution helps make the celebration better.
                </h2>

                <p className="mt-4 max-w-xl leading-7 text-gray-400">
                  Contribute through UPI and be part of the
                  Ganesh Utsav.
                </p>
              </div>

              <Link
                href="/chanda"
                className="shrink-0 rounded-2xl bg-orange-600 px-7 py-4 text-center font-black text-white transition hover:bg-orange-500"
              >
                Contribute Chanda →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-orange-100 bg-white">
        <div className="container-page flex flex-col gap-4 py-8 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-black text-gray-900">
              GANESH&apos;26
            </p>

            <p className="mt-1">
              Ganpati Bappa Morya.
            </p>
          </div>

          <div className="flex flex-wrap gap-5">
            <Link href="/games" className="hover:text-orange-600">
              Games
            </Link>

            <Link href="/teams" className="hover:text-orange-600">
              Teams
            </Link>

            <Link href="/schedule" className="hover:text-orange-600">
              Schedule
            </Link>

            <Link href="/chanda" className="font-bold text-orange-600">
              Chanda
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}