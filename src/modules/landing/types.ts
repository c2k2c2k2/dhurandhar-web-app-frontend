import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
};

export type Exam = {
  id: string;
  name: string;
  slug: string;
  level: "Foundation" | "Advanced" | "Specialized";
  shortDescription: string;
  tags: Array<"popular" | "new" | "free">;
  stats?: {
    tests?: number;
    practice?: number;
    notes?: number;
  };
  isActive: boolean;
};

export type UspItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type HowItWorksStep = {
  step: string;
  title: string;
  description: string;
};

export type FeatureHighlight = {
  title: string;
  description: string;
  bullets: string[];
};

export type PricingPlan = {
  id: string;
  name: string;
  price: string;
  interval: string;
  features: string[];
  isPopular?: boolean;
  ctaLabel: string;
  ctaHref: string;
};

export type TrustSignal = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export type FooterLink = {
  label: string;
  href: string;
};
