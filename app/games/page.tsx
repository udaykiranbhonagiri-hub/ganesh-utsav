import Link from "next/link";

const games = [
  {
    id: "chess",
    name: "Chess",
    icon: "♟️",
    description:
      "Individual chess tournament between hostel participants.",
    format: "Individual",
  },
  {
    id: "cricket",
    name: "Cricket",
    icon: "🏏",
    description:
      "Short-format team cricket competition.",
    format: "Team",
  },
  {
    id: "carrom",
    name: "Carrom",
    icon: "🎯",
    description:
      "Friendly carrom competition.",
    format: "Individual / Team",
  },
  {
    id: "quiz",
    name: "Quiz",
    icon: "🧠",
    description:
      "General knowledge and Ganesh Utsav quiz.",
    format: "Team",
  },
  {
    id: "fun",
    name: "Fun Games",
    icon: "🎮",
    description:
      "Simple games and activities for everyone.",
    format: "Team / Individual",
  },
];

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-orange-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-xl font-bold text-orange-600"
          >
            Ganesh Utsav 2026
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/teams"
              className="hidden rounded-xl border border-orange-200 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-50 sm:block"
            >
              Teams
            </Link>

            <Link
              href="/register?next=/games"
              className="hidden rounded-xl border border-orange-200 px-4 py-2 font-semibold text-orange-700 hover:bg-orange-50 md:block"
            >
              Register
            </Link>

            <Link
              href="/chanda"
              className="rounded-xl bg-orange-600 px-5 py-2.5 font-semibold text-white hover:bg-orange-700"
            >
              Chanda
            </Link>
          </div>
        </div>
      </header>

      {/* Heading */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Ganesh Utsav 2026
          </p>

          <h1 className="mt-2 text-4xl font-bold text-gray-900">
            Games & Activities
          </h1>

          <p className="mt-3 max-w-2xl text-gray-600">
            First register as a participant and choose your team, then join
            the games and activities planned during the Utsav.
          </p>

          <Link
            href="/register?next=/games"
            className="mt-6 inline-block rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
          >
            Register and choose a team
          </Link>
        </div>
      </section>

      {/* Games */}
      <section className="px-6 pb-16">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <article
              key={game.id}
              className="rounded-2xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
                  {game.icon}
                </div>

                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                  {game.format}
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-bold text-gray-900">
                {game.name}
              </h2>

              <p className="mt-2 leading-6 text-gray-600">
                {game.description}
              </p>

              <Link
                href={`/games/${game.id}`}
                className="mt-5 inline-block rounded-xl bg-orange-600 px-4 py-2.5 font-semibold text-white hover:bg-orange-700"
              >
                Register
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-gray-500">
          <p>Ganesh Utsav 2026</p>

          <Link
            href="/chanda"
            className="font-semibold text-orange-600 hover:underline"
          >
            Contribute Chanda
          </Link>
        </div>
      </footer>
    </main>
  );
}
