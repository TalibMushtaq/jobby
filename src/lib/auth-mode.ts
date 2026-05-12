const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
const secretKey = process.env.CLERK_SECRET_KEY ?? "";

function isPlaceholder(value: string) {
  return value.length === 0 || value.includes("REPLACE_ME");
}

export const isClerkConfigured =
  !isPlaceholder(publishableKey) && !isPlaceholder(secretKey);

export const isDevAuthBypass =
  process.env.NODE_ENV === "development" &&
  (process.env.DEV_AUTH_BYPASS === "true" || !isClerkConfigured);
