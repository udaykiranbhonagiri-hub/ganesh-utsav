"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "Games", href: "/games" },
  { label: "Teams", href: "/teams" },
  { label: "Schedule", href: "/schedule" },
  { label: "Updates", href: "/announcements" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/90 backdrop-blur-xl">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-xl shadow-sm">
              🪔
            </div>

            <div>
              <p className="text-sm font-black tracking-tight text-gray-950">
                GANESH-26
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-orange-600">
                Hostel Utsav
              </p>
            </div>
          </Link>

          {/* Desktop */}
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/chanda"
              className="ml-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-700"
            >
              Chanda
            </Link>
          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/chanda"
              className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white"
            >
              Chanda
            </Link>

            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200 bg-white text-lg"
            >
              {open ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-orange-100 py-3 lg:hidden">
            <nav className="grid gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-700"
                >
                  {link.label}
                </Link>
              ))}

              <Link
                href="/chanda"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-xl bg-orange-600 px-4 py-3 text-center font-bold text-white"
              >
                Contribute Chanda
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}