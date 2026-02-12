export type AuthQueryParams = {
  next?: string | null;
  plan?: string | null;
  from?: string | null;
};

export function isSafeInternalPath(path: string | null | undefined): path is string {
  if (!path) {
    return false;
  }

  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) {
    return false;
  }

  if (trimmed.startsWith("//")) {
    return false;
  }

  const lowered = trimmed.toLowerCase();
  if (lowered.startsWith("/\\") || lowered.includes("javascript:")) {
    return false;
  }

  return true;
}

export function getSafeNext(next?: string | null) {
  return isSafeInternalPath(next) ? next : null;
}

export function resolvePostAuthRedirect(params: {
  next?: string | null;
  plan?: string | null;
}) {
  const safeNext = getSafeNext(params.next);
  if (safeNext) {
    return safeNext;
  }

  if (params.plan) {
    return `/student/payments?plan=${encodeURIComponent(params.plan)}`;
  }

  return "/student";
}

export function buildAuthUrl(base: string, params: AuthQueryParams) {
  const search = new URLSearchParams();

  if (params.next) {
    search.set("next", params.next);
  }
  if (params.plan) {
    search.set("plan", params.plan);
  }
  if (params.from) {
    search.set("from", params.from);
  }

  const query = search.toString();
  return query ? `${base}?${query}` : base;
}
