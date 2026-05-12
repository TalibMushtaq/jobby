import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BarChart3 } from "lucide-react";

import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { isDevAuthBypass } from "@/lib/auth-mode";
import { requireDbUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireDbUser();

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar
        user={{
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl,
        }}
        showClerkUserButton={!isDevAuthBypass}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-card/80 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
              <BarChart3 className="h-4 w-4 text-primary" />
              Jobby
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {isDevAuthBypass ? (
                <span className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  Dev auth
                </span>
              ) : (
                <UserButton />
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
