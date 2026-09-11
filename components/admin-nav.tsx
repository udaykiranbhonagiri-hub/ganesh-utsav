"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const links = [
  {
    href: "/admin",
    label: "Dashboard",
  },
  {
    href: "/admin/registrations",
    label: "Registrations",
  },
  {
    href: "/admin/participants",
    label: "Participants",
  },
  {
    href: "/admin/schedule",
    label: "Schedule",
  },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/auth/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">

        <Link
          href="/admin"
          className="shrink-0 text-lg font-black text-neutral-900"
        >
          Ganesh Utsav
          <span className="ml-2 text-orange-600">Admin</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                  active
                    ? "bg-orange-100 text-orange-700"
                    : "text-neutral-600 hover:bg-orange-50 hover:text-orange-700"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-neutral-800"
        >
          Logout
        </button>
      </div>

      <div className="overflow-x-auto border-t border-neutral-100 md:hidden">
        <nav className="mx-auto flex max-w-7xl gap-1 px-4 py-2">
          {links.map((link) => {
            const active =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-xl px-3 py-2 text-sm font-bold ${
                  active
                    ? "bg-orange-100 text-orange-700"
                    : "text-neutral-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}