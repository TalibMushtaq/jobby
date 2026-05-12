import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileText,
  ShieldAlert,
  Sparkles,
  UserRound,
} from "lucide-react";

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
  const isProfileComplete =
    Boolean(user.fullName?.trim()) &&
    Boolean(user.education?.trim()) &&
    Boolean(user.experienceLevel) &&
    user.skills.length > 0 &&
    user.preferredJobRoles.length > 0;
  const hasResume = resumes.length > 0;
  const hasAnalysis = analyses.length > 0;
  const completedSteps = [
    isProfileComplete,
    hasResume,
    hasAnalysis,
    hasAnalysis,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="inline-flex items-center gap-2">
            <UserRound className="h-4 w-4 text-primary" />
            Guided Setup Flow
          </CardTitle>
          <CardDescription>
            Login → Complete profile details → Upload resume → Evaluate job details
            → Create custom resume.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {completedSteps}/4 steps completed
          </p>
          <div className="grid gap-2 md:grid-cols-2">
            {[
              {
                label: "Complete profile details",
                done: isProfileComplete,
                href: "/dashboard/settings",
              },
              {
                label: "Upload resume",
                done: hasResume,
                href: "/dashboard/resumes",
              },
              {
                label: "Evaluate job details",
                done: hasAnalysis,
                href: "#evaluate-job",
              },
              {
                label: "Create custom resume",
                done: hasAnalysis,
                href: hasAnalysis
                  ? `/dashboard/analysis/${latestAnalysis?.id}`
                  : "#custom-resume",
              },
            ].map((step) => (
              <Link
                key={step.label}
                href={step.href}
                className="inline-flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <span className="inline-flex items-center gap-2">
                  {step.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  {step.label}
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">1. Complete Profile Details</CardTitle>
            <CardDescription>
              Add your skills, education, and target roles to improve evaluation quality.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
            >
              Open Profile Settings <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">2. Add Resume</CardTitle>
            <CardDescription>
              Upload at least one resume so evaluation can run with your real profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/resumes"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
            >
              Open Resume Library <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ATS Match Score</CardDescription>
            <CardTitle className="text-3xl">{latestAnalysis?.atsScore ?? "--"}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
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
          <CardContent className="text-xs text-muted-foreground">
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
        <Card id="evaluate-job" className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              3. Evaluate Job
            </CardTitle>
            <CardDescription>
              Add job details to evaluate fit, risk, and interview probability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resumes.length === 0 ? (
              <div className="space-y-3 rounded-lg border border-dashed border-border p-4 text-sm">
                <p className="text-muted-foreground">Upload a resume once, then run repeated analyses instantly.</p>
                <Link
                  href="/dashboard/resumes"
                  className="inline-flex items-center gap-2 text-primary hover:opacity-80"
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
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground"
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
                    className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground"
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
        <Card id="custom-resume" className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              4. Create Custom Resume
            </CardTitle>
            <CardDescription>
              Generate and export role-specific optimized resumes after evaluation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestAnalysis ? (
              <>
                <div className="rounded-lg border border-border p-4 text-sm">
                  <p className="mb-2 font-medium text-foreground">
                    Latest evaluated role
                  </p>
                  <p className="text-muted-foreground">
                    {latestAnalysis.jobTitle || "Untitled role analysis"} • ATS{" "}
                    {latestAnalysis.atsScore}
                  </p>
                </div>
                {latestAnalysis.missingSkills.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Missing skills</p>
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
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Matched keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {latestAnalysis.keywordMatches.slice(0, 8).map((keyword) => (
                      <Badge key={keyword} variant="success">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4 text-sm">
                  <p className="mb-2 font-medium text-foreground">Scam/Ghost snapshot</p>
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
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
                >
                  Open custom resume and explainability <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-5 text-sm text-muted-foreground">
                Run your first job evaluation to unlock custom resume generation.
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
            <FileText className="h-4 w-4 text-primary" />
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
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {analysis.jobTitle || "Untitled role analysis"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Resume: {analysis.resume.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge>{analysis.atsScore}</Badge>
                    <Badge variant="secondary">{analysis.interviewProbability}</Badge>
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Analysis history appears here once you run an evaluation.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
