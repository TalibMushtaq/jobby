import { NextResponse } from "next/server";

import { syncCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ analysisId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const user = await syncCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { analysisId } = await context.params;
  const analysis = await prisma.analysis.findFirst({
    where: { id: analysisId, userId: user.id },
    include: {
      resume: {
        select: { title: true },
      },
      optimizedResumes: {
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const body = {
    id: analysis.id,
    jobTitle: analysis.jobTitle,
    atsScore: analysis.atsScore,
    interviewProbability: analysis.interviewProbability,
    scamRisk: {
      level: analysis.scamRisk,
      score: analysis.scamRiskScore,
    },
    ghostJobRisk: {
      level: analysis.ghostJobRisk,
      score: analysis.ghostJobRiskScore,
    },
    resumeQualityScore: analysis.resumeQualityScore,
    scores: {
      skills: analysis.skillMatchScore,
      keywords: analysis.keywordCoverageScore,
      experience: analysis.experienceMatchScore,
      education: analysis.educationMatchScore,
      semanticSimilarity: analysis.semanticSimilarity,
    },
    keywordMatches: analysis.keywordMatches,
    missingSkills: analysis.missingSkills,
    suggestions: analysis.suggestions,
    explainability: analysis.explainability,
    aiReasoning: analysis.aiReasoning,
    optimizedResume: analysis.optimizedResumes[0]?.content ?? null,
    createdAt: analysis.createdAt,
    resumeTitle: analysis.resume.title,
  };

  return new NextResponse(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="analysis-${analysis.id}.json"`,
    },
  });
}
