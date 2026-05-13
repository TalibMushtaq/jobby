import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "mammoth", "natural", "compromise", "pg"],
};

export default nextConfig;
