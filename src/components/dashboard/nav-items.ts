import type { LucideIcon } from "lucide-react";
import {
  FileSpreadsheet,
  History,
  LayoutDashboard,
  Settings,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/resumes", label: "Resume Library", icon: FileSpreadsheet },
  { href: "/dashboard/history", label: "Analysis History", icon: History },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function isDashboardNavItemActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}
