"use client";

import { cn } from "@/lib/utils";

export type CmsBlock = {
  id: string;
  text: string;
  imageAssetId?: string;
  imagePreviewUrl?: string;
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `block_${Math.random().toString(36).slice(2, 10)}`;
}

function toBlock(value: unknown): CmsBlock | null {
  if (!value) return null;
  if (typeof value === "string") {
    return { id: createId(), text: value };
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const text =
      typeof obj.text === "string"
        ? obj.text
        : typeof obj.content === "string"
          ? obj.content
          : "";
    const imageAssetId =
      typeof obj.imageAssetId === "string"
        ? obj.imageAssetId
        : typeof obj.assetId === "string"
          ? obj.assetId
          : undefined;
    if (!text && !imageAssetId) {
      return null;
    }
    return { id: createId(), text, imageAssetId };
  }
  return null;
}

export function parseCmsBlocks(value: unknown): CmsBlock[] {
  if (!value) {
    return [{ id: createId(), text: "" }];
  }
  if (typeof value === "string") {
    return [{ id: createId(), text: value }];
  }
  if (Array.isArray(value)) {
    const blocks = value
      .map((entry) => toBlock(entry))
      .filter((entry): entry is CmsBlock => Boolean(entry));
    return blocks.length ? blocks : [{ id: createId(), text: "" }];
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (Array.isArray(obj.blocks)) {
      const blocks = obj.blocks
        .map((entry) => toBlock(entry))
        .filter((entry): entry is CmsBlock => Boolean(entry));
      return blocks.length ? blocks : [{ id: createId(), text: "" }];
    }
    const block = toBlock(obj);
    return block ? [block] : [{ id: createId(), text: "" }];
  }
  return [{ id: createId(), text: "" }];
}

export function buildCmsBodyJson(blocks: CmsBlock[]) {
  const normalized = blocks
    .map((block) => ({
      text: block.text?.trim() || undefined,
      imageAssetId: block.imageAssetId || undefined,
    }))
    .filter((block) => block.text || block.imageAssetId);

  if (!normalized.length) {
    return undefined;
  }

  return { blocks: normalized };
}

export function formatDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num: number) => String(num).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function parseDateInput(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function badgeClass(active: boolean) {
  return cn(
    "rounded-full px-2 py-1 text-xs font-medium",
    active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
  );
}
