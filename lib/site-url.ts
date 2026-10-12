import type { SiteConfigData } from "@/config/site-data";

/** Hostname only — no scheme or path. */
export function normalizeSiteDomain(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  try {
    const withProto = trimmed.includes("://") ? trimmed : `https://${trimmed}`;
    return new URL(withProto).hostname;
  } catch {
    return trimmed.replace(/^https?:\/\//i, "").split("/")[0]?.split(":")[0] ?? trimmed;
  }
}

/** Absolute https URL with no trailing slash (for metadataBase, sitemap, schema). */
export function normalizeSiteUrl(url: string, domain?: string): string {
  const trimmed = url.trim();
  const domainTrimmed = domain?.trim() ?? "";
  const candidate = trimmed || domainTrimmed;
  if (!candidate) return "https://example.com";

  try {
    const withProto = candidate.includes("://") ? candidate : `https://${candidate}`;
    const parsed = new URL(withProto);
    if (!parsed.hostname) return "https://example.com";
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    const fallback = candidate.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    const host = fallback.split("/")[0]?.split(":")[0]?.trim();
    return host ? `https://${host}` : "https://example.com";
  }
}

/** Never throws — used for Next.js metadataBase. */
export function resolveMetadataBaseUrl(url: string, domain?: string): URL {
  try {
    return new URL(normalizeSiteUrl(url, domain));
  } catch {
    return new URL("https://example.com");
  }
}

export function normalizeSiteIdentity(site: SiteConfigData): SiteConfigData {
  const domain = normalizeSiteDomain(site.domain);
  const url = normalizeSiteUrl(site.url, domain);
  if (domain === site.domain && url === site.url) return site;
  return { ...site, domain, url };
}
