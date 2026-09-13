"use client";

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";

type Game = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  game_type: string | null;
};



function RegisterContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();

  const initialGame = searchParams.get("game");

  const [games, setGames] = useState<Game[]>([]);
  const [selectedGames, setSelectedGames] = useState<string[]>(
    initialGame ? [initialGame] : []
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [room, setRoom] = useState("");
  const [utr, setUtr] = useState("");

  const [loadingGames, setLoadingGames] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "";
  const upiName =
    process.env.NEXT_PUBLIC_UPI_NAME || "Ganesh Utsav";

  const upiLink = useMemo(() => {
    if (!upiId) return "";

    const params = new URLSearchParams({
      pa: upiId,
      pn: upiName,
      am: "20",
      cu: "INR",
    });

    return `upi://pay?${params.toString()}`;
  }, [upiId, upiName]);

  useEffect(() => {
    loadGames();
  }, []);

async function loadGames() {
  setLoadingGames(true);
  setError("");

  const { data, error } = await supabase
    .from("games")
    .select("id,name,slug,description,game_type")
    .eq("registration_open", true)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to load games:", error);
    setGames([]);
    setError(
      `Unable to load games: ${error.message}`
    );
    setLoadingGames(false);
    return;
  }

  if (!data || data.length === 0) {
    setGames([]);
    setError(
      "No games are currently open for registration."
    );
    setLoadingGames(false);
    return;
  }

  setGames(data);

  if (
    initialGame &&
    !data.some((game) => game.slug === initialGame)
  ) {
    setSelectedGames([]);
  }

  setLoadingGames(false);
}

  function toggleGame(slug: string) {
    setSelectedGames((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanRoom = room.trim();
    const cleanUtr = utr.trim();

    if (!cleanName || !cleanPhone || !cleanRoom) {
      setError(
        "Please fill in name, phone number and room number."
      );
      return;
    }

    if (selectedGames.length === 0) {
      setError("Select at least one game.");
      return;
    }

    if (!cleanUtr) {
      setError("Enter the UTR / payment reference number.");
      return;
    }

    if (!upiId) {
      setError("UPI configuration is missing. Contact the admin.");
      return;
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      setError("Enter a valid 10-digit phone number.");
      return;
    }

    setSubmitting(true);

    try {
      const dbGameRows = games.filter((game) =>
        selectedGames.includes(game.slug)
      );

      if (dbGameRows.length !== selectedGames.length) {
        throw new Error(
          "One or more selected games are unavailable. Refresh and try again."
        );
      }

      const gameIds = dbGameRows.map((game) => game.id);

      const {
        data: participantId,
        error: registrationError,
      } = await supabase.rpc("register_game_pass", {
        p_name: cleanName,
        p_phone: cleanPhone,
        p_room: cleanRoom,
        p_game_ids: gameIds,
        p_utr: cleanUtr,
      });

      if (registrationError) {
        throw new Error(registrationError.message);
      }

      if (!participantId) {
        throw new Error(
          "Registration could not be completed."
        );
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const selectedGameNames = games
    .filter((game) => selectedGames.includes(game.slug))
    .map((game) => game.name);

  if (success) {
    return (
      <main className="min-h-screen bg-[#fffaf3] px-4 py-8 sm:py-12">
        <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center">
          <div className="w-full rounded-[2rem] border border-green-100 bg-white p-6 text-center shadow-xl sm:p-10">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-700">
              ✓
            </div>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-orange-600">
              Ganesh Utsav 2026
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-950 sm:text-4xl">
              Registration Submitted
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-neutral-600 sm:text-base">
              Your Game Pass registration has been recorded.
              The admin will verify your ₹20 payment and confirm
              the selected games.
            </p>

            <div className="mt-8 rounded-3xl bg-orange-50 p-5 text-left sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Participant
                  </p>

                  <p className="mt-1 font-black text-neutral-900">
                    {name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Room
                  </p>

                  <p className="mt-1 font-black text-neutral-900">
                    {room}
                  </p>
                </div>

              </div>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Selected Games
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedGameNames.map((game) => (
                    <span
                      key={game}
                      className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-bold text-white"
                    >
                      {game}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Game Pass
                  </p>

                  <p className="mt-1 text-2xl font-black text-orange-600">
                    ₹20
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    UTR
                  </p>

                  <p className="mt-1 break-all font-semibold text-neutral-800">
                    {utr}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-left text-sm leading-6 text-green-800">
              <strong>Payment verification:</strong> Keep your
              UTR/payment reference available until the admin
              confirms your Game Pass.
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-7 w-full rounded-2xl bg-neutral-950 px-6 py-4 text-sm font-black text-white transition hover:bg-neutral-800"
            >
              Register Another Participant
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf3]">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-orange-100">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-yellow-200/40 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 sm:text-sm">
            Ganesh Utsav 2026
          </p>

          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-neutral-950 sm:text-5xl">
                Game Registration
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
                Select one or more games, pay ₹20 once and submit
                your UTR.
              </p>
            </div>

            <div className="rounded-2xl border border-orange-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Total Game Pass
              </p>

              <p className="mt-1 text-3xl font-black text-neutral-950">
                ₹20
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-8 grid grid-cols-5 gap-1.5 sm:gap-2">
            {[
              ["01", "Details"],
              ["02", "Games"],
              ["03", "Payment"],
              ["04", "UTR"],
              ["05", "Submit"],
            ].map(([number, label], index) => (
              <div key={number} className="text-center">
                <div
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-xs font-black ${
                    index <= 2
                      ? "bg-orange-500 text-white"
                      : "bg-neutral-200 text-neutral-500"
                  }`}
                >
                  {number}
                </div>

                <p className="mt-1 hidden text-[11px] font-bold text-neutral-500 sm:block">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Participant Details */}
          <section className="rounded-[2rem] border border-neutral-100 bg-white p-5 shadow-lg sm:p-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Step 01
              </p>

              <h2 className="mt-1 text-2xl font-black text-neutral-950">
                Participant Details
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Enter the details used for your game registration.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-neutral-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-bold text-neutral-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10)
                    )
                  }
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  required
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="room"
                  className="mb-2 block text-sm font-bold text-neutral-700"
                >
                  Room Number
                </label>

                <input
                  id="room"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Example: 204"
                  required
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

            </div>
          </section>

          {/* Game Selection */}
          <section className="rounded-[2rem] border border-neutral-100 bg-white p-5 shadow-lg sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Step 02
                </p>

                <h2 className="mt-1 text-2xl font-black text-neutral-950">
                  Select Games
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  Select one game or all available games.
                </p>
              </div>

              <div className="rounded-2xl bg-orange-50 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Games Selected
                </p>

                <p className="mt-1 text-2xl font-black text-neutral-950">
                  {selectedGames.length}
                </p>

                <p className="text-xs text-neutral-500">
                  ₹20 covers all
                </p>
              </div>
            </div>

            {loadingGames ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-2xl bg-neutral-100"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {games.map((game) => {
                  const selected = selectedGames.includes(
                    game.slug
                  );

                  return (
                    <button
                      type="button"
                      key={game.slug}
                      onClick={() => toggleGame(game.slug)}
                      className={`group rounded-2xl border p-4 text-left transition duration-200 ${
                        selected
                          ? "border-orange-500 bg-orange-50 shadow-sm ring-2 ring-orange-200"
                          : "border-neutral-200 bg-white hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-black text-neutral-950">
                            {game.name}
                          </h3>

                          <p className="mt-2 text-sm leading-5 text-neutral-500">
                            {game.description}
                          </p>
                        </div>

                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-black transition ${
                            selected
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-neutral-300 text-transparent group-hover:border-orange-300"
                          }`}
                        >
                          ✓
                        </div>
                      </div>

                      <div className="mt-4 text-xs font-bold text-orange-600">
                        {selected
                          ? "Selected"
                          : "Tap to select"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Payment */}
          <section className="rounded-[2rem] border border-neutral-100 bg-white p-5 shadow-lg sm:p-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
                Steps 03 & 04
              </p>

              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-black text-neutral-950">
                  Game Pass Payment
                </h2>

                <span className="rounded-full bg-green-100 px-3 py-1 text-[11px] font-black text-green-700">
                  ONE-TIME ₹20
                </span>
              </div>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                Pay ₹20 once through UPI. This single Game Pass
                covers every selected game.
              </p>
            </div>

            <div className="mt-7 grid gap-6 lg:grid-cols-[230px_1fr]">

              {/* QR */}
              <div className="rounded-3xl bg-neutral-50 p-5">
                <p className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Scan & Pay
                </p>

                <div className="flex justify-center">
                  {upiLink ? (
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <QRCodeCanvas
                        value={upiLink}
                        size={180}
                        includeMargin
                      />
                    </div>
                  ) : (
                    <div className="flex h-[206px] w-[206px] items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
                      UPI QR unavailable
                    </div>
                  )}
                </div>

                <p className="mt-4 text-center text-xs text-neutral-500">
                  Amount is fixed at ₹20
                </p>
              </div>

              {/* Payment details */}
              <div className="space-y-5">

                <div className="rounded-3xl bg-neutral-950 p-5 text-white sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                    Total to Pay
                  </p>

                  <p className="mt-2 text-5xl font-black">
                    ₹20
                  </p>

                  <p className="mt-2 text-sm leading-6 text-neutral-400">
                    Same price whether you select 1 game or all 9
                    games.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      UPI ID
                    </p>

                    <p className="mt-2 break-all font-black text-neutral-900">
                      {upiId || "Not configured"}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      {upiName}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Selected Games
                    </p>

                    <p className="mt-2 text-2xl font-black text-orange-600">
                      {selectedGames.length}
                    </p>

                    <p className="mt-1 text-xs text-neutral-500">
                      covered by this ₹20 pass
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="utr"
                    className="block text-sm font-bold text-neutral-700"
                  >
                    UTR / Payment Reference
                  </label>

                  <input
                    id="utr"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="Enter UTR after completing payment"
                    autoComplete="off"
                    required
                    className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />

                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    Enter the reference shown by your UPI app after
                    the ₹20 payment.
                  </p>
                </div>

              </div>
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium leading-6 text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <section>
            <button
              type="submit"
              disabled={
                submitting ||
                loadingGames ||
                selectedGames.length === 0
              }
              className="group w-full rounded-2xl bg-orange-600 px-6 py-4 text-lg font-black text-white shadow-xl transition duration-200 hover:bg-orange-700 hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-orange-600 disabled:hover:shadow-xl"
            >
              {submitting ? (
                "Submitting Registration..."
              ) : (
                <>
                  Complete Registration
                  <span className="ml-2 inline-block transition group-hover:translate-x-1">
                    →
                  </span>
                </>
              )}
            </button>

            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4 text-center text-xs leading-5 text-neutral-500">
              Your registration is recorded with the ₹20 Game Pass
              payment reference. The admin will verify the payment
              before approving your game registrations.
            </div>
          </section>

        </form>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fffaf3] px-4 py-12">
          <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
            <div className="rounded-3xl bg-white px-8 py-7 text-center shadow-lg">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

              <p className="mt-4 font-semibold text-neutral-600">
                Loading registration...
              </p>
            </div>
          </div>
        </main>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}