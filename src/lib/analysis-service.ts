import "server-only";

import type { AiEnhancement } from "@/types/analysis";
import { enforceAiRateLimit } from "@/lib/rate-limit";
import { requestOpenRouterEnhancement } from "@/lib/openrouter";
import { runDeterministicAnalysis } from "@/lib/scoring";

export async function runAnalysisPipeline(input: {
  userId: string;
  resumeText: string;
  jobDescription: string;
  userSkills?: string[];
}) {
  const deterministic = runDeterministicAnalysis({
    resumeText: input.resumeText,
    jobDescription: input.jobDescription,
    userSkills: input.userSkills,
  });

  await enforceAiRateLimit(input.userId, "analysis");
  const aiEnhancement: AiEnhancement = await requestOpenRouterEnhancement({
    resumeText: input.resumeText,
    jobDescription: input.jobDescription,
    deterministic,
  });

  return {
    deterministic,
    aiEnhancement,
  };
}
