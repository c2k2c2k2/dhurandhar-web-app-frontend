"use client";

import * as React from "react";
import * as pdfjsLib from "pdfjs-dist";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAccessToken } from "@/lib/auth/tokenStore";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export function PdfCanvasViewer({
  noteId,
  viewToken,
  onPageChange,
  onReady,
  onError,
}: {
  noteId: string;
  viewToken: string;
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
  const [doc, setDoc] = React.useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [pageNumber, setPageNumber] = React.useState(1);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [zoom, setZoom] = React.useState(1);
  const [loading, setLoading] = React.useState(false);

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
    if (!noteId || !viewToken) {
      docRef.current?.destroy();
      docRef.current = null;
      setDoc(null);
      setPageCount(0);
      return;
    }

    let cancelled = false;
    let didLoad = false;
    setLoading(true);
    setDoc(null);
    setPageCount(0);

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
        setPageNumber(1);
        onReadyRef.current?.(pdf.numPages);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        onErrorRef.current?.(
          error instanceof Error ? error.message : "Failed to load PDF"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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
    if (!doc || docRef.current !== doc || (doc as { destroyed?: boolean }).destroyed) {
      return;
    }
    if (!canvasRef.current || !containerWidth) return;

    let cancelled = false;
    const activeDoc = doc;

    const render = async () => {
      try {
        const page = await activeDoc.getPage(pageNumber);
        if (cancelled || docRef.current !== activeDoc) return;
        const viewport = page.getViewport({ scale: 1 });
        const baseScale = containerWidth / viewport.width;
        const scale = Math.max(0.6, Math.min(baseScale * zoom, 2.2));
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

        renderTaskRef.current = page.render({
          canvasContext: context,
          viewport: scaledViewport,
        });
        await renderTaskRef.current.promise;
        if (cancelled || docRef.current !== activeDoc) return;
        onPageChangeRef.current?.(pageNumber, pageCount);
      } catch (error) {
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
  }, [doc, pageNumber, containerWidth, zoom, pageCount, onPageChange]);

  const canGoPrev = pageNumber > 1;
  const canGoNext = pageNumber < pageCount;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => canGoPrev && setPageNumber((prev) => prev - 1)}
            disabled={!canGoPrev}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>
            Page {pageNumber} of {pageCount || "--"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => canGoNext && setPageNumber((prev) => prev + 1)}
            disabled={!canGoNext}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((prev) => Math.max(0.8, prev - 0.1))}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span>{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((prev) => Math.min(1.6, prev + 0.1))}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex min-h-[360px] items-center justify-center overflow-auto rounded-3xl border border-border bg-background p-4"
        onContextMenu={(event) => event.preventDefault()}
      >
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading document...</p>
        ) : null}
        <canvas ref={canvasRef} className="max-w-full" />
      </div>
    </div>
  );
}
