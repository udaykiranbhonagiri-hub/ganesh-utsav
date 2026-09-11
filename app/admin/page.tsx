import Link from "next/link";
import { redirect } from "next/navigation";

import { isSupaAdmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!isSupaAdmin(profile?.role)) {
    redirect("/");
  }

  const [
    { count: announcementCount },
    { count: gameCount },
    { count: participantCount },
  ] = await Promise.all([
    supabase
      .from("announcements")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
    supabase.from("games").select("*", { count: "exact", head: true }),
    supabase
      .from("participants")
      .select("*", { count: "exact", head: true }),
  ]);

  const managementLinks = [
    {
      href: "/admin/schedule",
      icon: "Schedule",
      title: "Schedule",
      description: "Add and manage event activities and timings.",
    },
    {
      href: "/admin/announcements",
      icon: "Updates",
      title: "Announcements",
      description: "Publish important event updates.",
    },
    {
      href: "/admin/games",
      icon: "Games",
      title: "Games",
      description: "Add games and open or close participant registration.",
    },
    {
      href: "/admin/participants",
      icon: "People",
      title: "Participants",
      description: "View game participants and assign teams.",
    },
  ];

  return (
    <main className="min-h-screen bg-orange-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Ganesh Utsav 2026
            </p>
            <h1 className="text-xl font-bold text-gray-900">
              Supa Admin Dashboard
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-orange-200 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-50"
          >
            View Website
          </Link>
        </div>
      </header>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-sm text-gray-500">Welcome</p>
            <h2 className="mt-1 text-3xl font-bold text-gray-900">
              {profile?.full_name || "Supa Admin"}
            </h2>
            <p className="mt-2 text-gray-600">
              This area is available only to the supa_admin account.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <StatCard label="Published announcements" value={announcementCount ?? 0} />
            <StatCard label="Games" value={gameCount ?? 0} />
            <StatCard label="Participants" value={participantCount ?? 0} />
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900">Management</h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {managementLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="text-sm font-bold uppercase tracking-wider text-orange-600">
                    {link.icon}
                  </div>
                  <h4 className="mt-4 text-xl font-bold text-gray-900">
                    {link.title}
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">{link.description}</p>
                  <p className="mt-4 font-semibold text-orange-600">Open &rarr;</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-white p-6 shadow">
            <h3 className="text-xl font-bold text-gray-900">Public pages</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/announcements"
                className="rounded-xl bg-orange-100 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-200"
              >
                View Announcements
              </Link>
              <Link
                href="/schedule"
                className="rounded-xl bg-orange-100 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-200"
              >
                View Schedule
              </Link>
              <Link
                href="/games"
                className="rounded-xl bg-orange-100 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-200"
              >
                View Games
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
