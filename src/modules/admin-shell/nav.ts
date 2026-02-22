import {
  BarChart3,
  BadgePercent,
  Bell,
  BookOpen,
  FileText,
  LayoutDashboard,
  Lock,
  NotebookText,
  PackageSearch,
  Printer,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PermissionKey } from "@/lib/auth/permissions";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permissions?: PermissionKey[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    permissions: ["analytics.read"],
  },
  {
    label: "Subjects and Topics",
    href: "/admin/taxonomy/subjects",
    icon: BookOpen,
    permissions: ["content.manage"],
  },
  {
    label: "Notes",
    href: "/admin/notes",
    icon: FileText,
    permissions: ["notes.read"],
  },
  {
    label: "Questions",
    href: "/admin/questions",
    icon: NotebookText,
    permissions: ["questions.read"],
  },
  {
    label: "Tests",
    href: "/admin/tests",
    icon: PackageSearch,
    permissions: ["tests.crud"],
  },
  {
    label: "Print Jobs",
    href: "/admin/print-jobs",
    icon: Printer,
    permissions: ["content.manage"],
  },
  {
    label: "CMS",
    href: "/admin/cms",
    icon: Settings,
    permissions: ["admin.config.write"],
  },
  {
    label: "Payments",
    href: "/admin/payments",
    icon: Wallet,
    permissions: ["payments.read"],
  },
  {
    label: "Plans",
    href: "/admin/plans",
    icon: Wallet,
    permissions: ["payments.read"],
  },
  {
    label: "Coupons",
    href: "/admin/coupons",
    icon: BadgePercent,
    permissions: ["payments.read"],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: Users,
    permissions: ["users.read"],
  },
  {
    label: "Security",
    href: "/admin/security",
    icon: ShieldCheck,
    permissions: ["security.read"],
  },
  {
    label: "Audit Logs",
    href: "/admin/audit",
    icon: Lock,
    permissions: ["admin.audit.read"],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
    permissions: ["analytics.read"],
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    permissions: ["notifications.read"],
  },
];
