"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as api from "./api";
import type {
  AnnouncementCreateInput,
  AnnouncementUpdateInput,
  AppConfigCreateInput,
  BannerCreateInput,
  BannerUpdateInput,
  CmsPageCreateInput,
  CmsPageUpdateInput,
  HomeSectionCreateInput,
  HomeSectionReorderInput,
  HomeSectionUpdateInput,
} from "./types";
import type {
  AnnouncementFilters,
  AppConfigFilters,
  BannerFilters,
  HomeSectionFilters,
  PageFilters,
} from "./api";

const bannersKey = (filters: BannerFilters) => ["admin", "cms", "banners", filters];
const announcementsKey = (filters: AnnouncementFilters) => [
  "admin",
  "cms",
  "announcements",
  filters,
];
const homeSectionsKey = (filters: HomeSectionFilters) => [
  "admin",
  "cms",
  "home-sections",
  filters,
];
const pagesKey = (filters: PageFilters) => ["admin", "cms", "pages", filters];
const configsKey = (filters: AppConfigFilters) => ["admin", "cms", "configs", filters];

export function useBanners(filters: BannerFilters = {}) {
  return useQuery({
    queryKey: bannersKey(filters),
    queryFn: () => api.listBanners(filters),
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BannerCreateInput) => api.createBanner(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "cms", "banners"] });
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bannerId,
      input,
    }: {
      bannerId: string;
      input: BannerUpdateInput;
    }) => api.updateBanner(bannerId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "cms", "banners"] });
    },
  });
}

export function useAnnouncements(filters: AnnouncementFilters = {}) {
  return useQuery({
    queryKey: announcementsKey(filters),
    queryFn: () => api.listAnnouncements(filters),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AnnouncementCreateInput) => api.createAnnouncement(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "cms", "announcements"],
      });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      announcementId,
      input,
    }: {
      announcementId: string;
      input: AnnouncementUpdateInput;
    }) => api.updateAnnouncement(announcementId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "cms", "announcements"],
      });
    },
  });
}

export function useHomeSections(filters: HomeSectionFilters = {}) {
  return useQuery({
    queryKey: homeSectionsKey(filters),
    queryFn: () => api.listHomeSections(filters),
  });
}

export function useCreateHomeSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: HomeSectionCreateInput) => api.createHomeSection(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "cms", "home-sections"],
      });
    },
  });
}

export function useUpdateHomeSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sectionId,
      input,
    }: {
      sectionId: string;
      input: HomeSectionUpdateInput;
    }) => api.updateHomeSection(sectionId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "cms", "home-sections"],
      });
    },
  });
}

export function useReorderHomeSections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: HomeSectionReorderInput) => api.reorderHomeSections(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["admin", "cms", "home-sections"],
      });
    },
  });
}

export function usePages(filters: PageFilters = {}) {
  return useQuery({
    queryKey: pagesKey(filters),
    queryFn: () => api.listPages(filters),
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CmsPageCreateInput) => api.createPage(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      pageId,
      input,
    }: {
      pageId: string;
      input: CmsPageUpdateInput;
    }) => api.updatePage(pageId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
    },
  });
}

export function usePublishPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) => api.publishPage(pageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
    },
  });
}

export function useUnpublishPage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pageId: string) => api.unpublishPage(pageId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "cms", "pages"] });
    },
  });
}

export function useConfigs(filters: AppConfigFilters = {}) {
  return useQuery({
    queryKey: configsKey(filters),
    queryFn: () => api.listConfigs(filters),
  });
}

export function useCreateConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AppConfigCreateInput) => api.createConfig(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "cms", "configs"] });
      await queryClient.invalidateQueries({ queryKey: ["student", "plans"] });
      await queryClient.invalidateQueries({ queryKey: ["student", "tests"] });
    },
  });
}

export function usePublishConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (configId: string) => api.publishConfig(configId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "cms", "configs"] });
    },
  });
}
