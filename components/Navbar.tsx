"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { name: "Home", href: "/" },
    { name: "Chanda", href: "/chanda" },
    { name: "Schedule", href: "/schedule" },
    { name: "Announcements", href: "/announcements" },
    { name: "Teams", href: "/teams" },
    { name: "Games", href: "/games" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="text-lg font-bold text-orange-600 md:text-xl"
        >
          Ganesh Utsav 2026
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-orange-50 hover:text-orange-700"
            >
              {link.name}
            </Link>
          ))}

          <Link
            href="/register"
            className="ml-2 rounded-xl bg-orange-600 px-4 py-2 font-semibold text-white transition hover:bg-orange-700"
          >
            Register
          </Link>
        </nav>

        {/* Mobile buttons */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/chanda"
            className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-semibold text-white"
          >
            Chanda
          </Link>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-xl text-gray-700"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {open && (
        <div className="border-t bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl px-4 py-3 md:px-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-3 font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-700"
              >
                {link.name}
              </Link>
            ))}

            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-xl bg-orange-600 px-4 py-3 text-center font-semibold text-white"
            >
              Participant Registration
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}