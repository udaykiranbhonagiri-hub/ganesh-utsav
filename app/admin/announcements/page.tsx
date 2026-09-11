import { Suspense } from "react";

import AnnouncementsClient from "./AnnouncementsClient";

export const instant = false;

export default function AdminAnnouncementsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-orange-50">
          <p className="text-gray-600">Loading...</p>
        </main>
      }
    >
      <AnnouncementsClient />
    </Suspense>
  );
}