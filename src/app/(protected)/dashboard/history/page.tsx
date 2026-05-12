import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { RiskBadge } from "@/components/dashboard/risk-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AnalysisHistoryPage() {
  const user = await requireDbUser();
  const analyses = await prisma.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      resume: {
        select: { title: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>
            Track ATS progression, risk trend, and improvement across all past evaluations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {analyses.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full min-w-[840px] text-sm">
                <thead className="bg-zinc-100/80 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Resume</th>
                    <th className="px-4 py-3">ATS</th>
                    <th className="px-4 py-3">Interview</th>
                    <th className="px-4 py-3">Scam Risk</th>
                    <th className="px-4 py-3">Ghost Risk</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((analysis) => (
                    <tr
                      key={analysis.id}
                      className="border-t border-zinc-200 dark:border-zinc-800"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/analysis/${analysis.id}`}
                          className="font-medium text-sky-600 hover:text-sky-500"
                        >
                          {analysis.jobTitle || "Untitled role"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                        {analysis.resume.title}
                      </td>
                      <td className="px-4 py-3">
                        <Badge>{analysis.atsScore}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{analysis.interviewProbability}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2">
                          <RiskBadge level={analysis.scamRisk} />
                          <span className="text-xs text-zinc-500">
                            {analysis.scamRiskScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="inline-flex items-center gap-2">
                          <RiskBadge level={analysis.ghostJobRisk} />
                          <span className="text-xs text-zinc-500">
                            {analysis.ghostJobRiskScore}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDistanceToNow(analysis.createdAt, {
                          addSuffix: true,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No analyses yet. Run a quick analysis from dashboard overview.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
