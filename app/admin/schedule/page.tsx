import { Suspense } from "react";

import ScheduleClient from "./ScheduleClient";

export const instant = false;

export default function AdminSchedulePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-orange-50">
          <p className="text-gray-600">Loading...</p>
        </main>
      }
    >
      <ScheduleClient />
    </Suspense>
  );
}