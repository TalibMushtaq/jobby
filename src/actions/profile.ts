"use server";

import { ExperienceLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  fullName: z.string().min(2).max(120),
  education: z.string().max(240),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  skills: z.string().max(2000),
  preferredJobRoles: z.string().max(2000),
});

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireDbUser();
  const parsed = profileSchema.parse({
    fullName: String(formData.get("fullName") ?? ""),
    education: String(formData.get("education") ?? ""),
    experienceLevel: String(formData.get("experienceLevel") ?? "MID"),
    skills: String(formData.get("skills") ?? ""),
    preferredJobRoles: String(formData.get("preferredJobRoles") ?? ""),
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: parsed.fullName,
      education: parsed.education,
      experienceLevel: parsed.experienceLevel,
      skills: splitCsv(parsed.skills),
      preferredJobRoles: splitCsv(parsed.preferredJobRoles),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}
