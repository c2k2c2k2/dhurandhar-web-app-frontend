"use client";

export type CmsListResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type CmsConfigStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type AppConfig = {
  id: string;
  key: string;
  version: number;
  status: CmsConfigStatus;
  configJson: Record<string, unknown>;
  createdByUserId?: string | null;
  createdAt?: string;
  publishedAt?: string | null;
};

export type Banner = {
  id: string;
  title: string;
  bodyJson?: Record<string, unknown> | null;
  linkUrl?: string | null;
  target?: string | null;
  priority: number;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Announcement = {
  id: string;
  title: string;
  bodyJson: Record<string, unknown>;
  pinned: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type HomeSection = {
  id: string;
  type: string;
  configJson: Record<string, unknown>;
  orderIndex: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PageStatus = "DRAFT" | "PUBLISHED";

export type CmsPage = {
  id: string;
  slug: string;
  title: string;
  bodyJson: Record<string, unknown>;
  status: PageStatus;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BannerCreateInput = {
  title: string;
  bodyJson?: Record<string, unknown>;
  linkUrl?: string;
  target?: string;
  priority?: number;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
};

export type BannerUpdateInput = Partial<BannerCreateInput>;

export type AnnouncementCreateInput = {
  title: string;
  bodyJson: Record<string, unknown>;
  pinned?: boolean;
  startsAt?: string;
  endsAt?: string;
  isActive?: boolean;
};

export type AnnouncementUpdateInput = Partial<AnnouncementCreateInput>;

export type HomeSectionCreateInput = {
  type: string;
  configJson: Record<string, unknown>;
  orderIndex?: number;
  isActive?: boolean;
};

export type HomeSectionUpdateInput = Partial<HomeSectionCreateInput>;

export type HomeSectionReorderInput = {
  items: { id: string; orderIndex: number }[];
};

export type CmsPageCreateInput = {
  slug: string;
  title: string;
  bodyJson: Record<string, unknown>;
  status?: PageStatus;
};

export type CmsPageUpdateInput = Partial<CmsPageCreateInput>;

export type AppConfigCreateInput = {
  key: string;
  configJson: Record<string, unknown>;
};
