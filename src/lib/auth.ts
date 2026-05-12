import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { isDevAuthBypass } from "@/lib/auth-mode";
import {
  DEFAULT_EXPERIENCE_LEVEL,
  isExperienceLevel,
  type ExperienceLevelValue,
} from "@/lib/experience-level";
import { prisma } from "@/lib/prisma";

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
  const primaryEmail =
    clerkUser?.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ??
    clerkUser?.emailAddresses[0]?.emailAddress ??
    `${userId}@clerk.local`;

  const fullName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.username ||
    null;

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email: primaryEmail,
      fullName,
      avatarUrl: clerkUser?.imageUrl ?? null,
    },
    create: {
      clerkId: userId,
      email: primaryEmail,
      fullName,
      avatarUrl: clerkUser?.imageUrl ?? null,
      experienceLevel: mapExperienceLevel(
        clerkUser?.publicMetadata?.experienceLevel as string | undefined,
      ),
    },
  });
}

export async function requireDbUser() {
  const user = await syncCurrentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return user;
}
