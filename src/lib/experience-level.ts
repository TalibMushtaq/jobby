export const EXPERIENCE_LEVELS = [
  "INTERN",
  "JUNIOR",
  "MID",
  "SENIOR",
  "LEAD",
] as const;

export type ExperienceLevelValue = (typeof EXPERIENCE_LEVELS)[number];

export const DEFAULT_EXPERIENCE_LEVEL: ExperienceLevelValue = "MID";

export function isExperienceLevel(value: string): value is ExperienceLevelValue {
  return (EXPERIENCE_LEVELS as readonly string[]).includes(value);
}
