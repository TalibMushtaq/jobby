export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type InterviewProbability = "LOW" | "MEDIUM" | "HIGH";

export type ExplainabilityContribution = {
  label: string;
  impact: number;
  category:
    | "skills"
    | "keywords"
    | "experience"
    | "education"
    | "scam"
    | "ghost"
    | "quality";
};

export type AtsBreakdown = {
  skillMatch: number;
  keywordCoverage: number;
  experienceMatch: number;
  educationMatch: number;
};

export type DeterministicAnalysis = {
  atsScore: number;
  interviewProbability: InterviewProbability;
  scamRisk: RiskLevel;
  scamRiskScore: number;
  ghostJobRisk: RiskLevel;
  ghostJobRiskScore: number;
  resumeQualityScore: number;
  semanticSimilarity: number;
  missingSkills: string[];
  matchedSkills: string[];
  keywordMatches: string[];
  suggestions: string[];
  atsBreakdown: AtsBreakdown;
  explainability: ExplainabilityContribution[];
};

export type AiEnhancement = {
  summary: string;
  resumeSuggestions: string[];
  optimizedResume: string;
  explainabilityNotes: string[];
};
