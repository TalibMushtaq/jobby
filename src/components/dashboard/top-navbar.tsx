"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BarChart3, Menu, X } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { DashboardNavLinks } from "./nav-links";

type DashboardTopNavbarProps = {
  user: {
    fullName: string | null;
    email: string;
    avatarUrl: string | null;
  };
  showClerkUserButton: boolean;
};

function UserIdentity({
  fullName,
  email,
  avatarUrl,
}: {
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
}) {
  const initials = (fullName || email).slice(0, 2).toUpperCase();

  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl ?? undefined} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="max-w-40 leading-tight">
        <p className="truncate text-xs font-medium text-foreground">{fullName || "Jobby User"}</p>
        <p className="truncate text-[11px] text-muted-foreground">{email}</p>
      </div>
    </div>
  );
}

export function DashboardTopNavbar({
  user,
  showClerkUserButton,
}: DashboardTopNavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" />
            Jobby
          </Link>
          <DashboardNavLinks variant="desktop" />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserIdentity
            fullName={user.fullName}
            email={user.email}
            avatarUrl={user.avatarUrl}
          />
          {showClerkUserButton ? (
            <UserButton />
          ) : (
            <span className="rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Dev auth
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border px-4 py-3 lg:hidden">
          <DashboardNavLinks variant="mobile" onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </header>
  );
}
