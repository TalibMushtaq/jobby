import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { BrainCircuit } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { isDevAuthBypass } from "@/lib/auth-mode";

export default function SignUpPage() {
  if (isDevAuthBypass) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-lg bg-primary p-2">
              <BrainCircuit className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-foreground">Jobby</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Sign Up Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <SignUp />
      </div>
    </main>
  );
}
