import { DashboardTopNavbar } from "@/components/dashboard/top-navbar";
import { isDevAuthBypass } from "@/lib/auth-mode";
import { requireDbUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireDbUser();

  return (
    <div className="min-h-screen bg-background">
      <DashboardTopNavbar
        user={{
          fullName: user.fullName,
          email: user.email,
          avatarUrl: user.avatarUrl,
        }}
        showClerkUserButton={!isDevAuthBypass}
      />
      <main className="mx-auto w-full max-w-7xl p-4 md:p-6">{children}</main>
    </div>
  );
}
