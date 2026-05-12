import { notFound } from "next/navigation";
import Link from "next/link";

import { OptimizedActions } from "@/components/dashboard/optimized-actions";
import { RiskBadge } from "@/components/dashboard/risk-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ExplainabilityContribution } from "@/types/analysis";

type AnalysisDetailPageProps = {
  params: Promise<{
    analysisId: string;
  }>;
};

function valueBar(value: number, colorClass: string) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
      <div className={`h-full ${colorClass}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export default async function AnalysisDetailPage({ params }: AnalysisDetailPageProps) {
  const { analysisId } = await params;
  const user = await requireDbUser();
  const analysis = await prisma.analysis.findFirst({
    where: {
      id: analysisId,
      userId: user.id,
    },
    include: {
      resume: true,
      optimizedResumes: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!analysis) {
    notFound();
  }

  const latestOptimized = analysis.optimizedResumes[0] ?? null;
  const explainability = Array.isArray(analysis.explainability)
    ? (analysis.explainability as unknown as ExplainabilityContribution[])
    : [];
  const aiReasoning = (analysis.aiReasoning ?? null) as
    | { summary?: string; notes?: string[] }
    | null;
  const scamGhostContributions = explainability
    .filter((entry) => entry.category === "scam" || entry.category === "ghost")
    .slice(0, 8);
  const skillHeatmap = [
    { label: "Required skills", value: analysis.missingSkills.length + analysis.keywordMatches.length },
    { label: "Matched skills", value: analysis.keywordMatches.length },
    { label: "Missing skills", value: analysis.missingSkills.length },
  ];

  const breakdown = [
    { label: "Skills", value: analysis.skillMatchScore, color: "bg-sky-500" },
    {
      label: "Keywords",
      value: analysis.keywordCoverageScore,
      color: "bg-cyan-500",
    },
    {
      label: "Experience",
      value: analysis.experienceMatchScore,
      color: "bg-emerald-500",
    },
    {
      label: "Education",
      value: analysis.educationMatchScore,
      color: "bg-violet-500",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{analysis.jobTitle || "Role Analysis Result"}</CardTitle>
          <CardDescription>
            Resume: {analysis.resume.title} • ATS {analysis.atsScore} • Interview{" "}
            {analysis.interviewProbability}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs uppercase tracking-wide text-zinc-500">ATS Score</p>
            <p className="text-3xl font-semibold">{analysis.atsScore}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Interview</p>
            <p className="text-3xl font-semibold">{analysis.interviewProbability}</p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Scam Risk</p>
            <p className="mb-2 text-3xl font-semibold">{analysis.scamRiskScore}%</p>
            <RiskBadge level={analysis.scamRisk} />
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Ghost Job Risk</p>
            <p className="mb-2 text-3xl font-semibold">{analysis.ghostJobRiskScore}%</p>
            <RiskBadge level={analysis.ghostJobRisk} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>ATS Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {breakdown.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p>{item.label}</p>
                  <p className="font-medium">{item.value}%</p>
                </div>
                {valueBar(item.value, item.color)}
              </div>
            ))}
            <Separator />
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Matched keywords</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywordMatches.slice(0, 12).map((keyword: string) => (
                    <Badge key={keyword} variant="success">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Skill gaps</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.slice(0, 12).map((skill: string) => (
                    <Badge key={skill} variant="warning">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Explainability Panel</CardTitle>
            <CardDescription>SHAP-style contribution reasoning</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {explainability.length > 0 ? (
              explainability.slice(0, 12).map((entry, index) => (
                <div
                  key={`${entry.label}-${index}`}
                  className="rounded-md border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                >
                  <p>{entry.label}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Explainability data unavailable for this analysis.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Skill Match Heatmap</CardTitle>
            <CardDescription>Required vs matched vs missing coverage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {skillHeatmap.map((item) => {
              const maxValue = Math.max(...skillHeatmap.map((point) => point.value), 1);
              const intensity = Math.max(12, Math.round((item.value / maxValue) * 100));
              const colorClass =
                item.label === "Missing skills"
                  ? "bg-red-500/20 border-red-400/40"
                  : item.label === "Matched skills"
                    ? "bg-emerald-500/20 border-emerald-400/40"
                    : "bg-sky-500/20 border-sky-400/40";
              return (
                <div
                  key={item.label}
                  className={`rounded-md border p-3 ${colorClass}`}
                  style={{ opacity: intensity / 100 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <p>{item.label}</p>
                    <p className="font-semibold">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Scam & Ghost Risk Contributions</CardTitle>
            <CardDescription>
              Rule-based contribution graph for suspicious job-post signals
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {scamGhostContributions.length > 0 ? (
              scamGhostContributions.map((entry, index) => {
                const width = Math.min(100, Math.max(8, entry.impact * 2.4));
                const colorClass =
                  entry.category === "scam" ? "bg-red-500" : "bg-amber-500";
                return (
                  <div key={`${entry.label}-${index}`} className="space-y-1">
                    <p className="text-sm">{entry.label}</p>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                      <div
                        className={`h-full ${colorClass}`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No elevated scam or ghost-job signals found in this posting.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Optimization Output</CardTitle>
          <CardDescription>
            Generated using OpenRouter ({process.env.OPENROUTER_MODEL || "openai/gpt-oss-20b:free"}).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {aiReasoning?.summary ? (
            <div className="rounded-md border border-zinc-200 p-4 text-sm dark:border-zinc-800">
              {aiReasoning.summary}
            </div>
          ) : null}
          <div>
            <p className="mb-2 text-sm font-medium">Personalized suggestions</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-zinc-700 dark:text-zinc-300">
              {analysis.suggestions.map((suggestion: string, index) => (
                <li key={`${analysis.id}-suggestion-${index}`}>{suggestion}</li>
              ))}
            </ul>
          </div>
          {latestOptimized ? (
            <div className="space-y-3">
              <Link
                href={`/api/analysis/${analysis.id}/export`}
                className="inline-flex items-center rounded-md border border-zinc-300 px-3 py-2 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                Export full report (JSON)
              </Link>
              <OptimizedActions content={latestOptimized.content} fileName={analysis.resume.title} />
              <pre className="max-h-[420px] overflow-auto rounded-md border border-zinc-200 bg-zinc-50 p-4 text-xs whitespace-pre-wrap dark:border-zinc-800 dark:bg-zinc-900">
                {latestOptimized.content}
              </pre>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Optimized resume content not found for this analysis.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
