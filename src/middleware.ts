import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { isDevAuthBypass } from "@/lib/auth-mode";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/resumes/(.*)",
  "/api/analysis/(.*)",
]);

const protectedMiddleware = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default isDevAuthBypass
  ? () => NextResponse.next()
  : protectedMiddleware;

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|map|json)).*)",
    "/(api|trpc)(.*)",
  ],
};
