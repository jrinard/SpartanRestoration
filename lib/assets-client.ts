/** Client-safe asset URLs — no Node fs (use in "use client" components). */
export function getAssetUrl(assetPath: string): string {
  const trimmed = assetPath.trim();
  if (!trimmed) return trimmed;
  return trimmed.split("?")[0];
}
