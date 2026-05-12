import { SignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { isDevAuthBypass } from "@/lib/auth-mode";

export default function SignInPage() {
  if (isDevAuthBypass) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <SignIn />
    </main>
  );
}
