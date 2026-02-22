"use client";

import { apiFetch } from "@/lib/api/client";
import type {
  Announcement,
  AnnouncementCreateInput,
  AnnouncementUpdateInput,
  AppConfig,
  AppConfigCreateInput,
  Banner,
  BannerCreateInput,
  BannerUpdateInput,
  CmsListResponse,
  CmsPage,
  CmsPageCreateInput,
  CmsPageUpdateInput,
  HomeSection,
  HomeSectionCreateInput,
  HomeSectionReorderInput,
  HomeSectionUpdateInput,
  PageStatus,
} from "./types";

export type BannerFilters = {
  page?: number;
  pageSize?: number;
};

export type AnnouncementFilters = {
  page?: number;
  pageSize?: number;
};

export type HomeSectionFilters = {
  page?: number;
  pageSize?: number;
};

export type PageFilters = {
  status?: PageStatus;
  slug?: string;
  page?: number;
  pageSize?: number;
};

export type AppConfigFilters = {
  key?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  page?: number;
  pageSize?: number;
};

function normalizeList<T>(payload: unknown): CmsListResponse<T> {
  if (payload && typeof payload === "object") {
    const typed = payload as Record<string, unknown>;
    if (Array.isArray(typed.data)) {
      return typed as CmsListResponse<T>;
    }
    if (Array.isArray(typed.items)) {
      return {
        data: typed.items as T[],
        total: Number(typed.total ?? (typed.items as T[]).length),
        page: Number(typed.page ?? 1),
        pageSize: Number(typed.pageSize ?? (typed.items as T[]).length),
      };
    }
  }
  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      total: payload.length,
      page: 1,
      pageSize: payload.length,
    };
  }
  return { data: [], total: 0, page: 1, pageSize: 20 };
}

export async function listBanners(filters: BannerFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const queryString = params.toString();
  const data = await apiFetch<unknown>(
    `/admin/cms/banners${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  return normalizeList<Banner>(data);
}

export async function createBanner(input: BannerCreateInput) {
  return apiFetch<Banner>("/admin/cms/banners", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateBanner(bannerId: string, input: BannerUpdateInput) {
  return apiFetch<Banner>(`/admin/cms/banners/${bannerId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function listAnnouncements(filters: AnnouncementFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const queryString = params.toString();
  const data = await apiFetch<unknown>(
    `/admin/cms/announcements${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  return normalizeList<Announcement>(data);
}

export async function createAnnouncement(input: AnnouncementCreateInput) {
  return apiFetch<Announcement>("/admin/cms/announcements", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateAnnouncement(
  announcementId: string,
  input: AnnouncementUpdateInput
) {
  return apiFetch<Announcement>(`/admin/cms/announcements/${announcementId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function listHomeSections(filters: HomeSectionFilters = {}) {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const queryString = params.toString();
  const data = await apiFetch<unknown>(
    `/admin/cms/home-sections${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  return normalizeList<HomeSection>(data);
}

export async function createHomeSection(input: HomeSectionCreateInput) {
  return apiFetch<HomeSection>("/admin/cms/home-sections", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateHomeSection(
  sectionId: string,
  input: HomeSectionUpdateInput
) {
  return apiFetch<HomeSection>(`/admin/cms/home-sections/${sectionId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function reorderHomeSections(input: HomeSectionReorderInput) {
  return apiFetch<{ success: boolean }>(`/admin/cms/home-sections/reorder`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function listPages(filters: PageFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.slug) params.set("slug", filters.slug);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const queryString = params.toString();
  const data = await apiFetch<unknown>(
    `/admin/cms/pages${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
  return normalizeList<CmsPage>(data);
}

export async function createPage(input: CmsPageCreateInput) {
  return apiFetch<CmsPage>("/admin/cms/pages", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePage(pageId: string, input: CmsPageUpdateInput) {
  return apiFetch<CmsPage>(`/admin/cms/pages/${pageId}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function publishPage(pageId: string) {
  return apiFetch<CmsPage>(`/admin/cms/pages/${pageId}/publish`, {
    method: "POST",
  });
}

export async function unpublishPage(pageId: string) {
  return apiFetch<CmsPage>(`/admin/cms/pages/${pageId}/unpublish`, {
    method: "POST",
  });
}

export async function listConfigs(filters: AppConfigFilters = {}) {
  const params = new URLSearchParams();
  if (filters.key) params.set("key", filters.key);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.pageSize) params.set("pageSize", String(filters.pageSize));
  const queryString = params.toString();
  const data = await apiFetch<unknown>(
    `/admin/cms/configs${queryString ? `?${queryString}` : ""}`,
    { method: "GET" },
  );
  return normalizeList<AppConfig>(data);
}

export async function createConfig(input: AppConfigCreateInput) {
  return apiFetch<AppConfig>("/admin/cms/configs", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function publishConfig(configId: string) {
  return apiFetch<{ success: boolean }>(`/admin/cms/configs/${configId}/publish`, {
    method: "POST",
  });
}
