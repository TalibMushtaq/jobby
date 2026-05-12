import { subHours } from "date-fns";

import { prisma } from "@/lib/prisma";

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export async function enforceAiRateLimit(
  userId: string,
  endpoint: string,
  limit = 12,
  windowHours = 1,
) {
  const windowStart = subHours(new Date(), windowHours);

  const requestCount = await prisma.aiRequestLog.count({
    where: {
      userId,
      endpoint,
      createdAt: { gte: windowStart },
    },
  });

  if (requestCount >= limit) {
    throw new RateLimitError(
      `Rate limit exceeded for ${endpoint}. Please try again later.`,
    );
  }

  await prisma.aiRequestLog.create({
    data: {
      userId,
      endpoint,
    },
  });
}
