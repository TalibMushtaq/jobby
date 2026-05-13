import compromise from "compromise";
import { TfIdf } from "natural/lib/natural/tfidf";
import { WordTokenizer } from "natural/lib/natural/tokenizers";
import { stopwords } from "natural/lib/natural/util";

import type {
  DeterministicAnalysis,
  ExplainabilityContribution,
  InterviewProbability,
  RiskLevel,
} from "@/types/analysis";
import { clamp, toTitleCase } from "@/lib/utils";

const tokenizer = new WordTokenizer();
const stopWords = new Set(stopwords);

const SKILL_LEXICON = [
  "react",
  "next.js",
  "typescript",
  "javascript",
  "node.js",
  "python",
  "java",
  "sql",
  "postgresql",
  "mongodb",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "tensorflow",
  "pytorch",
  "machine learning",
  "nlp",
  "tailwind",
  "prisma",
  "redis",
  "graphql",
  "rest api",
  "git",
  "ci/cd",
  "microservices",
  "leadership",
  "communication",
  "problem solving",
];

const EDUCATION_KEYWORDS = [
  "bachelor",
  "master",
  "phd",
  "b.tech",
  "b.e.",
  "computer science",
  "engineering",
  "information technology",
  "degree",
];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9+\s./-]/g, " ");
}

function tokenize(text: string) {
  return tokenizer
    .tokenize(normalize(text))
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length > 1 &&
        !stopWords.has(token) &&
        !/^\d+$/.test(token) &&
        token !== "https" &&
        token !== "http",
    );
}

function termFrequency(tokens: string[]) {
  return tokens.reduce<Record<string, number>>((acc, token) => {
    acc[token] = (acc[token] ?? 0) + 1;
    return acc;
  }, {});
}

function cosineSimilarity(a: Record<string, number>, b: Record<string, number>) {
  const terms = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const term of terms) {
    const av = a[term] ?? 0;
    const bv = b[term] ?? 0;
    dot += av * bv;
    magA += av * av;
    magB += bv * bv;
  }

  if (magA === 0 || magB === 0) {
    return 0;
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function extractSkillsFromText(text: string) {
  const normalized = normalize(text);
  const lexiconMatches = SKILL_LEXICON.filter((skill) =>
    normalized.includes(skill.toLowerCase()),
  );

  const nounPhrases = (compromise(text).nouns().out("array") as string[])
    .map((token) => normalize(token))
    .map((token) => token.trim())
    .filter((token) => token.length > 2);

  const skillCandidates = [...lexiconMatches, ...nounPhrases].map((skill) =>
    skill.toLowerCase(),
  );

  return [...new Set(skillCandidates)].slice(0, 40);
}

function extractTopKeywords(resumeText: string, jobText: string, limit = 25) {
  const tfidf = new TfIdf();
  tfidf.addDocument(tokenize(resumeText));
  tfidf.addDocument(tokenize(jobText));

  return tfidf
    .listTerms(1)
    .slice(0, limit)
    .map((entry) => entry.term)
    .filter((term) => term.length > 2);
}

function extractYears(text: string) {
  const matches = [...text.toLowerCase().matchAll(/(\d+)\+?\s*(?:years|yrs)/g)];
  if (matches.length === 0) {
    return 0;
  }

  return Math.max(...matches.map((match) => Number(match[1] ?? 0)));
}

function getEducationMatchScore(resumeText: string, jobText: string) {
  const jobKeywords = EDUCATION_KEYWORDS.filter((keyword) =>
    jobText.toLowerCase().includes(keyword),
  );
  if (jobKeywords.length === 0) {
    return 80;
  }

  const matched = jobKeywords.filter((keyword) =>
    resumeText.toLowerCase().includes(keyword),
  );

  return Math.round((matched.length / jobKeywords.length) * 100);
}

function getInterviewProbability(
  atsScore: number,
  experienceMatchScore: number,
  resumeQualityScore: number,
): InterviewProbability {
  if (
    atsScore >= 75 &&
    experienceMatchScore >= 65 &&
    resumeQualityScore >= 70
  ) {
    return "HIGH";
  }
  if (
    atsScore >= 50 &&
    experienceMatchScore >= 45 &&
    resumeQualityScore >= 45
  ) {
    return "MEDIUM";
  }
  return "LOW";
}

function toRiskLevel(value: number): RiskLevel {
  if (value >= 67) {
    return "HIGH";
  }
  if (value >= 34) {
    return "MEDIUM";
  }
  return "LOW";
}

function buildSuggestions(input: {
  missingSkills: string[];
  keywordGap: string[];
  experienceMatchScore: number;
  educationMatchScore: number;
}) {
  const suggestions: string[] = [];

  if (input.missingSkills.length > 0) {
    suggestions.push(
      `Add measurable project bullets proving ${input.missingSkills
        .slice(0, 5)
        .map(toTitleCase)
        .join(", ")}.`,
    );
  }

  if (input.keywordGap.length > 0) {
    suggestions.push(
      `Improve keyword coverage for ${input.keywordGap
        .slice(0, 5)
        .map(toTitleCase)
        .join(", ")} in relevant sections.`,
    );
  }

  if (input.experienceMatchScore < 55) {
    suggestions.push(
      "Highlight role-specific ownership and quantified outcomes to improve experience alignment.",
    );
  }

  if (input.educationMatchScore < 55) {
    suggestions.push(
      "Surface certifications, coursework, or domain credentials aligned to the target role.",
    );
  }

  return suggestions.slice(0, 8);
}

function analyzeScamRisk(jobDescription: string) {
  const text = jobDescription.toLowerCase();
  const flags = [
    {
      regex: /(urgent hiring|immediate joining|join today|limited seats)/g,
      weight: 12,
      reason: "Urgency-heavy language detected",
    },
    {
      regex: /(pay(ing)? fee|registration fee|security deposit|upfront payment)/g,
      weight: 26,
      reason: "Payment request indicators found",
    },
    {
      regex: /(whatsapp only|telegram|direct message only)/g,
      weight: 15,
      reason: "Off-platform contact method emphasis",
    },
    {
      regex: /(earn \$?\d{5,}\s*(daily|weekly)|guaranteed income)/g,
      weight: 20,
      reason: "Unrealistic compensation claims detected",
    },
    {
      regex: /(no experience needed for senior role|instant offer)/g,
      weight: 14,
      reason: "Inconsistent requirement statements found",
    },
    {
      regex: /(lorem ipsum|asdf|qwerty)/g,
      weight: 10,
      reason: "Suspicious placeholder/low-quality language",
    },
  ];

  let score = 0;
  const reasons: ExplainabilityContribution[] = [];
  for (const flag of flags) {
    const matches = text.match(flag.regex);
    if (matches && matches.length > 0) {
      const impact = clamp(matches.length * flag.weight, 0, 35);
      score += impact;
      reasons.push({
        label: `${flag.reason} (+${impact})`,
        impact,
        category: "scam",
      });
    }
  }

  if (!/(www\.|http|linkedin|career page|about us)/.test(text)) {
    score += 12;
    reasons.push({
      label: "Missing trusted company/reference links (+12)",
      impact: 12,
      category: "scam",
    });
  }

  return {
    score: clamp(Math.round(score), 0, 100),
    reasons,
  };
}

function analyzeGhostJobRisk(jobDescription: string) {
  const text = jobDescription.toLowerCase();
  let score = 0;
  const reasons: ExplainabilityContribution[] = [];

  const addReason = (condition: boolean, points: number, label: string) => {
    if (condition) {
      score += points;
      reasons.push({
        label: `${label} (+${points})`,
        impact: points,
        category: "ghost",
      });
    }
  };

  addReason(
    /(talent pool|future opportunities|pipeline role)/.test(text),
    18,
    "Role framed as future/pipeline opening",
  );
  addReason(
    /(competitive salary|salary not disclosed|best in industry)/.test(text),
    10,
    "Compensation details are vague",
  );
  addReason(
    /(fast-paced environment|various responsibilities|dynamic role)/.test(text),
    8,
    "Role details are generic and low-specificity",
  );
  addReason(
    !/(years|responsibilities|requirements|skills)/.test(text),
    16,
    "Core hiring criteria are underspecified",
  );
  addReason(
    /(open until filled|ongoing hiring|rolling basis)/.test(text),
    14,
    "Perpetual posting language detected",
  );
  addReason(!/(company|team|product)/.test(text), 10, "Company context is weak");

  return {
    score: clamp(Math.round(score), 0, 100),
    reasons,
  };
}

export function runDeterministicAnalysis(input: {
  resumeText: string;
  jobDescription: string;
  userSkills?: string[];
}) {
  const resumeText = input.resumeText;
  const jobDescription = input.jobDescription;
  const resumeTokens = tokenize(resumeText);
  const jobTokens = tokenize(jobDescription);
  const resumeFreq = termFrequency(resumeTokens);
  const jobFreq = termFrequency(jobTokens);
  const semanticSimilarity = cosineSimilarity(resumeFreq, jobFreq);

  const resumeSkills = extractSkillsFromText(resumeText);
  const jobSkills = extractSkillsFromText(jobDescription);
  const enrichedResumeSkills = [
    ...new Set([...(input.userSkills ?? []), ...resumeSkills].map((skill) => skill.toLowerCase())),
  ];

  const matchedSkills = jobSkills.filter((skill) =>
    enrichedResumeSkills.includes(skill.toLowerCase()),
  );
  const missingSkills = jobSkills.filter(
    (skill) => !enrichedResumeSkills.includes(skill.toLowerCase()),
  );

  const skillMatchScore =
    jobSkills.length > 0
      ? Math.round((matchedSkills.length / jobSkills.length) * 100)
      : 70;

  const topKeywords = extractTopKeywords(resumeText, jobDescription);
  const keywordMatches = topKeywords.filter((keyword) =>
    resumeTokens.includes(keyword),
  );
  const keywordCoverageScore =
    topKeywords.length > 0
      ? Math.round((keywordMatches.length / topKeywords.length) * 100)
      : 70;

  const jobYears = extractYears(jobDescription);
  const resumeYears = extractYears(resumeText);
  const experienceMatchScore =
    jobYears === 0 ? 75 : Math.round(clamp(resumeYears / jobYears, 0, 1) * 100);
  const educationMatchScore = getEducationMatchScore(resumeText, jobDescription);

  const atsScore = Math.round(
    skillMatchScore * 0.4 +
      keywordCoverageScore * 0.25 +
      experienceMatchScore * 0.2 +
      educationMatchScore * 0.15,
  );

  const resumeCompletenessIndicators = [
    /experience|work history|employment/.test(resumeText.toLowerCase()),
    /education|degree|university/.test(resumeText.toLowerCase()),
    /project|portfolio|achievement/.test(resumeText.toLowerCase()),
    /skill|technology|tools/.test(resumeText.toLowerCase()),
  ];
  const resumeCompleteness =
    (resumeCompletenessIndicators.filter(Boolean).length /
      resumeCompletenessIndicators.length) *
    100;

  const resumeQualityScore = Math.round(
    clamp(
      atsScore * 0.6 + semanticSimilarity * 100 * 0.2 + resumeCompleteness * 0.2,
      0,
      100,
    ),
  );

  const scam = analyzeScamRisk(jobDescription);
  const ghost = analyzeGhostJobRisk(jobDescription);
  const interviewProbability = getInterviewProbability(
    atsScore,
    experienceMatchScore,
    resumeQualityScore,
  );

  const explainability: ExplainabilityContribution[] = [
    {
      label: `Skill alignment ${matchedSkills.length}/${Math.max(jobSkills.length, 1)} (${skillMatchScore})`,
      impact: Math.round((skillMatchScore - 50) / 4),
      category: "skills",
    },
    {
      label: `Keyword coverage ${keywordMatches.length}/${Math.max(topKeywords.length, 1)} (${keywordCoverageScore})`,
      impact: Math.round((keywordCoverageScore - 50) / 4),
      category: "keywords",
    },
    {
      label: `Experience relevance score ${experienceMatchScore}`,
      impact: Math.round((experienceMatchScore - 50) / 5),
      category: "experience",
    },
    {
      label: `Education alignment score ${educationMatchScore}`,
      impact: Math.round((educationMatchScore - 50) / 6),
      category: "education",
    },
    ...scam.reasons,
    ...ghost.reasons,
  ];

  const suggestions = buildSuggestions({
    missingSkills,
    keywordGap: topKeywords.filter((term) => !keywordMatches.includes(term)),
    experienceMatchScore,
    educationMatchScore,
  });

  const result: DeterministicAnalysis = {
    atsScore,
    interviewProbability,
    scamRisk: toRiskLevel(scam.score),
    scamRiskScore: scam.score,
    ghostJobRisk: toRiskLevel(ghost.score),
    ghostJobRiskScore: ghost.score,
    resumeQualityScore,
    semanticSimilarity: Number(semanticSimilarity.toFixed(4)),
    missingSkills: missingSkills.map(toTitleCase),
    matchedSkills: matchedSkills.map(toTitleCase),
    keywordMatches: keywordMatches.map(toTitleCase),
    suggestions,
    atsBreakdown: {
      skillMatch: skillMatchScore,
      keywordCoverage: keywordCoverageScore,
      experienceMatch: experienceMatchScore,
      educationMatch: educationMatchScore,
    },
    explainability,
  };

  return result;
}
