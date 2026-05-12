import "server-only";

import { format } from "date-fns";

import { prisma } from "@/lib/prisma";

function toInterviewPercent(level: "LOW" | "MEDIUM" | "HIGH") {
  if (level === "HIGH") {
    return 85;
  }
  if (level === "MEDIUM") {
    return 58;
  }
  return 32;
}

export async function getDashboardData(userId: string) {
  const [resumes, analyses] = await Promise.all([
    prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        isDefault: true,
      },
    }),
    prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        createdAt: true,
        jobTitle: true,
        atsScore: true,
        interviewProbability: true,
        scamRisk: true,
        scamRiskScore: true,
        ghostJobRisk: true,
        ghostJobRiskScore: true,
        resumeQualityScore: true,
        skillMatchScore: true,
        keywordCoverageScore: true,
        experienceMatchScore: true,
        educationMatchScore: true,
        missingSkills: true,
        keywordMatches: true,
        resume: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
  ]);

  const latestAnalysis = analyses[0] ?? null;
  const trendData = analyses
    .slice(0, 12)
    .reverse()
    .map((analysis) => ({
      date: format(analysis.createdAt, "MMM d"),
      ats: analysis.atsScore,
      interview: toInterviewPercent(analysis.interviewProbability),
      scam: analysis.scamRiskScore,
      ghost: analysis.ghostJobRiskScore,
    }));

  const skillTrendData = analyses
    .slice(0, 12)
    .reverse()
    .map((analysis) => ({
      date: format(analysis.createdAt, "MMM d"),
      skills: analysis.skillMatchScore,
      keywords: analysis.keywordCoverageScore,
      success: toInterviewPercent(analysis.interviewProbability),
    }));

  const atsBreakdownData = latestAnalysis
    ? [
        { metric: "Skills", score: latestAnalysis.skillMatchScore },
        { metric: "Keywords", score: latestAnalysis.keywordCoverageScore },
        { metric: "Experience", score: latestAnalysis.experienceMatchScore },
        { metric: "Education", score: latestAnalysis.educationMatchScore },
      ]
    : [
        { metric: "Skills", score: 0 },
        { metric: "Keywords", score: 0 },
        { metric: "Experience", score: 0 },
        { metric: "Education", score: 0 },
      ];

  const skillRadarData = latestAnalysis
    ? [
        { skill: "Skills", matched: latestAnalysis.skillMatchScore },
        { skill: "Keywords", matched: latestAnalysis.keywordCoverageScore },
        { skill: "Experience", matched: latestAnalysis.experienceMatchScore },
        { skill: "Education", matched: latestAnalysis.educationMatchScore },
        { skill: "Quality", matched: latestAnalysis.resumeQualityScore },
      ]
    : [
        { skill: "Skills", matched: 0 },
        { skill: "Keywords", matched: 0 },
        { skill: "Experience", matched: 0 },
        { skill: "Education", matched: 0 },
        { skill: "Quality", matched: 0 },
      ];

  return {
    resumes,
    analyses,
    latestAnalysis,
    trendData,
    skillTrendData,
    atsBreakdownData,
    skillRadarData,
  };
}
