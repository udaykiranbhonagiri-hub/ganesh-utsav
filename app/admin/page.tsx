export const instant = false;

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupaAdmin } from "@/lib/admin";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !isSupaAdmin(profile.role)) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-[#fffaf3] px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-600">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-neutral-900">
            Ganesh Utsav Administration
          </h1>

          <p className="mt-2 text-neutral-600">
            Manage registrations, participants, schedule and festival content.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Registrations */}
          <Link
            href="/admin/registrations"
            className="group rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-orange-600">
                  Games
                </p>

                <h2 className="mt-2 text-2xl font-black text-neutral-900">
                  Registrations
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  View participants, selected games, UTR numbers and
                  approve or reject registrations.
                </p>
              </div>

              <div className="rounded-2xl bg-orange-100 px-4 py-3 text-2xl">
                🎮
              </div>
            </div>

            <div className="mt-6 font-bold text-orange-600">
              Open Registrations →
            </div>
          </Link>

          {/* Participants */}
          <Link
            href="/admin/participants"
            className="group rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-orange-600">
                  Management
                </p>

                <h2 className="mt-2 text-2xl font-black text-neutral-900">
                  Participants
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Manage registered participants and their details.
                </p>
              </div>

              <div className="rounded-2xl bg-orange-100 px-4 py-3 text-2xl">
                👥
              </div>
            </div>

            <div className="mt-6 font-bold text-orange-600">
              Open Participants →
            </div>
          </Link>

          {/* Schedule */}
          <Link
            href="/admin/schedule"
            className="group rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-orange-600">
                  Festival
                </p>

                <h2 className="mt-2 text-2xl font-black text-neutral-900">
                  Schedule
                </h2>

                <p className="mt-2 text-sm text-neutral-500">
                  Add and manage Ganesh Utsav events and timings.
                </p>
              </div>

              <div className="rounded-2xl bg-orange-100 px-4 py-3 text-2xl">
                📅
              </div>
            </div>

            <div className="mt-6 font-bold text-orange-600">
              Open Schedule →
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}