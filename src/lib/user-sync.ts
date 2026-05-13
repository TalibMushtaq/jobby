import type { ExperienceLevel, User } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type SyncDbUserFromIdentityArgs = {
  clerkId: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createExperienceLevel?: ExperienceLevel | null;
  source: "request" | "webhook";
};

export async function syncDbUserFromIdentity({
  clerkId,
  email,
  fullName,
  avatarUrl,
  createExperienceLevel = null,
  source,
}: SyncDbUserFromIdentityArgs): Promise<User> {
  try {
    // 1. First check if user exists and is already in sync without a transaction
    const existing = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (
      existing &&
      existing.email === email &&
      existing.fullName === fullName &&
      existing.avatarUrl === avatarUrl
    ) {
      return existing;
    }

    // 2. If not found or needs update, proceed with transaction
    return await prisma.$transaction(
      async (tx) => {
        const existingByClerkId = await tx.user.findUnique({
          where: { clerkId },
        });

        if (existingByClerkId) {
          // Double check inside transaction to avoid race conditions
          if (
            existingByClerkId.email === email &&
            existingByClerkId.fullName === fullName &&
            existingByClerkId.avatarUrl === avatarUrl
          ) {
            return existingByClerkId;
          }

          const updatedUser = await tx.user.update({
            where: { id: existingByClerkId.id },
            data: {
              email,
              fullName,
              avatarUrl,
            },
          });

          console.info("[USER_UPDATED]", { source, clerkId, email });
          return updatedUser;
        }

        const existingByEmail = await tx.user.findUnique({
          where: { email },
          select: { id: true, clerkId: true },
        });

        if (existingByEmail) {
          const relinkedUser = await tx.user.update({
            where: { id: existingByEmail.id },
            data: {
              clerkId,
              email,
              fullName,
              avatarUrl,
            },
          });

          console.warn("[USER_RELINKED]", {
            source,
            email,
            oldClerkId: existingByEmail.clerkId,
            newClerkId: clerkId,
          });
          return relinkedUser;
        }

        const createdUser = await tx.user.create({
          data: {
            clerkId,
            email,
            fullName,
            avatarUrl,
            experienceLevel: createExperienceLevel,
          },
        });

        console.info("[USER_CREATED]", { source, clerkId, email });
        return createdUser;
      },
      {
        timeout: 10000, // 10 seconds
      },
    );
  } catch (error) {
    console.error("[USER_SYNC_FAILED]", { source, clerkId, email, error });
    throw error;
  }
}
