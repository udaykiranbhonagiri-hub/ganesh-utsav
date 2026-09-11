import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupaAdmin } from "@/lib/admin";
import RegistrationsClient from "./RegistrationsClient";

export default function AdminRegistrationsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fffaf3] px-4 py-10">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl bg-white p-8 shadow-sm">
              Loading registrations...
            </div>
          </div>
        </main>
      }
    >
      <AdminRegistrationsContent />
    </Suspense>
  );
}

async function AdminRegistrationsContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin/registrations");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !profile || !isSupaAdmin(profile.role)) {
    redirect("/");
  }

  return <RegistrationsClient />;
}