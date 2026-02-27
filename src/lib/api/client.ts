import {
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth/tokenStore";
import {
  handleAuthFailureRedirect,
  isSessionTerminationCode,
} from "@/lib/auth/sessionErrors";

export type ApiError = {
  message: string;
  code?: string;
  requestId?: string;
  status?: number;
};

type ApiOptions = RequestInit & {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

function resolveUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${API_BASE_URL}${path}`;
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

async function normalizeError(response: Response): Promise<ApiError> {
  let message = "Request failed";
  let code: string | undefined;
  let requestId: string | undefined;

  try {
    const data = await parseResponseBody(response);
    if (data && typeof data === "object") {
      const typed = data as Record<string, unknown>;
      if (typeof typed.message === "string") {
        message = typed.message;
      }
      if (typeof typed.code === "string") {
        code = typed.code;
      }
      if (typeof typed.requestId === "string") {
        requestId = typed.requestId;
      }
    }
  } catch {
    // ignore parse errors
  }

  return {
    message,
    code,
    requestId,
    status: response.status,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await normalizeError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await parseResponseBody(response)) as T;
}

async function refreshTokens() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return { ok: false as const };
  }

  try {
    const response = await fetch(resolveUrl("/auth/refresh"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const error = await normalizeError(response);
      return { ok: false as const, code: error.code };
    }

    const data = (await parseResponseBody(response)) as Record<string, unknown>;
    const accessToken =
      (data?.accessToken as string | undefined) ||
      (data?.access as string | undefined);
    const newRefreshToken =
      (data?.refreshToken as string | undefined) ||
      (data?.refresh as string | undefined) ||
      refreshToken;

    if (!accessToken) {
      return { ok: false as const };
    }

    setTokens(accessToken, newRefreshToken);
    return { ok: true as const };
  } catch {
    return { ok: false as const };
  }
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { auth = true, retryOnUnauthorized = true, ...init } = options;
  const headers = new Headers(init.headers);

  if (auth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  }

  const requestInit: RequestInit = {
    ...init,
    headers,
  };

  const response = await fetch(resolveUrl(path), requestInit);

  if (response.status === 401 && retryOnUnauthorized) {
    const unauthorizedError = await normalizeError(response.clone());

    if (isSessionTerminationCode(unauthorizedError.code)) {
      handleAuthFailureRedirect(unauthorizedError.code);
      throw unauthorizedError;
    }

    const refreshResult = await refreshTokens();
    if (refreshResult.ok) {
      const retryHeaders = new Headers(headers);
      const token = getAccessToken();
      if (token) {
        retryHeaders.set("Authorization", `Bearer ${token}`);
      }
      const retryResponse = await fetch(resolveUrl(path), {
        ...requestInit,
        headers: retryHeaders,
      });
      return handleResponse<T>(retryResponse);
    }

    handleAuthFailureRedirect(refreshResult.code ?? unauthorizedError.code);
    throw unauthorizedError;
  }

  return handleResponse<T>(response);
}
