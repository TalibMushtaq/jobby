"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const resumeIdSchema = z.object({
  resumeId: z.string().min(1),
});

export async function setDefaultResumeAction(formData: FormData) {
  const user = await requireDbUser();
  const { resumeId } = resumeIdSchema.parse({
    resumeId: String(formData.get("resumeId") ?? ""),
  });

  await prisma.$transaction(async (tx) => {
    await tx.resume.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });

    const updatedRows = await tx.resume.updateMany({
      where: {
        id: resumeId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    if (updatedRows.count === 0) {
      throw new Error("Resume not found.");
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/resumes");
}

export async function deleteResumeAction(formData: FormData) {
  const user = await requireDbUser();
  const { resumeId } = resumeIdSchema.parse({
    resumeId: String(formData.get("resumeId") ?? ""),
  });

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
  });

  if (!resume) {
    throw new Error("Resume not found.");
  }

  await prisma.resume.delete({
    where: {
      id: resumeId,
    },
  });

  if (resume.isDefault) {
    const latestResume = await prisma.resume.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    if (latestResume) {
      await prisma.resume.update({
        where: { id: latestResume.id },
        data: { isDefault: true },
      });
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/resumes");
}
