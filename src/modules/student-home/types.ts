export type CmsBanner = {
  id: string;
  title: string;
  bodyJson?: unknown;
  linkUrl?: string | null;
  target?: string | null;
  priority?: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
};

export type CmsAnnouncement = {
  id: string;
  title: string;
  bodyJson?: unknown;
  pinned?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
};

export type CmsHomeSection = {
  id: string;
  type: string;
  configJson?: Record<string, unknown> | null;
  resolved?: { items?: unknown[] } | null;
};

export type CmsStudentResponse = {
  banners?: CmsBanner[];
  announcements?: CmsAnnouncement[];
  homeSections?: CmsHomeSection[];
};

export type StudentHomeBanner = {
  id: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  tone?: "primary" | "accent" | "neutral";
};

export type StudentHomeAnnouncement = {
  id: string;
  title: string;
  message: string;
  level?: "info" | "success" | "warning";
};

export type StudentHomeSectionItem = {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type StudentHomeSection = {
  id: string;
  type: "NOTES" | "TESTS" | "PRACTICE" | "TOPICS" | "SUBJECTS" | "CUSTOM";
  title: string;
  subtitle?: string;
  items?: StudentHomeSectionItem[];
};

export type StudentHomeResponse = {
  banners: StudentHomeBanner[];
  announcements: StudentHomeAnnouncement[];
  sections: StudentHomeSection[];
};

export function extractCmsText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(extractCmsText).join(" ").trim();
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.text === "string") return obj.text;
    if (Array.isArray(obj.blocks)) {
      return obj.blocks.map(extractCmsText).join(" ").trim();
    }
    return Object.values(obj).map(extractCmsText).join(" ").trim();
  }
  return "";
}
