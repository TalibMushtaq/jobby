"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">
      <h2 className="mb-2 text-lg font-semibold">Dashboard failed to load</h2>
      <p className="mb-4 text-sm text-red-700 dark:text-red-300">
        {error.message || "Unexpected error"}
      </p>
      <Button onClick={reset} variant="destructive">
        Try again
      </Button>
    </div>
  );
}
