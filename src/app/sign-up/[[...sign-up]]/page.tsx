import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { isDevAuthBypass } from "@/lib/auth-mode";

export default function SignUpPage() {
  if (isDevAuthBypass) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <SignUp />
    </main>
  );
}
