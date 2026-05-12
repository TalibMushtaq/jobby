import Link from "next/link";
import { BrainCircuit, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <main className="dashboard-gradient flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-5xl rounded-3xl border border-zinc-200/80 bg-white/90 p-8 shadow-xl backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 md:p-12">
        <div className="space-y-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300">
            <Sparkles className="h-3.5 w-3.5" /> AI Hiring Intelligence
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
            Jobby turns resumes and job posts into explainable hiring analytics.
          </h1>
          <p className="max-w-2xl text-zinc-600 dark:text-zinc-300">
            Analyze ATS fit, interview probability, scam and ghost-job risk, and
            skill gaps with deterministic scoring plus AI reasoning.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { icon: BrainCircuit, label: "ATS + NLP Engine" },
            { icon: TrendingUp, label: "ML-style Dashboards" },
            { icon: ShieldCheck, label: "Scam/Ghost Risk Logic" },
            { icon: Sparkles, label: "OpenRouter Optimization" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/70"
            >
              <item.icon className="mb-3 h-5 w-5 text-sky-600 dark:text-sky-400" />
              <p className="text-sm font-medium">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/sign-up"
            className="rounded-md bg-sky-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-500"
          >
            Start free
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
          >
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
