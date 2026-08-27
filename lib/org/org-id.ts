export const reservedOrgIds = [
  "api",
  "playground",
  "forge",
  "preview",
  "about",
  "contact",
  "blog",
  "services",
  "org-assets",
  "home",
  "privacy",
  "terms",
  "projects",
  "_next",
] as const;

export function isReservedOrgId(orgId: string): boolean {
  return (reservedOrgIds as readonly string[]).includes(orgId);
}

export function isSafeOrgId(orgId: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,62}$/.test(orgId);
}

/** Suggest a folder slug from a display name (lowercase, hyphens). */
export function slugifyOrgFolder(name: string): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) return "org";
  if (!/^[a-z0-9]/.test(slug)) return `org-${slug}`.slice(0, 63);
  return slug.slice(0, 63);
}
