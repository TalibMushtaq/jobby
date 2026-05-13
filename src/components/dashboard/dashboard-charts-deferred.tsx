"use client";

import { useEffect, useState } from "react";

import { DashboardCharts } from "@/components/dashboard/charts";

type DashboardChartsDeferredProps = React.ComponentProps<typeof DashboardCharts>;

export function DashboardChartsDeferred(props: DashboardChartsDeferredProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white/70 p-4 text-sm text-muted-foreground dark:border-zinc-800 dark:bg-zinc-900/60">
        Loading dashboard charts...
      </div>
    );
  }

  return <DashboardCharts {...props} />;
}
