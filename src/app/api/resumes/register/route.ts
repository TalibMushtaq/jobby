import { NextResponse } from "next/server";
import { z } from "zod";

import { syncCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deriveResumeTitle, extractResumeText, isAllowedResumeType } from "@/lib/resume-parser";
import { extractSkillsFromText } from "@/lib/scoring";
import { toTitleCase } from "@/lib/utils";

export const runtime = "nodejs";

const payloadSchema = z.object({
  fileUrl: z.string().url(),
  fileKey: z.string().min(1),
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().int().positive().max(8 * 1024 * 1024),
});

export async function POST(request: Request) {
  try {
    const dbUser = await syncCurrentUser();
    if (!dbUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const payload = payloadSchema.parse(body);

    if (!isAllowedResumeType(payload.fileType)) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are supported." },
        { status: 400 },
      );
    }

    const uploadedFileResponse = await fetch(payload.fileUrl, { cache: "no-store" });
    if (!uploadedFileResponse.ok) {
      return NextResponse.json(
        { error: "Unable to fetch uploaded file from storage." },
        { status: 400 },
      );
    }

    const fileBuffer = Buffer.from(await uploadedFileResponse.arrayBuffer());
    const extractedText = await extractResumeText({
      fileBuffer,
      fileType: payload.fileType,
      fileName: payload.fileName,
    });

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: "Could not extract readable text from the uploaded resume." },
        { status: 400 },
      );
    }

    const existingCount = await prisma.resume.count({
      where: { userId: dbUser.id },
    });
    const isDefault = existingCount === 0;
    const parsedSkills = extractSkillsFromText(extractedText)
      .slice(0, 25)
      .map(toTitleCase);

    const resume = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.resume.updateMany({
          where: { userId: dbUser.id },
          data: { isDefault: false },
        });
      }

      const createdResume = await tx.resume.create({
        data: {
          userId: dbUser.id,
          title: deriveResumeTitle(payload.fileName),
          fileKey: payload.fileKey,
          fileUrl: payload.fileUrl,
          fileType: payload.fileType,
          extractedText,
          parsedSkills,
          isDefault,
        },
      });

      const mergedSkills = [
        ...new Set([...(dbUser.skills ?? []), ...parsedSkills].map((skill) => skill.trim())),
      ].filter(Boolean);

      if (mergedSkills.length > dbUser.skills.length) {
        await tx.user.update({
          where: { id: dbUser.id },
          data: {
            skills: mergedSkills.slice(0, 50),
          },
        });
      }

      return createdResume;
    });

    return NextResponse.json({ resumeId: resume.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid upload payload.", issues: error.issues },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Unexpected resume registration failure.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
