export function getAssetUrl(assetId: string) {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  return `${base}/assets/${assetId}`;
}
