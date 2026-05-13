import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { isDevAuthBypass } from "@/lib/auth-mode";
import {
  DEFAULT_EXPERIENCE_LEVEL,
  isExperienceLevel,
  type ExperienceLevelValue,
} from "@/lib/experience-level";
import { prisma } from "@/lib/prisma";
import { syncDbUserFromIdentity } from "@/lib/user-sync";

const mapExperienceLevel = (value?: string | null): ExperienceLevelValue | null => {
  if (!value) {
    return null;
  }

  const normalized = value.toUpperCase();
  if (isExperienceLevel(normalized)) {
    return normalized;
  }

  return null;
};

export async function syncCurrentUser() {
  if (isDevAuthBypass) {
    return prisma.user.upsert({
      where: { clerkId: "dev-local-user" },
      update: {
        email: "dev@local.jobby",
        fullName: "Local Dev User",
        avatarUrl: null,
      },
      create: {
        clerkId: "dev-local-user",
        email: "dev@local.jobby",
        fullName: "Local Dev User",
        experienceLevel: DEFAULT_EXPERIENCE_LEVEL,
      },
    });
  }

  const { userId } = await auth();
  if (!userId) {
    return null;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error("Authenticated Clerk user could not be loaded.");
  }

  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!primaryEmail) {
    throw new Error(`Missing Clerk email for user ${userId}.`);
  }

  const fullName =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    null;

  return syncDbUserFromIdentity({
    clerkId: userId,
    email: primaryEmail,
    fullName,
    avatarUrl: clerkUser.imageUrl ?? null,
    createExperienceLevel: mapExperienceLevel(
      clerkUser.publicMetadata?.experienceLevel as string | undefined,
    ),
    source: "request",
  });
}

export async function requireDbUser() {
  const user = await syncCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
