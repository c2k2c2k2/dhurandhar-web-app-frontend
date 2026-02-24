"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/modules/shared/components/PageHeader";

const BUNDLED_FONT_CANDIDATES = [
  { url: "/fonts/S0708892-nohint.woff", label: "S0708892-nohint.woff", mime: "font/woff" },
  { url: "/fonts/S0708892-nohint.ttf", label: "S0708892-nohint.ttf", mime: "font/ttf" },
  { url: "/fonts/S0708892-webfix.woff", label: "S0708892-webfix.woff", mime: "font/woff" },
  { url: "/fonts/S0708892-webfix.ttf", label: "S0708892-webfix.ttf", mime: "font/ttf" },
  { url: "/fonts/S0708892.woff", label: "S0708892.woff", mime: "font/woff" },
  { url: "/fonts/S0708892.ttf", label: "S0708892.ttf", mime: "font/ttf" },
] as const;
const DEFAULT_TEXT = [
  "Paste text copied from PDF here and compare rendering.",
  "मराठी (Unicode) नमुना मजकूर: गणित, विज्ञान, इतिहास.",
  "Legacy text from old systems may look like ASCII/garbled until correct font is applied.",
].join("\n\n");

type LoadState = {
  type: "idle" | "success" | "error";
  message: string;
};

function buildCharSummary(text: string) {
  const chars = [...text];
  const total = chars.length;
  const devanagari = chars.filter((ch) => {
    const code = ch.codePointAt(0) ?? 0;
    return (
      (code >= 0x0900 && code <= 0x097f) ||
      (code >= 0xa8e0 && code <= 0xa8ff)
    );
  }).length;
  const ascii = chars.filter((ch) => {
    const code = ch.codePointAt(0) ?? 0;
    return code >= 0x20 && code <= 0x7e;
  }).length;
  return { total, devanagari, ascii };
}

export default function AdminFontTestPage() {
  const [text, setText] = React.useState(DEFAULT_TEXT);
  const [fontSize, setFontSize] = React.useState(28);
  const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
  const [activeFamily, setActiveFamily] = React.useState<string>("");
  const [activeFontLabel, setActiveFontLabel] = React.useState<string>("");
  const [attemptLogs, setAttemptLogs] = React.useState<string[]>([]);
  const [loadState, setLoadState] = React.useState<LoadState>({
    type: "idle",
    message: "Load a font to start testing.",
  });

  const activeFontRef = React.useRef<FontFace | null>(null);
  const activeFontUrlRef = React.useRef<string | null>(null);

  const removeActiveFont = React.useCallback(() => {
    if (activeFontRef.current) {
      document.fonts.delete(activeFontRef.current);
      activeFontRef.current = null;
    }
    if (activeFontUrlRef.current) {
      URL.revokeObjectURL(activeFontUrlRef.current);
      activeFontUrlRef.current = null;
    }
    setActiveFamily("");
    setActiveFontLabel("");
  }, []);

  const pushLog = React.useCallback((message: string) => {
    setAttemptLogs((current) => [`${new Date().toLocaleTimeString()} - ${message}`, ...current].slice(0, 12));
  }, []);

  const loadBinaryAsFont = React.useCallback(
    async (binary: ArrayBuffer, label: string, mimeType = "font/ttf") => {
      removeActiveFont();
      const blob = new Blob([binary], { type: mimeType });
      const fontUrl = URL.createObjectURL(blob);
      const family = `font-test-${Date.now()}`;
      const fontFace = new FontFace(family, `url(${fontUrl})`);

      await fontFace.load();
      document.fonts.add(fontFace);
      await document.fonts.load(`16px "${family}"`);

      activeFontRef.current = fontFace;
      activeFontUrlRef.current = fontUrl;
      setActiveFamily(family);
      setActiveFontLabel(label);
      setLoadState({
        type: "success",
        message: `Loaded: ${label}`,
      });
      pushLog(`FontFace loaded from binary: ${label}`);
    },
    [pushLog, removeActiveFont]
  );

  const loadUploadedFont = React.useCallback(async () => {
    if (!uploadedFile) {
      setLoadState({
        type: "error",
        message: "Select a .ttf/.otf/.woff font file first.",
      });
      return;
    }
    try {
      setLoadState({ type: "idle", message: "Loading uploaded font..." });
      const binary = await uploadedFile.arrayBuffer();
      await loadBinaryAsFont(
        binary,
        `${uploadedFile.name} (${Math.round(uploadedFile.size / 1024)} KB)`,
        uploadedFile.type || "font/ttf"
      );
    } catch (error) {
      setLoadState({
        type: "error",
        message:
          error instanceof Error
            ? `Failed to load uploaded font: ${error.message}`
            : "Failed to load uploaded font.",
      });
    }
  }, [loadBinaryAsFont, uploadedFile]);

  const loadBundledFont = React.useCallback(async () => {
    setAttemptLogs([]);

    const tryLoadCandidate = async (url: string, label: string, mimeType: string) => {
      pushLog(`Trying ${label} (${url})`);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`${label} fetch failed: HTTP ${response.status}`);
      }
      const binary = await response.arrayBuffer();
      if (!binary.byteLength) {
        throw new Error(`${label} is empty`);
      }
      pushLog(`${label} fetched (${Math.round(binary.byteLength / 1024)} KB), testing Blob parse`);

      try {
        await loadBinaryAsFont(binary, `${label} (${Math.round(binary.byteLength / 1024)} KB)`, mimeType);
        pushLog(`${label} parsed from Blob successfully`);
        return;
      } catch (blobError) {
        pushLog(
          `${label} Blob parse failed: ${
            blobError instanceof Error ? `${blobError.name} ${blobError.message}` : "Unknown error"
          }`
        );
      }

      pushLog(`${label} testing direct URL parse`);
      removeActiveFont();
      const family = `font-test-url-${Date.now()}`;
      const fontFace = new FontFace(family, `url("${url}")`);
      await fontFace.load();
      document.fonts.add(fontFace);
      await document.fonts.load(`16px "${family}"`);
      activeFontRef.current = fontFace;
      setActiveFamily(family);
      setActiveFontLabel(`${label} (${Math.round(binary.byteLength / 1024)} KB)`);
      setLoadState({
        type: "success",
        message: `Loaded: ${label}`,
      });
      pushLog(`${label} parsed from URL successfully`);
    };

    try {
      setLoadState({
        type: "idle",
        message: "Loading bundled font (trying multiple candidates)...",
      });

      let lastError: unknown = null;
      for (const candidate of BUNDLED_FONT_CANDIDATES) {
        try {
          await tryLoadCandidate(candidate.url, candidate.label, candidate.mime);
          return;
        } catch (error) {
          lastError = error;
          pushLog(
            `${candidate.label} failed: ${
              error instanceof Error ? `${error.name} ${error.message}` : "Unknown error"
            }`
          );
        }
      }
      throw lastError ?? new Error("No bundled candidate could be loaded.");
    } catch (error) {
      setLoadState({
        type: "error",
        message:
          error instanceof Error
            ? `Failed to load bundled font: ${error.name} ${error.message}`
            : "Failed to load bundled font.",
      });
    }
  }, [loadBinaryAsFont, pushLog, removeActiveFont]);

  React.useEffect(() => {
    return () => {
      if (activeFontRef.current) {
        document.fonts.delete(activeFontRef.current);
      }
      if (activeFontUrlRef.current) {
        URL.revokeObjectURL(activeFontUrlRef.current);
      }
    };
  }, []);

  const summary = React.useMemo(() => buildCharSummary(text), [text]);
  const previewStyle: React.CSSProperties = {
    fontFamily: activeFamily
      ? `"${activeFamily}", "Noto Sans Devanagari", sans-serif`
      : `"Noto Sans Devanagari", sans-serif`,
    fontSize: `${fontSize}px`,
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Legacy Font Test"
        description="Temporary test page. Upload a font and paste PDF text to check rendering behavior."
      />

      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>1) Load Font</CardTitle>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <input
              type="file"
              accept=".ttf,.otf,.woff,.woff2,font/ttf,font/otf,font/woff,font/woff2"
              className="rounded-2xl border border-input bg-background px-3 py-2 text-sm"
              onChange={(event) => setUploadedFile(event.target.files?.[0] ?? null)}
            />
            <Button type="button" onClick={loadUploadedFont}>
              <Upload className="h-4 w-4" />
              Load Uploaded
            </Button>
            <Button type="button" variant="secondary" onClick={loadBundledFont}>
              Load Bundled Font
            </Button>
            <Button type="button" variant="outline" onClick={removeActiveFont}>
              Clear Font
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="rounded-xl border border-border bg-muted/30 px-3 py-2">
            {loadState.type === "success" ? (
              <span className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                {loadState.message}
              </span>
            ) : loadState.type === "error" ? (
              <span className="inline-flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                {loadState.message}
              </span>
            ) : (
              <span className="text-muted-foreground">{loadState.message}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Active font: {activeFontLabel || "None"} | Text length: {summary.total} chars |
            Devanagari chars: {summary.devanagari} | ASCII chars: {summary.ascii}
          </p>
          {attemptLogs.length ? (
            <div className="rounded-xl border border-border bg-background p-2">
              <p className="mb-1 text-xs font-medium text-foreground">Load diagnostics</p>
              <div className="space-y-1 text-[11px] text-muted-foreground">
                {attemptLogs.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2) Paste Text From PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste copied text from PDF..."
            className="min-h-[180px] w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground">Preview size: {fontSize}px</label>
            <input
              type="range"
              min={14}
              max={56}
              value={fontSize}
              onChange={(event) => setFontSize(Number(event.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>3) Baseline (Default Font)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[260px] rounded-2xl border border-border bg-background p-4 whitespace-pre-wrap break-words">
              {text}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4) Test Rendering (Loaded Font)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="min-h-[260px] rounded-2xl border border-border bg-background p-4" style={previewStyle}>
              {text || "Preview will appear here."}
            </div>
            <input
              type="text"
              placeholder="Type directly with loaded font..."
              className="h-11 w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm"
              style={previewStyle}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
