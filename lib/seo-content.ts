import { siteConfig } from "@/config/site";

/** Homepage metadata — matches the under-construction page at `/`. */
export const underConstructionSeo = {
  title: "Under Construction",
  statusLine: "Our new site is on the way.",
  description: `${siteConfig.name} — ${siteConfig.tagline} Our new site is on the way.`,
  contactSummary: siteConfig.teamContacts
    .map((contact) => `${contact.name} ${contact.phone}`)
    .join(" · "),
  ogImageAlt: `${siteConfig.name} logo — ${siteConfig.tagline}`,
} as const;

/** Per-route metadata copy — update other routes when those pages are built out. */
export const pageSeo = {
  home: {
    title: underConstructionSeo.title,
    description: `${underConstructionSeo.description} ${underConstructionSeo.contactSummary}.`,
    path: "/",
    ogImageAlt: underConstructionSeo.ogImageAlt,
  },
  about: {
    title: "About",
    description: "About Spartan Restoration — page coming soon.",
    path: "/about",
    noIndex: true,
  },
  services: {
    title: "Services",
    description: "Spartan Restoration services — page coming soon.",
    path: "/services",
    noIndex: true,
  },
  contact: {
    title: "Contact",
    description: "Contact Spartan Restoration — page coming soon.",
    path: "/contact",
    noIndex: true,
  },
  blog: {
    title: "Blog",
    description: "Spartan Restoration blog — page coming soon.",
    path: "/blog",
    noIndex: true,
  },
  playground: {
    title: "Playground",
    description: "Internal design preview — not for public indexing.",
    path: "/playground",
    noIndex: true,
  },
  preview: {
    title: "Preview",
    description: "Internal layout preview — not for public indexing.",
    path: "/preview",
    noIndex: true,
  },
} as const;

/** Trade-services demo copy for playground JSON-LD and hero metadata. */
export const tradeDemoSeo = {
  headline: "Professional Pressure & Soft Washing in Vancouver & Portland",
  leadText: "Servicing Vancouver, Portland and surrounding areas",
  description:
    "Residential and commercial pressure washing, soft washing, roof cleaning, and organic growth management in Vancouver WA and Portland OR.",
  areaServed: ["Vancouver, WA", "Portland, OR", "Camas, WA", "Clark County, WA"],
  serviceTypes: [
    "Pressure Washing",
    "Soft Washing",
    "Roof Cleaning",
    "House Washing",
    "Concrete Cleaning",
    "Commercial Exterior Cleaning",
    "Organic Growth Management",
    "Gutter Cleaning",
  ],
} as const;

export function getSocialProfileUrls(): string[] {
  return Object.values(siteConfig.social).filter(
    (url) => typeof url === "string" && url.length > 0 && url !== "#",
  );
}
