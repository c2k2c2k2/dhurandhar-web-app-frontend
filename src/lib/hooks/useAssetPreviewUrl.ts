"use client";

import * as React from "react";
import { getAccessToken } from "@/lib/auth/tokenStore";
import {
  handleAuthFailureRedirect,
  isSessionTerminationCode,
} from "@/lib/auth/sessionErrors";
import { getAssetUrl } from "@/lib/api/assets";

type AssetPreviewState = {
  url: string | null;
  loading: boolean;
  error: string | null;
  contentType: string | null;
};

export function useAssetPreviewUrl(assetId?: string | null): AssetPreviewState {
  const [state, setState] = React.useState<AssetPreviewState>({
    url: null,
    loading: false,
    error: null,
    contentType: null,
  });
  const objectUrlRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!assetId) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setState({ url: null, loading: false, error: null, contentType: null });
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const token = getAccessToken();
    fetch(getAssetUrl(assetId), {
      signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then(async (response) => {
        if (!response.ok) {
          const contentType = response.headers.get("content-type") || "";
          let message = "Failed to load asset.";
          let code: string | undefined;
          if (contentType.includes("application/json")) {
            const payload = (await response.json()) as {
              message?: string;
              code?: string;
            };
            if (payload?.message) {
              message = payload.message;
            }
            if (payload?.code) {
              code = payload.code;
            }
          } else {
            const text = await response.text();
            if (text) {
              message = text;
            }
          }

          if (response.status === 401 && isSessionTerminationCode(code)) {
            handleAuthFailureRedirect(code);
          }

          throw new Error(message);
        }
        const contentType = response.headers.get("content-type");
        const blob = await response.blob();
        return { blob, contentType };
      })
      .then(({ blob, contentType }) => {
        if (cancelled) return;
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
        }
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setState({
          url,
          loading: false,
          error: null,
          contentType: contentType || null,
        });
      })
      .catch((err) => {
        if (cancelled || err?.name === "AbortError") return;
        setState({
          url: null,
          loading: false,
          error: err?.message || "Preview failed.",
          contentType: null,
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [assetId]);

  React.useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  return state;
}
