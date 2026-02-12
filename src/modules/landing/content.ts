import {
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Lock,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import type {
  Exam,
  FeatureHighlight,
  FooterLink,
  HowItWorksStep,
  NavItem,
  PricingPlan,
  TrustSignal,
  UspItem,
} from "./types";
import { buildAuthUrl } from "@/modules/shared/routing/returnUrl";

const buildLandingAuthHref = (plan?: string) =>
  buildAuthUrl("/auth/register", { plan, from: "landing" });

export const navItems: NavItem[] = [
  { label: "Exams", href: "#exams" },
  { label: "Courses", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export const heroContent = {
  headline: "Prepare Smarter. Perform Better.",
  subheadline:
    "Notes, mock tests, practice sets, and performance analytics built for serious aspirants.",
  primaryCtaLabel: "Get Started Free",
  primaryCtaHref: buildLandingAuthHref("free"),
  secondaryCtaLabel: "Explore Exams",
  secondaryCtaHref: "#exams",
  trustLine: "Trusted learning experience for focused preparation.",
  trustBullets: [
    "Mobile-first experience",
    "Smart analytics",
    "Secure content access",
  ],
};

export const exams: Exam[] = [
  {
    id: "banking",
    name: "Banking",
    slug: "banking",
    level: "Advanced",
    shortDescription:
      "IBPS, SBI, and RBI patterns with structured practice sets and analytics.",
    tags: ["popular"],
    isActive: true,
  },
  {
    id: "ssc",
    name: "SSC",
    slug: "ssc",
    level: "Advanced",
    shortDescription:
      "CGL, CHSL, and MTS readiness with topic drills and timed mocks.",
    tags: ["popular"],
    isActive: true,
  },
  {
    id: "state-exams",
    name: "State Exams",
    slug: "state-exams",
    level: "Advanced",
    shortDescription:
      "State PSC coverage with structured notes, practice, and revision paths.",
    tags: ["new"],
    isActive: true,
  },
  {
    id: "railways",
    name: "Railways",
    slug: "railways",
    level: "Foundation",
    shortDescription:
      "Focused prep for RRB exams with guided practice and notes.",
    tags: ["free"],
    isActive: false,
  },
  {
    id: "teaching",
    name: "Teaching",
    slug: "teaching",
    level: "Foundation",
    shortDescription:
      "CTET and state teaching exams with topic-wise practice sets.",
    tags: ["new"],
    isActive: false,
  },
  {
    id: "custom-institute",
    name: "Custom Institute Exams",
    slug: "custom-institute",
    level: "Specialized",
    shortDescription:
      "Publish your institute syllabus with secure access and analytics.",
    tags: ["free"],
    isActive: false,
  },
];

export const uspItems: UspItem[] = [
  {
    title: "Structured Notes",
    description: "Well-organized notes mapped to topics and difficulty.",
    icon: BookOpen,
  },
  {
    title: "Smart Practice & Tests",
    description: "Practice sets + mock tests with instant solutions.",
    icon: ClipboardCheck,
  },
  {
    title: "Performance Analytics",
    description: "Track accuracy, speed, weak topics, and improvements.",
    icon: BarChart3,
  },
  {
    title: "Secure Content Access",
    description: "Controlled viewing, watermarking, and protected materials.",
    icon: ShieldCheck,
  },
  {
    title: "Mobile-First Experience",
    description: "Optimized for phone browsers and student workflows.",
    icon: Smartphone,
  },
];

export const howItWorksSteps: HowItWorksStep[] = [
  {
    step: "01",
    title: "Create your account",
    description: "Register in seconds and access free content instantly.",
  },
  {
    step: "02",
    title: "Select your exam",
    description: "Pick an exam and start with notes, practice sets, and tests.",
  },
  {
    step: "03",
    title: "Practice & track progress",
    description: "Get analytics on accuracy, speed, and weak topics.",
  },
];

export const featureHighlights: FeatureHighlight[] = [
  {
    title: "Test Engine",
    description:
      "Timed tests, topic drills, and full-length mocks designed for real exam pressure.",
    bullets: [
      "Subject-wise and full-length mocks",
      "Instant solutions and review",
      "Adaptive difficulty coverage",
    ],
  },
  {
    title: "Notes Viewer",
    description:
      "Crisp, topic-mapped notes with revision-friendly layouts and focus mode reading.",
    bullets: [
      "Structured notes by subject",
      "Quick revision summaries",
      "Mobile-first reading experience",
    ],
  },
  {
    title: "Progress Tracking",
    description:
      "See what's improving, what needs focus, and how you're trending week to week.",
    bullets: [
      "Accuracy + speed analytics",
      "Weak topic alerts",
      "Goal and streak tracking",
    ],
  },
];

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "INR 0",
    interval: "Forever",
    features: [
      "Limited notes access",
      "Intro practice sets",
      "Basic progress view",
    ],
    ctaLabel: "Start Free",
    ctaHref: buildLandingAuthHref("free"),
  },
  {
    id: "standard",
    name: "Standard",
    price: "INR XXX",
    interval: "per month",
    features: [
      "Full notes access",
      "Practice sets",
      "Sectional tests",
      "Performance analytics",
    ],
    isPopular: true,
    ctaLabel: "Upgrade to Standard",
    ctaHref: buildLandingAuthHref("standard"),
  },
  {
    id: "premium",
    name: "Premium",
    price: "INR XXX",
    interval: "per month",
    features: [
      "Everything in Standard",
      "Full-length mocks",
      "Advanced analytics",
      "Priority updates",
    ],
    ctaLabel: "Go Premium",
    ctaHref: buildLandingAuthHref("premium"),
  },
];

export const trustSignals: TrustSignal[] = [
  {
    title: "Secure delivery",
    description: "Protected access and controlled content viewing.",
    icon: ShieldCheck,
  },
  {
    title: "Reliable support",
    description: "Clear guidance and responsive student help.",
    icon: Smartphone,
  },
  {
    title: "Privacy-first data handling",
    description: "Thoughtful data practices built for trust.",
    icon: Lock,
  },
];

export const trustLogos = [
  "Institute Partner",
  "Coaching Center",
  "Skill Academy",
  "Exam Prep Studio",
];

export const footerNavLinks: FooterLink[] = [
  { label: "Exams", href: "#exams" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const footerPolicyLinks: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
  { label: "Refund Policy", href: "/refund-policy" },
];
