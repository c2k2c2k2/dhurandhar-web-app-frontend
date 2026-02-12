"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";
import { useToast } from "@/modules/shared/components/Toast";

type UploadInitResponse = {
  fileAssetId?: string;
  presignedPutUrl?: string;
  uploadUrl?: string;
  contentType?: string;
  fileName?: string;
  sizeBytes?: number;
};

export type UploadedFile = {
  fileAssetId: string;
  fileName: string;
  sizeBytes: number;
  contentType: string;
  previewUrl?: string;
};

type FileUploadProps = {
  purpose: string;
  accept?: string;
  maxBytes?: number;
  onComplete: (file: UploadedFile) => void;
};

function uploadToPresignedUrl(
  url: string,
  file: File,
  contentType: string | undefined,
  onProgress: (percent: number) => void
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    if (contentType) {
      xhr.setRequestHeader("Content-Type", contentType);
    }
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
  });
}

export function FileUpload({
  purpose,
  accept,
  maxBytes,
  onComplete,
}: FileUploadProps) {
  const { toast } = useToast();
  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    if (maxBytes && file.size > maxBytes) {
      toast({
        title: "File too large",
        description: "Please upload a smaller file.",
        variant: "destructive",
      });
      return;
    }

    setBusy(true);
    setProgress(0);
    const previewUrl = URL.createObjectURL(file);

    try {
      const initPayload = {
        purpose,
        fileName: file.name,
        sizeBytes: file.size,
        contentType: file.type || "application/octet-stream",
      };

      const initResponse = await apiFetch<UploadInitResponse>(
        "/admin/files/init-upload",
        {
          method: "POST",
          body: JSON.stringify(initPayload),
        }
      );

      const fileAssetId =
        initResponse.fileAssetId || (initResponse as Record<string, unknown>).id;
      const presignedPutUrl =
        initResponse.presignedPutUrl || initResponse.uploadUrl;

      if (!fileAssetId || !presignedPutUrl) {
        throw new Error("Upload session missing");
      }

      await uploadToPresignedUrl(
        presignedPutUrl,
        file,
        initResponse.contentType || file.type,
        setProgress
      );

      const confirmResponse = await apiFetch<Partial<UploadedFile> | undefined>(
        `/admin/files/confirm-upload/${fileAssetId}`,
        {
          method: "POST",
          body: JSON.stringify({ fileAssetId }),
        }
      );

      onComplete({
        fileAssetId: String(fileAssetId),
        fileName: confirmResponse?.fileName || file.name,
        sizeBytes: confirmResponse?.sizeBytes || file.size,
        contentType: confirmResponse?.contentType || file.type,
        previewUrl,
      });

      toast({
        title: "Upload complete",
        description: "Your file has been uploaded.",
      });
    } catch (err) {
      URL.revokeObjectURL(previewUrl);
      toast({
        title: "Upload failed",
        description:
          err && typeof err === "object" && "message" in err
            ? String(err.message)
            : "Unable to upload file.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
      setProgress(0);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleFile(file);
          }
        }}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
      >
        {busy ? "Uploading..." : "Upload File"}
      </Button>
      {busy ? (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
