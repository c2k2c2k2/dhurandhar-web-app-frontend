"use client";

import * as React from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Shield,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAccessToken } from "@/lib/auth/tokenStore";
import { cn } from "@/lib/utils";
import type { WatermarkPayload } from "@/modules/student-notes/types";
import { WatermarkOverlay } from "@/modules/student-notes/viewer/WatermarkOverlay";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
const MAX_BASE_PAGE_WIDTH = 860;
const MIN_ZOOM = 1;
const MAX_ZOOM = 2.4;
const ZOOM_STEP = 0.15;

function clampPage(page: number, pageCount: number) {
  if (!pageCount) return 1;
  return Math.min(Math.max(Math.trunc(page), 1), pageCount);
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable
  );
}

export function PdfCanvasViewer({
  noteId,
  viewToken,
  initialPage = 1,
  initialPageReady = true,
  watermarkPayload,
  onPageChange,
  onReady,
  onError,
}: {
  noteId: string;
  viewToken: string;
  initialPage?: number;
  initialPageReady?: boolean;
  watermarkPayload?: WatermarkPayload;
  onPageChange?: (page: number, totalPages: number) => void;
  onReady?: (totalPages: number) => void;
  onError?: (message: string) => void;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const docRef = React.useRef<pdfjsLib.PDFDocumentProxy | null>(null);
  const renderTaskRef = React.useRef<pdfjsLib.RenderTask | null>(null);
  const onReadyRef = React.useRef<typeof onReady>(undefined);
  const onErrorRef = React.useRef<typeof onError>(undefined);
  const onPageChangeRef = React.useRef<typeof onPageChange>(undefined);
  const hasAppliedInitialPageRef = React.useRef(false);
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const [doc, setDoc] = React.useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [pageInput, setPageInput] = React.useState("1");
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [zoom, setZoom] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [pageDimensions, setPageDimensions] = React.useState<{
    width: number;
    height: number;
  } | null>(null);
  const [turnDirection, setTurnDirection] = React.useState<"next" | "prev" | null>(null);

  React.useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  React.useEffect(() => {
    onPageChangeRef.current = onPageChange;
  }, [onPageChange]);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setContainerWidth(el.clientWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    hasAppliedInitialPageRef.current = false;
    touchStartRef.current = null;
    setDoc(null);
    setPageCount(0);
    setPageNumber(1);
    setPageInput("1");
    setZoom(1);
    setPageDimensions(null);
    setTurnDirection(null);

    if (!noteId || !viewToken) {
      docRef.current?.destroy();
      docRef.current = null;
      return;
    }

    let cancelled = false;
    let didLoad = false;
    setLoading(true);

    const token = getAccessToken();
    const url = `${API_BASE_URL}/notes/${noteId}/content?token=${encodeURIComponent(
      viewToken
    )}`;

    const loadingTask = pdfjsLib.getDocument({
      url,
      httpHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      rangeChunkSize: 65536,
      withCredentials: false,
    });

    loadingTask.promise
      .then((pdf) => {
        if (cancelled) return;
        didLoad = true;
        docRef.current = pdf;
        setDoc(pdf);
        setPageCount(pdf.numPages);
        onReadyRef.current?.(pdf.numPages);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        onErrorRef.current?.(
          error instanceof Error ? error.message : "Failed to load PDF"
        );
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      const docToDestroy = docRef.current;
      docRef.current = null;
      if (didLoad) {
        void docToDestroy?.destroy();
      } else {
        loadingTask.destroy();
      }
    };
  }, [noteId, viewToken]);

  React.useEffect(() => {
    if (!pageCount || !initialPageReady || hasAppliedInitialPageRef.current) return;
    hasAppliedInitialPageRef.current = true;
    const targetPage = clampPage(initialPage, pageCount);
    setPageNumber(targetPage);
    setPageInput(String(targetPage));
  }, [initialPage, initialPageReady, pageCount]);

  React.useEffect(() => {
    setPageInput(String(pageNumber));
  }, [pageNumber]);

  React.useEffect(() => {
    if (turnDirection === null) return;
    const timeout = window.setTimeout(() => setTurnDirection(null), 280);
    return () => window.clearTimeout(timeout);
  }, [turnDirection]);

  React.useEffect(() => {
    if (!doc || docRef.current !== doc || (doc as { destroyed?: boolean }).destroyed) {
      return;
    }
    if (!canvasRef.current || !containerWidth || !initialPageReady) return;
    if (!hasAppliedInitialPageRef.current) return;

    let cancelled = false;
    const activeDoc = doc;

    const render = async () => {
      try {
        const page = await activeDoc.getPage(pageNumber);
        if (cancelled || docRef.current !== activeDoc) return;

        const viewport = page.getViewport({ scale: 1 });
        const availableWidth = Math.max(
          Math.min(containerWidth - 12, MAX_BASE_PAGE_WIDTH),
          220
        );
        const fitScale = availableWidth / viewport.width;
        const scale = fitScale * Math.min(Math.max(zoom, MIN_ZOOM), MAX_ZOOM);
        const scaledViewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        const pixelRatio = window.devicePixelRatio || 1;
        canvas.width = scaledViewport.width * pixelRatio;
        canvas.height = scaledViewport.height * pixelRatio;
        canvas.style.width = `${scaledViewport.width}px`;
        canvas.style.height = `${scaledViewport.height}px`;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        setPageDimensions({
          width: scaledViewport.width,
          height: scaledViewport.height,
        });

        renderTaskRef.current = page.render({
          canvasContext: context,
          viewport: scaledViewport,
        });
        await renderTaskRef.current.promise;

        if (cancelled || docRef.current !== activeDoc) return;
        onPageChangeRef.current?.(pageNumber, pageCount);
      } catch (error) {
        if (
          error instanceof Error &&
          (error.name === "RenderingCancelledException" ||
            error.message.toLowerCase().includes("rendering cancelled"))
        ) {
          return;
        }
        if (!cancelled && onErrorRef.current && error instanceof Error) {
          onErrorRef.current(error.message);
        }
      }
    };

    void render();

    return () => {
      cancelled = true;
      renderTaskRef.current?.cancel();
      renderTaskRef.current = null;
    };
  }, [containerWidth, doc, initialPageReady, pageCount, pageNumber, zoom]);

  const goToPage = React.useCallback(
    (targetPage: number) => {
      if (!pageCount) return;

      const nextPage = clampPage(targetPage, pageCount);
      if (nextPage === pageNumber) return;

      setTurnDirection(nextPage > pageNumber ? "next" : "prev");
      setPageNumber(nextPage);
    },
    [pageCount, pageNumber]
  );

  const changeZoom = React.useCallback((delta: number) => {
    setZoom((current) => {
      const nextValue = Number((current + delta).toFixed(2));
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextValue));
    });
  }, []);

  const handlePageSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const parsed = Number(pageInput);
      if (!Number.isFinite(parsed)) {
        setPageInput(String(pageNumber));
        return;
      }
      goToPage(parsed);
    },
    [goToPage, pageInput, pageNumber]
  );

  const handleTouchStart = React.useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (zoom > 1.05) return;
      const touch = event.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    },
    [zoom]
  );

  const handleTouchEnd = React.useCallback(
    (event: React.TouchEvent<HTMLDivElement>) => {
      if (zoom > 1.05 || !touchStartRef.current) return;

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      if (Math.abs(deltaX) < 70 || Math.abs(deltaX) < Math.abs(deltaY) * 1.35) {
        return;
      }

      if (deltaX < 0) {
        goToPage(pageNumber + 1);
        return;
      }

      goToPage(pageNumber - 1);
    },
    [goToPage, pageNumber, zoom]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();

      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault();
        goToPage(pageNumber - 1);
        return;
      }

      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault();
        goToPage(pageNumber + 1);
        return;
      }

      if (event.key === "Home") {
        event.preventDefault();
        goToPage(1);
        return;
      }

      if (event.key === "End") {
        event.preventDefault();
        goToPage(pageCount);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && (key === "=" || key === "+")) {
        event.preventDefault();
        changeZoom(ZOOM_STEP);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && key === "-") {
        event.preventDefault();
        changeZoom(-ZOOM_STEP);
      }
    },
    [changeZoom, goToPage, pageCount, pageNumber]
  );

  const canGoPrev = pageNumber > 1;
  const canGoNext = pageNumber < pageCount;
  const progressPercent = pageCount ? Math.round((pageNumber / pageCount) * 100) : 0;
  const viewerReady = Boolean(doc && initialPageReady && hasAppliedInitialPageRef.current);
  const zoomPercent = Math.round(zoom * 100);
  const allowHorizontalPan = zoom > 1.02;

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container || !viewerReady) return;

    window.requestAnimationFrame(() => {
      if (!allowHorizontalPan) {
        container.scrollLeft = 0;
        return;
      }

      container.scrollLeft = Math.max(
        0,
        (container.scrollWidth - container.clientWidth) / 2
      );
    });
  }, [allowHorizontalPan, pageNumber, viewerReady, zoom]);

  return (
    <div
      className="flex h-full min-h-[calc(100dvh-23rem)] flex-col gap-3 focus:outline-none sm:min-h-[65vh]"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Secure PDF note viewer"
    >
      <div className="rounded-2xl border border-border bg-card/95 p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
              <Shield className="h-3.5 w-3.5 text-accent" />
              <span className="hidden sm:inline">Protected stream</span>
              <span className="sm:hidden">Protected</span>
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1.5 font-medium text-foreground">
              {pageCount ? `${pageNumber} / ${pageCount}` : "-- / --"}
            </span>
            <span className="rounded-full border border-border/70 bg-background px-3 py-1.5">
              {progressPercent}% read
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => goToPage(pageNumber - 1)}
              disabled={!canGoPrev}
              aria-label="Go to previous page"
              className="h-9 w-9 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => goToPage(pageNumber + 1)}
              disabled={!canGoNext}
              aria-label="Go to next page"
              className="h-9 w-9 rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => goToPage(1)}
              disabled={!canGoPrev}
              aria-label="Go to first page"
              className="hidden h-9 w-9 rounded-xl sm:inline-flex"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              onClick={() => goToPage(pageCount)}
              disabled={!canGoNext}
              aria-label="Go to last page"
              className="hidden h-9 w-9 rounded-xl sm:inline-flex"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
            <form
              onSubmit={handlePageSubmit}
              className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-background px-2 py-1.5 sm:flex-none"
            >
              <label htmlFor="note-page-jump" className="sr-only">
                Jump to page
              </label>
              <Input
                id="note-page-jump"
                type="number"
                min={1}
                max={pageCount || undefined}
                inputMode="numeric"
                value={pageInput}
                onChange={(event) => setPageInput(event.target.value)}
                className="h-8 min-w-0 rounded-lg border-0 bg-transparent px-2 text-center shadow-none focus-visible:ring-1"
                aria-label="Jump to specific page"
              />
              <Button variant="secondary" size="sm" type="submit" className="rounded-lg">
                Go
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => changeZoom(-ZOOM_STEP)}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
            className="h-9 w-9 rounded-xl"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-16 rounded-full border border-border bg-background px-3 py-1.5 text-center text-sm font-medium">
            {zoomPercent}%
          </span>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => changeZoom(ZOOM_STEP)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
            className="h-9 w-9 rounded-xl"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setZoom(1)}
            disabled={zoom === 1}
            className="rounded-xl text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        <p className="mt-3 text-[11px] text-muted-foreground sm:text-xs">
          Swipe or use the side arrows to change pages. Zoom only when you need detail.
        </p>
      </div>

      <div
        ref={containerRef}
        className={cn(
          "relative flex-1 overflow-y-auto overscroll-contain scroll-smooth rounded-[28px] border border-border bg-muted/15 p-1.5 sm:p-4",
          allowHorizontalPan ? "overflow-x-auto" : "overflow-x-hidden"
        )}
        onContextMenu={(event) => event.preventDefault()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: allowHorizontalPan ? "pan-x pan-y" : "pan-y",
        }}
      >
        <Button
          variant="secondary"
          size="icon"
          onClick={() => goToPage(pageNumber - 1)}
          disabled={!canGoPrev}
          aria-label="Previous page"
          className="absolute left-1.5 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border border-border/50 bg-background/40 text-foreground shadow-none backdrop-blur-[2px] sm:left-3 sm:bg-background/60"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          variant="secondary"
          size="icon"
          onClick={() => goToPage(pageNumber + 1)}
          disabled={!canGoNext}
          aria-label="Next page"
          className="absolute right-1.5 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full border border-border/50 bg-background/40 text-foreground shadow-none backdrop-blur-[2px] sm:right-3 sm:bg-background/60"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="mx-auto flex min-h-[320px] w-max items-start justify-center py-0 sm:py-2">
          <div
            className={cn(
              "relative overflow-hidden rounded-[24px] bg-white shadow-[0_16px_36px_-24px_rgba(15,23,42,0.35)]",
              turnDirection === "next" && "animate-note-page-turn-next",
              turnDirection === "prev" && "animate-note-page-turn-prev"
            )}
            style={{
              width: pageDimensions?.width ? `${pageDimensions.width}px` : undefined,
              minHeight: pageDimensions?.height ? `${pageDimensions.height}px` : "320px",
            }}
          >
            {!viewerReady || loading ? (
              <div className="flex min-h-[320px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
                {loading ? "Loading document..." : "Restoring your reading position..."}
              </div>
            ) : null}

            <canvas
              ref={canvasRef}
              className={cn("block", !viewerReady || loading ? "opacity-0" : "opacity-100")}
            />

            {viewerReady && !loading ? (
              <WatermarkOverlay payload={watermarkPayload} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
