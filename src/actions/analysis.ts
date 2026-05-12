"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireDbUser } from "@/lib/auth";
import { runAnalysisPipeline } from "@/lib/analysis-service";
import { prisma } from "@/lib/prisma";

const quickAnalysisSchema = z.object({
  resumeId: z.string().optional(),
  jobDescription: z.string().min(60).max(16000),
  jobTitle: z.string().max(180).optional(),
});

export async function runQuickAnalysisAction(formData: FormData) {
  const user = await requireDbUser();
  const payload = quickAnalysisSchema.parse({
    resumeId: String(formData.get("resumeId") ?? "") || undefined,
    jobDescription: String(formData.get("jobDescription") ?? ""),
    jobTitle: String(formData.get("jobTitle") ?? "") || undefined,
  });

  const resume =
    (payload.resumeId
      ? await prisma.resume.findFirst({
          where: {
            id: payload.resumeId,
            userId: user.id,
          },
        })
      : null) ??
    (await prisma.resume.findFirst({
      where: {
        userId: user.id,
        isDefault: true,
      },
    })) ??
    (await prisma.resume.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
    }));

  if (!resume) {
    throw new Error("Upload a resume before running an analysis.");
  }

  const { deterministic, aiEnhancement } = await runAnalysisPipeline({
    userId: user.id,
    resumeText: resume.extractedText,
    jobDescription: payload.jobDescription,
    userSkills: user.skills,
  });

  const analysis = await prisma.analysis.create({
    data: {
      userId: user.id,
      resumeId: resume.id,
      jobDescription: payload.jobDescription,
      jobTitle: payload.jobTitle,
      atsScore: deterministic.atsScore,
      interviewProbability: deterministic.interviewProbability,
      scamRisk: deterministic.scamRisk,
      scamRiskScore: deterministic.scamRiskScore,
      ghostJobRisk: deterministic.ghostJobRisk,
      ghostJobRiskScore: deterministic.ghostJobRiskScore,
      resumeQualityScore: deterministic.resumeQualityScore,
      skillMatchScore: deterministic.atsBreakdown.skillMatch,
      keywordCoverageScore: deterministic.atsBreakdown.keywordCoverage,
      experienceMatchScore: deterministic.atsBreakdown.experienceMatch,
      educationMatchScore: deterministic.atsBreakdown.educationMatch,
      semanticSimilarity: deterministic.semanticSimilarity,
      keywordMatches: deterministic.keywordMatches,
      missingSkills: deterministic.missingSkills,
      suggestions: [
        ...new Set([
          ...deterministic.suggestions,
          ...aiEnhancement.resumeSuggestions,
        ]),
      ].slice(0, 14),
      explainability: deterministic.explainability,
      aiReasoning: {
        summary: aiEnhancement.summary,
        notes: aiEnhancement.explainabilityNotes,
      },
    },
  });

  await prisma.optimizedResume.create({
    data: {
      userId: user.id,
      resumeId: resume.id,
      analysisId: analysis.id,
      content: aiEnhancement.optimizedResume,
      version: 1,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/history");
  redirect(`/dashboard/analysis/${analysis.id}`);
}
