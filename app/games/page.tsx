import Link from "next/link";

const games = [
  {
    name: "Chess",
    slug: "chess",
    icon: "♟",
    description: "Think ahead, stay sharp and outplay your opponent.",
  },
  {
    name: "Cricket",
    slug: "cricket",
    icon: "🏏",
    description: "Bring your hostel team together and compete.",
  },
  {
    name: "Carrom",
    slug: "carrom",
    icon: "⚪",
    description: "Precision, control and clean finishes.",
  },
  {
    name: "Free Fire",
    slug: "freefire",
    icon: "🎯",
    description: "Fast mobile battles and competitive gameplay.",
  },
  {
    name: "Quiz",
    slug: "quiz",
    icon: "🧠",
    description: "Test your knowledge across exciting categories.",
  },
  {
    name: "Fun Games",
    slug: "fun",
    icon: "🎉",
    description: "Simple, energetic games built for everyone.",
  },
  {
    name: "Smash Karts",
    slug: "smashkarts",
    icon: "🏎️",
    description: "Race, battle and survive the kart chaos.",
  },
  {
    name: "UNO",
    slug: "uno",
    icon: "🃏",
    description: "Classic card battles with hostel friends.",
  },
  {
    name: "Rummy",
    slug: "rummy",
    icon: "♠",
    description: "Friendly festival card game with no cash wagering.",
  },
];

export default function GamesPage() {
  return (
    <main className="min-h-screen bg-[#fffaf3]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-orange-100">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-yellow-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.2em] text-orange-600">
              Ganesh Utsav 2026
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-neutral-950 sm:text-5xl lg:text-6xl">
              Festival Games
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg">
              Choose your games, register once and compete throughout the
              festival.
            </p>

            <div className="mt-7 inline-flex flex-col rounded-2xl border border-orange-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  One Game Pass
                </p>

                <p className="mt-1 text-2xl font-black text-neutral-950">
                  ₹20
                </p>
              </div>

              <div className="hidden h-10 w-px bg-neutral-200 sm:block" />

              <p className="max-w-sm text-sm leading-6 text-neutral-500">
                Select as many games as you want. Pay ₹20 only once.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Games */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="group flex h-full flex-col rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-3xl">
                  {game.icon}
                </div>

                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700">
                  ₹20 Pass
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-black text-neutral-950">
                {game.name}
              </h2>

              <p className="mt-2 flex-1 text-sm leading-6 text-neutral-500">
                {game.description}
              </p>

              <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-4">
                <span className="text-sm font-bold text-neutral-500">
                  Register
                </span>

                <span className="font-black text-orange-600 transition group-hover:translate-x-1">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl bg-neutral-950 px-6 py-10 text-white sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
                Ready?
              </p>

              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Register for your games
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400 sm:text-base">
                Pick one game or several games. The Game Pass remains ₹20
                total.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-black text-white transition hover:bg-orange-600"
            >
              Register Now →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}