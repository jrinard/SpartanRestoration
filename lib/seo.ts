import type { Metadata } from "next";
import type { SiteConfigData } from "@/config/site-data";
import { buildFaviconMetadataIcons, type FaviconPreviewSettings } from "@/lib/favicon-preview";
import { getRuntimeSite } from "@/lib/org/runtime-site";

type PageSEO = {
  title?: string;
  /** Full browser tab title — overrides the default title template when set. */
  browserTitle?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogImageAlt?: string;
  keywords?: string[];
  favicon?: FaviconPreviewSettings | null;
  /** Current org site — avoids LifeSpring fallbacks if runtime site is not set yet. */
  site?: SiteConfigData;
};

/** Block crawlers from internal dev/preview routes. */
export const noIndexRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
    nosnippet: true,
    noarchive: true,
  },
};

export function createMetadata({
  title,
  browserTitle,
  description,
  path = "",
  noIndex = false,
  ogImage,
  ogImageAlt,
  keywords,
  favicon,
  site: siteOverride,
}: PageSEO = {}): Metadata {
  const site = siteOverride ?? getRuntimeSite();
  const socialTitle = title?.trim() || browserTitle?.trim() || site.name;
  const pageTitle = browserTitle?.trim() || socialTitle;
  const pageDescription = description ?? site.description;
  const url = `${site.url}${path}`;
  const imageAlt = ogImageAlt ?? `${site.name} — ${site.tagline}`;
  const image = ogImage || site.assets.ogImage || site.assets.logo;

  return {
    title: pageTitle,
    description: pageDescription,
    ...(keywords && keywords.length > 0 && { keywords }),
    metadataBase: new URL(site.url),
    alternates: { canonical: url },
    icons: buildFaviconMetadataIcons(favicon ?? undefined),
    openGraph: {
      title: socialTitle,
      description: pageDescription,
      url,
      siteName: site.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: pageDescription,
      images: [image],
    },
    robots: noIndex ? noIndexRobots : { index: true, follow: true },
  };
}
