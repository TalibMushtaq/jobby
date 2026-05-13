import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

import "./env";

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

  if (sslMode === "prefer") {
    url.searchParams.set("sslmode", "require");
    return url.toString();
  }

  return connectionString;
}

const connectionString = withStrictPgSslMode(
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "",
);

const createPrismaClient = () => {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
