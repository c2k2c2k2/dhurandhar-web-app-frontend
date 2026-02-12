export function readQueryParam(
  search: string | URLSearchParams | null | undefined,
  key: string
): string | null {
  if (!search) {
    return null;
  }

  const params =
    typeof search === "string"
      ? new URLSearchParams(search.startsWith("?") ? search.slice(1) : search)
      : search;

  const value = params.get(key);
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function readQueryParams(
  search: string | URLSearchParams | null | undefined,
  keys: string[]
) {
  const result: Record<string, string | null> = {};
  keys.forEach((key) => {
    result[key] = readQueryParam(search, key);
  });
  return result;
}
