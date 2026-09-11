import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupaAdmin } from "@/lib/admin";
import ScheduleClient from "./ScheduleClient";

export default function AdminSchedulePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fffaf3] px-4 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              <p className="font-semibold text-neutral-600">
                Loading schedule...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <AdminScheduleContent />
    </Suspense>
  );
}

async function AdminScheduleContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/schedule");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !isSupaAdmin(profile.role)) {
    redirect("/");
  }

  return <ScheduleClient />;
}