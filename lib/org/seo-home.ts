import type { OrgSeoRoute } from "@/lib/org/types";
import { resolveSeoKeywordsForSave } from "@/lib/org/seo-keywords";

export function taglineFromHomeSeoTitle(title: string, fallback: string): string {
  const separator = " | ";
  const index = title.indexOf(separator);
  if (index >= 0) return title.slice(index + separator.length).trim();
  return fallback;
}

type BuildHomeSeoRouteInput = {
  route: OrgSeoRoute;
  orgName: string;
  fallbackTagline: string;
  fallbackDescription: string;
  keywordsText: string;
};

/** Shared home-route shape for Org Settings and Forge Edit SEO. */
export function buildHomeSeoRouteForSave({
  route,
  orgName,
  fallbackTagline,
  fallbackDescription,
  keywordsText,
}: BuildHomeSeoRouteInput): {
  route: OrgSeoRoute;
  description: string;
  tagline: string;
} {
  const title = route.title.trim() || orgName;
  const description = route.description.trim() || fallbackDescription;
  const homeKeywords = resolveSeoKeywordsForSave(keywordsText, route.keywords);
  const { keywords: _removed, ...routeRest } = route;

  return {
    route: {
      ...routeRest,
      title,
      description,
      path: "/",
      ogImageAlt:
        route.ogImageAlt?.trim() ||
        `${orgName} — ${taglineFromHomeSeoTitle(title, fallbackTagline)}`,
      ...(homeKeywords ? { keywords: homeKeywords } : {}),
    },
    description,
    tagline: taglineFromHomeSeoTitle(title, fallbackTagline),
  };
}
