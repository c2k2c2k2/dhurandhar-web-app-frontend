import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth/tokenStore";

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
    return false;
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
      return false;
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
      return false;
    }

    setTokens(accessToken, newRefreshToken);
    return true;
  } catch {
    return false;
  }
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    const path = window.location.pathname || "";
    if (path.startsWith("/student")) {
      window.location.href = "/student/forbidden";
      return;
    }
    window.location.href = "/admin/login";
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
    const refreshed = await refreshTokens();
    if (refreshed) {
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

    clearTokens();
    redirectToLogin();
  }

  return handleResponse<T>(response);
}
