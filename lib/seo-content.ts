import { siteConfig } from "@/config/site";

/** Per-route metadata copy — swap for client launch. */
export const pageSeo = {
  home: {
    title: "Under Construction",
    description:
      "LifeSpring Design is crafting something extraordinary. Expert web design and digital experiences for businesses ready to grow.",
    path: "/",
    noIndex: true,
  },
  about: {
    title: "About",
    description:
      "Learn about LifeSpring Design — our mission, approach, and commitment to building fast, beautiful marketing websites.",
    path: "/about",
  },
  services: {
    title: "Services",
    description:
      "Web design, development, and SEO services from LifeSpring Design. Custom sites built with Next.js and search-ready architecture.",
    path: "/services",
  },
  contact: {
    title: "Contact",
    description:
      "Contact LifeSpring Design for a free consultation. Tell us about your project and we'll help you plan a site that converts.",
    path: "/contact",
  },
  blog: {
    title: "Blog",
    description:
      "Insights on web design, branding, and digital marketing from the LifeSpring Design team.",
    path: "/blog",
  },
  playground: {
    title: "Playground",
    description:
      "Internal preview of the LifeSpring Starter section library, color themes, and OSP-style trade services layout.",
    path: "/playground",
    noIndex: true,
  },
  preview: {
    title: "Preview",
    description:
      "Alternate homepage layout preview — agency-style hero, feature tiles, and testimonial sections.",
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
