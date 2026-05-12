"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  BarChart3,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  Settings,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/resumes", label: "Resume Library", icon: FileSpreadsheet },
  { href: "/dashboard/history", label: "Analysis History", icon: History },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  user: {
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  showClerkUserButton: boolean;
};

export function DashboardSidebar({ user, showClerkUserButton }: SidebarProps) {
  const pathname = usePathname();
  const initials = (user.fullName || user.email).slice(0, 2).toUpperCase();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-border bg-card p-4 backdrop-blur lg:flex">
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted"
      >
        <div className="rounded-md bg-primary p-2 text-primary-foreground">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold leading-tight text-foreground">Jobby</p>
          <p className="text-xs text-muted-foreground">
            Hiring Intelligence
          </p>
        </div>
      </Link>
      <nav className="space-y-1">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === item.href
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3 rounded-lg border border-border p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {user.fullName || "Jobby User"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
        {showClerkUserButton ? (
          <div className="flex justify-end">
            <UserButton />
          </div>
        ) : (
          <div className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Dev auth mode
          </div>
        )}
      </div>
    </aside>
  );
}
