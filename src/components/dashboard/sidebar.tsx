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
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-zinc-200 bg-white/90 p-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80 lg:flex">
      <Link
        href="/dashboard"
        className="mb-6 flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
      >
        <div className="rounded-md bg-sky-600 p-2 text-white">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold leading-tight">Jobby</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
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
                  ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl ?? undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user.fullName || "Jobby User"}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
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
