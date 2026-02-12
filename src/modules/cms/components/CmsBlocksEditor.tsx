"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/modules/shared/FileUpload";
import { useAssetPreviewUrl } from "@/lib/hooks/useAssetPreviewUrl";
import { badgeClass, type CmsBlock } from "../utils";

type CmsBlocksEditorProps = {
  label: string;
  description?: string;
  error?: string;
  blocks: CmsBlock[];
  onChange: (next: CmsBlock[]) => void;
  uploadPurpose?: string;
};

function BlockCard({
  block,
  onChange,
  onRemove,
  uploadPurpose,
}: {
  block: CmsBlock;
  onChange: (next: CmsBlock) => void;
  onRemove: () => void;
  uploadPurpose: string;
}) {
  const assetPreview = useAssetPreviewUrl(
    block.imageAssetId && !block.imagePreviewUrl ? block.imageAssetId : undefined
  );
  const previewUrl = block.imagePreviewUrl || assetPreview.url;

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-background p-4">
      <textarea
        className={cn(
          "min-h-[90px] w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
        placeholder="Write content..."
        value={block.text}
        onChange={(event) => onChange({ ...block, text: event.target.value })}
      />
      <div className="flex flex-wrap items-center gap-3">
        <FileUpload
          purpose={uploadPurpose}
          accept="image/png,image/jpeg,image/webp"
          onComplete={(file) =>
            onChange({
              ...block,
              imageAssetId: file.fileAssetId,
              imagePreviewUrl: file.previewUrl,
            })
          }
        />
        {block.imageAssetId ? (
          <span className={badgeClass(true)}>Image attached</span>
        ) : (
          <span className={badgeClass(false)}>No image</span>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
        >
          Remove block
        </Button>
      </div>
      {previewUrl ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          <img
            src={previewUrl}
            alt="Block preview"
            className="h-auto w-full object-contain"
          />
        </div>
      ) : null}
      {block.imageAssetId && !previewUrl && assetPreview.loading ? (
        <p className="text-xs text-muted-foreground">Loading image preview...</p>
      ) : null}
      {block.imageAssetId && assetPreview.error ? (
        <p className="text-xs text-destructive">Unable to load image preview.</p>
      ) : null}
    </div>
  );
}

export function CmsBlocksEditor({
  label,
  description,
  error,
  blocks,
  onChange,
  uploadPurpose = "OTHER",
}: CmsBlocksEditorProps) {
  const handleAdd = () => {
    onChange([
      ...blocks,
      {
        id: `block_${Math.random().toString(36).slice(2, 10)}`,
        text: "",
      },
    ]);
  };

  const handleRemove = (index: number) => {
    const next = [...blocks];
    const removed = next.splice(index, 1);
    removed.forEach((block) => {
      if (block.imagePreviewUrl) {
        URL.revokeObjectURL(block.imagePreviewUrl);
      }
    });
    if (!next.length) {
      next.push({ id: `block_${Math.random().toString(36).slice(2, 10)}`, text: "" });
    }
    onChange(next);
  };

  const handleChange = (index: number, nextBlock: CmsBlock) => {
    const next = [...blocks];
    const previous = next[index];
    if (previous?.imagePreviewUrl && previous.imagePreviewUrl !== nextBlock.imagePreviewUrl) {
      URL.revokeObjectURL(previous.imagePreviewUrl);
    }
    next[index] = nextBlock;
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
      </div>
      {description ? (
        <p className="text-xs text-muted-foreground">{description}</p>
      ) : null}
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <BlockCard
            key={block.id}
            block={block}
            uploadPurpose={uploadPurpose}
            onChange={(nextBlock) => handleChange(index, nextBlock)}
            onRemove={() => handleRemove(index)}
          />
        ))}
      </div>
      <Button type="button" variant="secondary" onClick={handleAdd}>
        Add block
      </Button>
    </div>
  );
}
