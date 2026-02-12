import type { LucideIcon } from "lucide-react";
import {
  Home,
  BookOpen,
  Target,
  ClipboardList,
  User,
  Layers,
  CreditCard,
} from "lucide-react";

export type StudentNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const STUDENT_PRIMARY_NAV: StudentNavItem[] = [
  { label: "Home", href: "/student", icon: Home },
  { label: "Notes", href: "/student/notes", icon: BookOpen },
  { label: "Practice", href: "/student/practice", icon: Target },
  { label: "Tests", href: "/student/tests", icon: ClipboardList },
  { label: "Profile", href: "/student/profile", icon: User },
];

export const STUDENT_SECONDARY_NAV: StudentNavItem[] = [
  { label: "Subjects", href: "/student/subjects", icon: Layers },
  { label: "Plans", href: "/student/payments", icon: CreditCard },
];
