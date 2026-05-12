import "server-only";

import type { AiEnhancement, DeterministicAnalysis } from "@/types/analysis";

import { env } from "@/lib/env";

const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_FALLBACK_MODELS = [
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",
] as const;
const MAX_ATTEMPTS_PER_MODEL = 2;

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const aiResponseSchema = {
  summary: "string",
  resumeSuggestions: "string[]",
  optimizedResume: "string",
  explainabilityNotes: "string[]",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uniqueModels(models: readonly string[]) {
  return [...new Set(models.map((model) => model.trim()).filter(Boolean))];
}

function formatOpenRouterErrorBody(body: string) {
  return body.replace(/\s+/g, " ").trim().slice(0, 220);
}

function extractJson(content: string) {
  const fencedMatch = content.match(/```json\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1];
  }

  const objectMatch = content.match(/\{[\s\S]*\}/);
  if (objectMatch?.[0]) {
    return objectMatch[0];
  }

  return content;
}

function fallbackAiEnhancement(deterministic: DeterministicAnalysis): AiEnhancement {
  return {
    summary:
      "Local analytics completed. AI explanation fallback was used due to upstream model limitations.",
    resumeSuggestions: deterministic.suggestions,
    optimizedResume:
      "## Optimized Resume Summary\n\n- Highlight quantified impact for your most relevant projects.\n- Bring matched skills closer to the top summary section.\n- Add keywords from the job description naturally across achievements.",
    explainabilityNotes: deterministic.explainability
      .slice(0, 4)
      .map((entry) => `${entry.label} (${entry.impact > 0 ? "+" : ""}${entry.impact})`),
  };
}

export async function requestOpenRouterEnhancement(input: {
  resumeText: string;
  jobDescription: string;
  deterministic: DeterministicAnalysis;
}) {
  const prompt = `
You are an AI hiring intelligence analyst.
Return STRICT JSON only. No markdown.

JSON shape:
${JSON.stringify(aiResponseSchema)}

Context:
- Deterministic ATS score: ${input.deterministic.atsScore}
- Interview probability: ${input.deterministic.interviewProbability}
- Scam risk: ${input.deterministic.scamRisk} (${input.deterministic.scamRiskScore})
- Ghost job risk: ${input.deterministic.ghostJobRisk} (${input.deterministic.ghostJobRiskScore})
- Missing skills: ${input.deterministic.missingSkills.join(", ") || "none"}
- Matched skills: ${input.deterministic.matchedSkills.join(", ") || "none"}
- Suggestions so far: ${input.deterministic.suggestions.join(" | ") || "none"}

Job Description:
${input.jobDescription.slice(0, 6000)}

Resume:
${input.resumeText.slice(0, 8000)}

Requirements:
- Keep recommendations realistic and specific.
- Explain major drivers behind ATS and interview outcome.
- Build an optimized resume section with summary + bullet points.
`;

  let lastError: string | null = null;
  const modelCandidates = uniqueModels([
    env.OPENROUTER_MODEL,
    ...OPENROUTER_FALLBACK_MODELS,
  ]);

  for (const model of modelCandidates) {
    for (let attempt = 0; attempt < MAX_ATTEMPTS_PER_MODEL; attempt += 1) {
      const response = await fetch(OPENROUTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://jobby.local",
          "X-Title": "Jobby Hiring Intelligence",
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You return valid JSON only. Do not include markdown fences or extra keys.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
        }),
        cache: "no-store",
      });

      if (response.status === 429 || response.status >= 500) {
        lastError = `OpenRouter temporary error (${response.status}) for model "${model}"`;
        await sleep((attempt + 1) * 1200);
        continue;
      }

      if (!response.ok) {
        const errorBody = formatOpenRouterErrorBody(await response.text());
        lastError =
          `OpenRouter error (${response.status}) for model "${model}"` +
          (errorBody ? `: ${errorBody}` : "");

        if (response.status === 401 || response.status === 403) {
          if (process.env.NODE_ENV === "development") {
            console.warn(lastError);
          }
          return fallbackAiEnhancement(input.deterministic);
        }

        break;
      }

      const payload = (await response.json()) as OpenRouterResponse;
      const content = payload.choices?.[0]?.message?.content;

      if (!content) {
        lastError = `OpenRouter response did not include content for model "${model}".`;
        await sleep((attempt + 1) * 800);
        continue;
      }

      try {
        const parsed = JSON.parse(extractJson(content)) as Partial<AiEnhancement>;
        if (
          typeof parsed.summary === "string" &&
          Array.isArray(parsed.resumeSuggestions) &&
          typeof parsed.optimizedResume === "string" &&
          Array.isArray(parsed.explainabilityNotes)
        ) {
          return parsed as AiEnhancement;
        }
      } catch {
        lastError = `Failed to parse OpenRouter JSON response for model "${model}".`;
        await sleep((attempt + 1) * 800);
      }
    }
  }

  if (lastError && process.env.NODE_ENV === "development") {
    console.warn(lastError);
  }

  return fallbackAiEnhancement(input.deterministic);
}
