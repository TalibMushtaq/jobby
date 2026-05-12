"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { dashboardNavItems, isDashboardNavItemActive } from "./nav-items";

type DashboardNavLinksProps = {
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export function DashboardNavLinks({ variant, onNavigate }: DashboardNavLinksProps) {
  const pathname = usePathname();

  return (
    <nav className={cn(variant === "desktop" ? "hidden items-center gap-1 lg:flex" : "grid gap-1")}>
      {dashboardNavItems.map((item) => {
        const active = isDashboardNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
              variant === "desktop" ? "font-medium" : "font-normal",
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
  );
}
