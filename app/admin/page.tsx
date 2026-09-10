import Link from "next/link";
import { redirect } from "next/navigation";

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
    .single();

  const isAdmin =
    profile?.role === "super_admin" ||
    profile?.role === "event_admin";

  if (!isAdmin) {
    redirect("/");
  }

  const { data: chandaPayments } = await supabase
    .from("chanda_payments")
    .select("amount");

  const { count: announcementCount } = await supabase
    .from("announcements")
    .select("*", { count: "exact", head: true })
    .eq("published", true);

  const totalChanda = (chandaPayments ?? []).reduce(
    (total, payment) => total + Number(payment.amount),
    0
  );

  return (
    <main className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
              Ganesh Utsav 2026
            </p>

            <h1 className="text-xl font-bold text-gray-900">
              Admin Dashboard
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

      {/* Main */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <p className="text-sm text-gray-500">
              Welcome
            </p>

            <h2 className="mt-1 text-3xl font-bold text-gray-900">
              {profile?.full_name || "Administrator"}
            </h2>

            <p className="mt-2 text-gray-600">
              Manage the Ganesh Utsav website from here.
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-500">
                Total Chanda
              </p>

              <p className="mt-2 text-3xl font-bold text-orange-600">
                ₹{totalChanda.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-500">
                Contributions
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {chandaPayments?.length ?? 0}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow">
              <p className="text-sm font-medium text-gray-500">
                Published Announcements
              </p>

              <p className="mt-2 text-3xl font-bold text-gray-900">
                {announcementCount ?? 0}
              </p>
            </div>
          </div>

          {/* Management */}
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900">
              Management
            </h3>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/admin/chanda"
                className="group rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl">💰</div>

                <h4 className="mt-4 text-xl font-bold text-gray-900">
                  Chanda
                </h4>

                <p className="mt-2 text-sm text-gray-600">
                  View Chanda contribution records.
                </p>

                <p className="mt-4 font-semibold text-orange-600">
                  Open →
                </p>
              </Link>
              <Link href="/admin/schedule"
                  className="group rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="text-3xl">📅</div>
                  <h4 className="mt-4 text-xl font-bold text-gray-900">
                      Schedule
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                      Add and manage event activities and timings.
                  </p>
                  <p className="mt-4 font-semibold text-orange-600">
                       Open →
                  </p>
              </Link>

              <Link
                href="/admin/announcements"
                className="group rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl">📢</div>

                <h4 className="mt-4 text-xl font-bold text-gray-900">
                  Announcements
                </h4>

                <p className="mt-2 text-sm text-gray-600">
                  Publish important event updates.
                </p>

                <p className="mt-4 font-semibold text-orange-600">
                  Open →
                </p>
              </Link>

              <Link
                href="/schedule"
                className="group rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl">📅</div>

                <h4 className="mt-4 text-xl font-bold text-gray-900">
                  Schedule
                </h4>

                <p className="mt-2 text-sm text-gray-600">
                  View the current event schedule.
                </p>

                <p className="mt-4 font-semibold text-orange-600">
                  Open →
                </p>
              </Link>

              <Link
                href="/"
                className="group rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl">🌐</div>

                <h4 className="mt-4 text-xl font-bold text-gray-900">
                  Website
                </h4>

                <p className="mt-2 text-sm text-gray-600">
                  Open the public Ganesh Utsav website.
                </p>

                <p className="mt-4 font-semibold text-orange-600">
                  Open →
                </p>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 rounded-2xl bg-white p-6 shadow">
            <h3 className="text-xl font-bold text-gray-900">
              Quick Links
            </h3>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/chanda"
                className="rounded-xl bg-orange-100 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-200"
              >
                View Chanda Page
              </Link>

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
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
