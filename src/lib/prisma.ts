import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function withStrictPgSslMode(connectionString: string) {
  if (!connectionString) {
    return connectionString;
  }

  if (!URL.canParse(connectionString)) {
    return connectionString;
  }

  const url = new URL(connectionString);
  const protocol = url.protocol.toLowerCase();
  if (protocol !== "postgres:" && protocol !== "postgresql:") {
    return connectionString;
  }

  const sslMode = url.searchParams.get("sslmode");
  const usesLibpqCompat = url.searchParams.get("uselibpqcompat") === "true";
  if (usesLibpqCompat) {
    return connectionString;
  }

  if (sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
    url.searchParams.set("sslmode", "verify-full");
    return url.toString();
  }

  return connectionString;
}

const adapter = new PrismaPg({
  connectionString: withStrictPgSslMode(process.env.DATABASE_URL ?? ""),
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
