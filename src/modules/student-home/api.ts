import { apiFetch } from "@/lib/api/client";
import type {
  CmsStudentResponse,
  StudentHomeBanner,
  StudentHomeAnnouncement,
  StudentHomeResponse,
  StudentHomeSection,
  StudentHomeSectionItem,
} from "@/modules/student-home/types";
import { extractCmsText } from "@/modules/student-home/types";

function mapSectionItem(item: Record<string, unknown>, type: string): StudentHomeSectionItem {
  if (type === "NOTES") {
    return {
      id: String(item.id ?? ""),
      title: String(item.title ?? "Untitled note"),
      subtitle: item.description ? String(item.description) : undefined,
      badge: item.isPremium ? "Premium" : "Free",
      ctaLabel: "Open",
      ctaHref: `/student/notes/${item.id}`,
      meta: item.pageCount ? `${item.pageCount} pages` : undefined,
    };
  }

  if (type === "TESTS") {
    return {
      id: String(item.id ?? ""),
      title: String(item.title ?? "Untitled test"),
      subtitle: item.description ? String(item.description) : undefined,
      badge: item.type ? String(item.type) : undefined,
      ctaLabel: "View",
      ctaHref: `/student/tests/${item.id}`,
      meta: item.startsAt ? new Date(String(item.startsAt)).toLocaleString("en-IN") : undefined,
    };
  }

  if (type === "SUBJECTS") {
    return {
      id: String(item.id ?? ""),
      title: String(item.name ?? "Subject"),
      subtitle: item.description ? String(item.description) : undefined,
      ctaLabel: "Explore",
      ctaHref: `/student/subjects/${item.id}`,
    };
  }

  if (type === "TOPICS") {
    const subject = (item as { subject?: { name?: string } }).subject;
    return {
      id: String(item.id ?? ""),
      title: String(item.name ?? "Topic"),
      subtitle: subject?.name ? String(subject.name) : undefined,
      ctaLabel: "Open",
      ctaHref: `/student/topics/${item.id}`,
    };
  }

  return {
    id: String(item.id ?? ""),
    title: String(item.title ?? item.name ?? "Item"),
    subtitle: extractCmsText(item.bodyJson ?? item.description),
  };
}

function mapSections(response: CmsStudentResponse): StudentHomeSection[] {
  const sections = response.homeSections ?? [];
  return sections.map((section) => {
    const type = String(section.type || "CUSTOM").toUpperCase();
    const items = Array.isArray(section.resolved?.items)
      ? section.resolved?.items
      : [];
    return {
      id: section.id,
      type: (type as StudentHomeSection["type"]) ?? "CUSTOM",
      title: String(section.configJson?.title ?? section.type ?? "Section"),
      subtitle: extractCmsText(section.configJson?.subtitle),
      items: items.map((item) => mapSectionItem(item as Record<string, unknown>, type)),
    };
  });
}

function mapBanners(response: CmsStudentResponse): StudentHomeBanner[] {
  return (response.banners ?? []).map((banner, index) => ({
    id: banner.id,
    title: banner.title,
    subtitle: extractCmsText(banner.bodyJson),
    ctaLabel: banner.linkUrl ? "Open" : undefined,
    ctaHref: banner.linkUrl ?? undefined,
    tone: index % 2 === 0 ? "primary" : "accent",
  }));
}

function mapAnnouncements(response: CmsStudentResponse) {
  return (response.announcements ?? []).map((announcement) => {
    const level: StudentHomeAnnouncement["level"] = announcement.pinned
      ? "success"
      : "info";
    return {
      id: announcement.id,
      title: announcement.title,
      message: extractCmsText(announcement.bodyJson) || "New update",
      level,
    };
  });
}

export async function getStudentHome() {
  const response = await apiFetch<CmsStudentResponse>("/cms/student", {
    method: "GET",
    auth: false,
  });

  return {
    banners: mapBanners(response),
    announcements: mapAnnouncements(response),
    sections: mapSections(response),
  } satisfies StudentHomeResponse;
}
