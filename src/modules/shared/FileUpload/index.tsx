"use client";

import * as React from "react";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  centerCrop,
  makeAspectCrop,
} from "react-image-crop";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api/client";
import { Modal } from "@/modules/shared/components/Modal";
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

type CropDialogState = {
  file: File;
  sourceUrl: string;
};

const DEFAULT_ASPECT = 4 / 3;
const MIN_CROP_SIZE_PX = 40;

const ASPECT_OPTIONS = [
  { label: "Free", value: "free" },
  { label: "Original", value: "original" },
  { label: "1:1", value: String(1) },
  { label: "4:3", value: String(4 / 3) },
  { label: "16:9", value: String(16 / 9) },
  { label: "3:4", value: String(3 / 4) },
];

const IMAGE_FILE_EXTENSION_REGEX =
  /\.(apng|avif|bmp|gif|heic|heif|ico|jfif|jpe|jpeg|jpg|png|tif|tiff|webp)$/i;
const SVG_FILE_EXTENSION_REGEX = /\.svg$/i;

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

function hasImageFileExtension(fileName: string) {
  return IMAGE_FILE_EXTENSION_REGEX.test(fileName);
}

function isSvgImageFile(file: File) {
  return file.type === "image/svg+xml" || SVG_FILE_EXTENSION_REGEX.test(file.name);
}

function isImageFile(file: File) {
  return file.type.startsWith("image/") || hasImageFileExtension(file.name);
}

function canCropImageFile(file: File) {
  return isImageFile(file) && !isSvgImageFile(file);
}

function getSupportedImageMimeType(mimeType: string) {
  if (
    mimeType === "image/jpeg" ||
    mimeType === "image/png" ||
    mimeType === "image/webp"
  ) {
    return mimeType;
  }
  return "image/png";
}

function getCroppedFileName(fileName: string, mimeType: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "") || "upload-crop";
  if (mimeType === "image/jpeg") {
    return `${baseName}.jpg`;
  }
  if (mimeType === "image/webp") {
    return `${baseName}.webp`;
  }
  return `${baseName}.png`;
}

function resolveAspectByOption(option: string, originalAspect: number) {
  if (option === "free") {
    return undefined;
  }
  if (option === "original") {
    return originalAspect;
  }

  const parsedAspect = Number(option);
  if (Number.isFinite(parsedAspect) && parsedAspect > 0) {
    return parsedAspect;
  }

  return originalAspect;
}

function createCenteredCrop(
  imageWidth: number,
  imageHeight: number,
  aspect: number | undefined
): Crop {
  if (!aspect) {
    return {
      unit: "%",
      x: 5,
      y: 5,
      width: 90,
      height: 90,
    };
  }

  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      imageWidth,
      imageHeight
    ),
    imageWidth,
    imageHeight
  );
}

async function createCroppedBlob(
  imageElement: HTMLImageElement,
  cropAreaPixels: PixelCrop,
  mimeType: string
) {
  if (!imageElement.naturalWidth || !imageElement.naturalHeight) {
    throw new Error("Unable to load image.");
  }

  const renderedWidth = imageElement.width || imageElement.naturalWidth;
  const renderedHeight = imageElement.height || imageElement.naturalHeight;
  const scaleX = imageElement.naturalWidth / renderedWidth;
  const scaleY = imageElement.naturalHeight / renderedHeight;

  const pixelWidth = Math.max(1, Math.round(cropAreaPixels.width * scaleX));
  const pixelHeight = Math.max(1, Math.round(cropAreaPixels.height * scaleY));
  const sourceX = Math.round(cropAreaPixels.x * scaleX);
  const sourceY = Math.round(cropAreaPixels.y * scaleY);

  const canvas = document.createElement("canvas");
  canvas.width = pixelWidth;
  canvas.height = pixelHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to initialize image cropper.");
  }

  context.drawImage(
    imageElement,
    sourceX,
    sourceY,
    pixelWidth,
    pixelHeight,
    0,
    0,
    pixelWidth,
    pixelHeight
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to create cropped image."));
          return;
        }
        resolve(blob);
      },
      mimeType,
      mimeType === "image/jpeg" || mimeType === "image/webp" ? 0.92 : undefined
    );
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
  const [cropDialog, setCropDialog] = React.useState<CropDialogState | null>(
    null
  );
  const [crop, setCrop] = React.useState<Crop>({
    unit: "%",
    x: 5,
    y: 5,
    width: 90,
    height: 90,
  });
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop | null>(
    null
  );
  const [aspect, setAspect] = React.useState<number | undefined>(DEFAULT_ASPECT);
  const [originalAspect, setOriginalAspect] = React.useState(DEFAULT_ASPECT);
  const [aspectOption, setAspectOption] = React.useState("original");
  const [cropBusy, setCropBusy] = React.useState(false);
  const [cropError, setCropError] = React.useState<string | null>(null);
  const [cropPreviewUrl, setCropPreviewUrl] = React.useState<string | null>(null);

  const cropSourceRef = React.useRef<string | null>(null);
  const cropPreviewRef = React.useRef<string | null>(null);
  const imageRef = React.useRef<HTMLImageElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const clearCropPreview = React.useCallback(() => {
    if (cropPreviewRef.current) {
      URL.revokeObjectURL(cropPreviewRef.current);
      cropPreviewRef.current = null;
    }
    setCropPreviewUrl(null);
  }, []);

  const closeCropDialog = React.useCallback(() => {
    if (cropSourceRef.current) {
      URL.revokeObjectURL(cropSourceRef.current);
      cropSourceRef.current = null;
    }
    setCropDialog(null);
    imageRef.current = null;
    clearCropPreview();
    setCropError(null);
    setCropBusy(false);
    setCompletedCrop(null);
    setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
    setOriginalAspect(DEFAULT_ASPECT);
    setAspect(DEFAULT_ASPECT);
    setAspectOption("original");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [clearCropPreview]);

  const handleUpload = React.useCallback(
    async (file: File) => {
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
    },
    [maxBytes, onComplete, purpose, toast]
  );

  const openCropDialog = React.useCallback(
    (file: File) => {
      const sourceUrl = URL.createObjectURL(file);

      if (cropSourceRef.current) {
        URL.revokeObjectURL(cropSourceRef.current);
      }
      cropSourceRef.current = sourceUrl;
      imageRef.current = null;

      setCropDialog({ file, sourceUrl });
      setCrop({ unit: "%", x: 5, y: 5, width: 90, height: 90 });
      setCompletedCrop(null);
      setCropError(null);
      setCropBusy(false);
      setOriginalAspect(DEFAULT_ASPECT);
      setAspect(DEFAULT_ASPECT);
      setAspectOption("original");
      clearCropPreview();
    },
    [clearCropPreview]
  );

  const handleFile = async (file: File) => {
    if (canCropImageFile(file)) {
      openCropDialog(file);
      return;
    }

    if (isImageFile(file) && !canCropImageFile(file)) {
      toast({
        title: "Cropping unavailable",
        description: "This image format will be uploaded without cropping.",
      });
    }

    await handleUpload(file);
  };

  const handleAspectChange = (value: string) => {
    setAspectOption(value);

    const nextAspect = resolveAspectByOption(value, originalAspect);
    setAspect(nextAspect);
    setCropError(null);

    const imageElement = imageRef.current;
    if (!imageElement) {
      return;
    }

    setCrop(createCenteredCrop(imageElement.width, imageElement.height, nextAspect));
    setCompletedCrop(null);
  };

  const handleCropImageLoad = React.useCallback(
    (event: React.SyntheticEvent<HTMLImageElement>) => {
      const imageElement = event.currentTarget;
      imageRef.current = imageElement;

      const nextOriginalAspect =
        imageElement.naturalWidth && imageElement.naturalHeight
          ? imageElement.naturalWidth / imageElement.naturalHeight
          : DEFAULT_ASPECT;

      setOriginalAspect(nextOriginalAspect);

      const nextAspect = resolveAspectByOption(aspectOption, nextOriginalAspect);
      setAspect(nextAspect);
      setCrop(
        createCenteredCrop(imageElement.width, imageElement.height, nextAspect)
      );
      setCompletedCrop(null);
      setCropError(null);
    },
    [aspectOption]
  );

  const handleCropAndUpload = async () => {
    const imageElement = imageRef.current;
    if (!cropDialog || !completedCrop || !imageElement) {
      setCropError("Please select a crop area before uploading.");
      return;
    }

    if (completedCrop.width < 1 || completedCrop.height < 1) {
      setCropError("Please select a larger crop area.");
      return;
    }

    setCropBusy(true);
    setCropError(null);

    try {
      const targetMimeType = getSupportedImageMimeType(cropDialog.file.type);
      const croppedBlob = await createCroppedBlob(
        imageElement,
        completedCrop,
        targetMimeType
      );

      const croppedFile = new File(
        [croppedBlob],
        getCroppedFileName(cropDialog.file.name, croppedBlob.type || targetMimeType),
        {
          type: croppedBlob.type || targetMimeType,
          lastModified: Date.now(),
        }
      );

      closeCropDialog();
      await handleUpload(croppedFile);
    } catch (err) {
      setCropError(
        err && typeof err === "object" && "message" in err
          ? String(err.message)
          : "Unable to crop image."
      );
      setCropBusy(false);
    }
  };

  React.useEffect(() => {
    const imageElement = imageRef.current;

    if (
      !cropDialog ||
      !completedCrop ||
      completedCrop.width < 1 ||
      completedCrop.height < 1 ||
      !imageElement
    ) {
      clearCropPreview();
      return;
    }

    let cancelled = false;
    const targetMimeType = getSupportedImageMimeType(cropDialog.file.type);

    void createCroppedBlob(imageElement, completedCrop, targetMimeType)
      .then((blob) => {
        if (cancelled) {
          return;
        }

        const previewObjectUrl = URL.createObjectURL(blob);
        if (cropPreviewRef.current) {
          URL.revokeObjectURL(cropPreviewRef.current);
        }
        cropPreviewRef.current = previewObjectUrl;
        setCropPreviewUrl(previewObjectUrl);
      })
      .catch(() => {
        if (!cancelled) {
          clearCropPreview();
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clearCropPreview, completedCrop, cropDialog]);

  React.useEffect(
    () => () => {
      if (cropSourceRef.current) {
        URL.revokeObjectURL(cropSourceRef.current);
      }
      if (cropPreviewRef.current) {
        URL.revokeObjectURL(cropPreviewRef.current);
      }
    },
    []
  );

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
            void handleFile(file);
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

      <Modal
        open={Boolean(cropDialog)}
        onOpenChange={(open) => {
          if (open || cropBusy) {
            return;
          }
          closeCropDialog();
        }}
        title="Crop image"
        description="Drag the crop area with mouse, resize it, preview, then upload."
        className="max-w-5xl"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              onClick={closeCropDialog}
              disabled={cropBusy || busy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                void handleCropAndUpload();
              }}
              disabled={cropBusy || busy || !completedCrop}
            >
              {cropBusy ? "Processing..." : "Crop & upload"}
            </Button>
          </>
        }
      >
        {cropDialog ? (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="overflow-auto rounded-2xl border border-border bg-muted p-2">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => {
                    setCrop(percentCrop);
                  }}
                  onComplete={(pixelCrop) => {
                    setCompletedCrop(pixelCrop.width > 0 && pixelCrop.height > 0 ? pixelCrop : null);
                  }}
                  aspect={aspect}
                  minWidth={MIN_CROP_SIZE_PX}
                  minHeight={MIN_CROP_SIZE_PX}
                  keepSelection
                  ruleOfThirds
                >
                  <img
                    src={cropDialog.sourceUrl}
                    alt="Selected image"
                    onLoad={handleCropImageLoad}
                    className="max-h-[420px] w-auto max-w-full object-contain"
                  />
                </ReactCrop>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Aspect ratio
                  </label>
                  <select
                    value={aspectOption}
                    onChange={(event) => handleAspectChange(event.target.value)}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    disabled={cropBusy}
                  >
                    {ASPECT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-xs text-muted-foreground">
                  Tip: choose <strong>Free</strong> to draw/resize any crop box with mouse.
                </p>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Preview</p>
                  <div className="overflow-hidden rounded-2xl border border-border bg-muted">
                    {cropPreviewUrl ? (
                      <img
                        src={cropPreviewUrl}
                        alt="Cropped preview"
                        className="h-44 w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-44 items-center justify-center px-3 text-center text-xs text-muted-foreground">
                        Draw or resize the crop area to preview the result.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {cropError ? (
              <p className="text-sm text-destructive">{cropError}</p>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
