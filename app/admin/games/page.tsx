import { Suspense } from "react";

import GamesClient from "./GamesClient";

export const instant = false;

export default function AdminGamesPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-orange-50">
          <p className="text-gray-600">Loading...</p>
        </main>
      }
    >
      <GamesClient />
    </Suspense>
  );
}