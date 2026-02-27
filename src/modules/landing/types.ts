import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
};

export type HeroContent = {
  badge: string;
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  trustLine: string;
  trustBullets: string[];
};

export type FocusArea = {
  id: string;
  title: string;
  description: string;
  highlight: string;
  href: string;
  icon: LucideIcon;
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
  tone: "navy" | "gold" | "crimson";
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

export type Testimonial = {
  quote: string;
  name: string;
  subtitle: string;
};

export type FooterLink = {
  label: string;
  href: string;
};
