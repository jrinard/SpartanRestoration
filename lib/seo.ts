import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

type PageSEO = {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogImageAlt?: string;
  keywords?: string[];
};

const defaultOgImage = siteConfig.assets.ogImage;

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
  description,
  path = "",
  noIndex = false,
  ogImage = defaultOgImage,
  ogImageAlt,
  keywords,
}: PageSEO = {}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name;
  const pageDescription = description ?? siteConfig.description;
  const url = `${siteConfig.url}${path}`;
  const imageAlt = ogImageAlt ?? `${siteConfig.name} — ${siteConfig.tagline}`;

  return {
    title: pageTitle,
    description: pageDescription,
    ...(keywords && keywords.length > 0 && { keywords }),
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: url },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url,
      siteName: siteConfig.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
    robots: noIndex ? noIndexRobots : { index: true, follow: true },
  };
}
