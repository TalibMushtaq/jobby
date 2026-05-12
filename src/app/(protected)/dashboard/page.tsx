import Link from "next/link";
import { ArrowRight, FileText, ShieldAlert, Sparkles, Target } from "lucide-react";

import { runQuickAnalysisAction } from "@/actions/analysis";
import { SubmitButton } from "@/components/form/submit-button";
import { DashboardCharts } from "@/components/dashboard/charts";
import { RiskBadge } from "@/components/dashboard/risk-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { requireDbUser } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  const user = await requireDbUser();
  const {
    resumes,
    analyses,
    latestAnalysis,
    trendData,
    skillTrendData,
    atsBreakdownData,
    skillRadarData,
  } = await getDashboardData(user.id);
  const defaultResume = resumes.find((resume) => resume.isDefault) ?? resumes[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ATS Match Score</CardDescription>
            <CardTitle className="text-3xl">{latestAnalysis?.atsScore ?? "--"}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-zinc-500 dark:text-zinc-400">
            Weighted by skills, keywords, experience, and education.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Interview Probability</CardDescription>
            <CardTitle className="text-3xl">
              {latestAnalysis?.interviewProbability ?? "--"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-zinc-500 dark:text-zinc-400">
            Computed from ATS strength, relevance, and resume completeness.
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Scam Risk</CardDescription>
            <CardTitle className="text-3xl">
              {latestAnalysis ? `${latestAnalysis.scamRiskScore}%` : "--"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestAnalysis ? <RiskBadge level={latestAnalysis.scamRisk} /> : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ghost Job Risk</CardDescription>
            <CardTitle className="text-3xl">
              {latestAnalysis ? `${latestAnalysis.ghostJobRiskScore}%` : "--"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {latestAnalysis ? <RiskBadge level={latestAnalysis.ghostJobRisk} /> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-500" />
              Quick Analysis
            </CardTitle>
            <CardDescription>
              One-click pipeline using your default resume and job description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resumes.length === 0 ? (
              <div className="space-y-3 rounded-lg border border-dashed border-zinc-300 p-4 text-sm dark:border-zinc-700">
                <p>Upload a resume once, then run repeated analyses instantly.</p>
                <Link
                  href="/dashboard/resumes"
                  className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-500"
                >
                  Go to Resume Library <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <form action={runQuickAnalysisAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resumeId">Resume</Label>
                  <select
                    id="resumeId"
                    name="resumeId"
                    defaultValue={defaultResume?.id}
                    className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.title}
                        {resume.isDefault ? " (Default)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title (optional)</Label>
                  <input
                    id="jobTitle"
                    name="jobTitle"
                    placeholder="Senior Frontend Engineer"
                    className="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    name="jobDescription"
                    placeholder="Paste the full job description to compute ATS fit, risk scores, and optimization suggestions."
                    required
                  />
                </div>
                <SubmitButton className="w-full" pendingText="Running full analysis...">
                  Analyze Now
                </SubmitButton>
              </form>
            )}
          </CardContent>
        </Card>
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Target className="h-4 w-4 text-sky-500" />
              Latest Explainability Signals
            </CardTitle>
            <CardDescription>
              Feature contribution view for ATS and risk behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestAnalysis ? (
              <>
                {latestAnalysis.missingSkills.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-zinc-500">Missing skills</p>
                    <div className="flex flex-wrap gap-2">
                      {latestAnalysis.missingSkills.slice(0, 8).map((skill) => (
                        <Badge key={skill} variant="warning">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Matched keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {latestAnalysis.keywordMatches.slice(0, 8).map((keyword) => (
                      <Badge key={keyword} variant="success">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-200 p-4 text-sm dark:border-zinc-800">
                  <p className="mb-2 font-medium">Scam/Ghost snapshot</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="danger">Scam {latestAnalysis.scamRiskScore}%</Badge>
                    <Badge variant="warning">Ghost {latestAnalysis.ghostJobRiskScore}%</Badge>
                    <Badge variant="secondary">
                      Quality {latestAnalysis.resumeQualityScore}%
                    </Badge>
                  </div>
                </div>
                <Link
                  href={`/dashboard/analysis/${latestAnalysis.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-sky-600 hover:text-sky-500"
                >
                  Open full explainability report <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-zinc-300 p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                No analysis history yet. Run your first quick analysis to generate
                ATS trend and explainability insights.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DashboardCharts
        trendData={trendData}
        skillTrendData={skillTrendData}
        atsBreakdownData={atsBreakdownData}
        skillRadarData={skillRadarData}
      />

      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <FileText className="h-4 w-4 text-sky-500" />
            Recent Analyses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analyses.length > 0 ? (
            <div className="space-y-2">
              {analyses.slice(0, 5).map((analysis) => (
                <Link
                  key={analysis.id}
                  href={`/dashboard/analysis/${analysis.id}`}
                  className="flex items-center justify-between rounded-md border border-zinc-200 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {analysis.jobTitle || "Untitled role analysis"}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Resume: {analysis.resume.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge>{analysis.atsScore}</Badge>
                    <Badge variant="secondary">{analysis.interviewProbability}</Badge>
                    <ShieldAlert className="h-4 w-4 text-zinc-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Analysis history appears here once you run an evaluation.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
