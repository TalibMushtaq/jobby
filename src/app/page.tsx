import Link from "next/link";
import { BrainCircuit, ShieldCheck, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <BrainCircuit className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Jobby</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">AI-Powered Career Intelligence</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            Analyze Your Career With AI Precision
          </h1>

          {/* Subheading */}
          <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Get deep insights into your resume, interview chances, and job compatibility. Understand risk factors like scams and ghost positions with explainable AI reasoning.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:opacity-90"
            >
              Get Started for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
            >
              View Dashboard
            </Link>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BrainCircuit,
                label: "ATS Analysis",
                description: "Advanced scanning for applicant tracking system compatibility"
              },
              {
                icon: TrendingUp,
                label: "Success Metrics",
                description: "Predictive scoring for interview likelihood and job fit"
              },
              {
                icon: ShieldCheck,
                label: "Risk Detection",
                description: "Identify scams, ghost positions, and red flags instantly"
              },
              {
                icon: Sparkles,
                label: "AI Reasoning",
                description: "Understand every insight with transparent AI explanations"
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary hover:shadow-md"
              >
                <item.icon className="mb-4 h-6 w-6 text-primary" />
                <h3 className="mb-2 font-semibold text-foreground">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-16 grid gap-8 border-t border-border pt-12 md:grid-cols-3">
            {[
              { value: "10K+", label: "Careers Analyzed" },
              { value: "98%", label: "Accuracy Rate" },
              { value: "24/7", label: "AI Support" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary md:text-4xl">{stat.value}</p>
                <p className="mt-2 text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 Jobby. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
