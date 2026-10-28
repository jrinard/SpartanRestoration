/** Client-safe URL helpers for files in `orgs/<id>/assets/`. */

export const orgAssetsRoutePrefix = "/org-assets";

export function orgAssetUrl(orgId: string, relative = ""): string {
  const rest = relative.replace(/^\/+/, "");
  return rest ? `${orgAssetsRoutePrefix}/${orgId}/${rest}` : `${orgAssetsRoutePrefix}/${orgId}`;
}

export function orgLibraryUrl(orgId: string, relative = ""): string {
  const rest = relative.replace(/^\/+/, "");
  return rest ? orgAssetUrl(orgId, `images/${rest}`) : orgAssetUrl(orgId, "images");
}

/** Turn a stored `/org-assets/…` path into an absolute URL for previews (Forge iframe, toolbar). */
export function resolvePublicAssetUrl(src: string, origin: string): string {
  const trimmed = src.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = origin.trim().replace(/\/$/, "");
  if (!base) return trimmed.startsWith("/") ? trimmed : "";
  return `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

/** `/org-assets/lsd/logo.png` → `{ orgId: "lsd", relative: "logo.png" }` */
export function parseOrgAssetUrl(
  value: string,
): { orgId: string; relative: string } | null {
  const trimmed = value.trim().split("?")[0];
  const match = /^\/org-assets\/([a-z0-9][a-z0-9-]{0,62})(?:\/(.*))?$/i.exec(trimmed);
  if (!match) return null;
  return { orgId: match[1].toLowerCase(), relative: match[2] ?? "" };
}
