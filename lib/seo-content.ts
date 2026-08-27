import { siteConfig } from "@/config/site";

const underConstructionSeo = {
  ogImageAlt: `${siteConfig.name} logo — ${siteConfig.tagline}`,
} as const;

/** Per-route metadata copy — swap for client launch. */
export const pageSeo = {
  home: {
    title: "Under Construction",
    description:
      "LifeSpring Design is crafting something extraordinary. Expert web design and digital experiences for businesses ready to grow.",
    path: "/",
    noIndex: true,
    ogImageAlt: underConstructionSeo.ogImageAlt,
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
  privacy: {
    title: "Privacy Policy",
    description:
      "LifeSpring Design LLC privacy policy — how we collect, use, protect, and retain your information.",
    path: "/privacy",
    noIndex: true,
  },
  terms: {
    title: "Terms & Conditions",
    description:
      "LifeSpring Design LLC terms and conditions — website use, SMS consent, opt-out, and service terms.",
    path: "/terms",
    noIndex: true,
  },
  serviceAreas: {
    title: "Service Areas | Web Design Across Clark County, WA",
    description:
      "Find your Clark County, WA town. LifeSpring Design offers web design, software, CRM, branding, and SEO in Vancouver, Salmon Creek, Camas, Battle Ground, and more. Free review.",
    path: "/service-areas",
    noIndex: false,
    ogImageAlt: `${siteConfig.name} — web design service areas in Clark County, WA`,
    keywords: [
      "web design clark county wa",
      "web designer vancouver wa",
      "website design service areas",
      "local web design washougal wa",
      "web developer ridgefield wa",
    ],
  },
  blog: {
    title: "Blog",
    description:
      "Insights on web design, branding, and digital marketing from the LifeSpring Design team.",
    path: "/blog",
  },
  forge: {
    title: "Forge",
    description:
      "Internal workshop for the LifeSpring Starter section library, color themes, and layouts.",
    path: "/forge",
    noIndex: true,
  },
  playground: {
    title: "Forge",
    description:
      "Internal workshop for the LifeSpring Starter section library, color themes, and layouts.",
    path: "/forge",
    noIndex: true,
  },
  preview: {
    title: "Web Design & Development",
    description:
      "LifeSpring Design — custom websites, software, branding, and Reviewbox.io review management for businesses in Washington, Oregon, and Idaho.",
    path: "/preview",
    noIndex: true,
  },
} as const;

/** Local SEO copy for JSON-LD — follows the current org site, not leftover trade-demo text. */
export const tradeDemoSeo = {
  headline: "Custom Websites & Software for Vancouver, WA Businesses",
  leadText: siteConfig.serviceArea,
  description: siteConfig.description,
  areaServed: siteConfig.serviceAreas ?? [
    "Clark County, WA",
    "Vancouver, WA",
  ],
  serviceTypes: [
    "Website Design",
    "Custom Software Development",
    "Review Management Software",
    "Branding & Graphic Design",
    "SEO & Digital Marketing",
    "Ongoing Technology Support",
  ],
};

export function getSocialProfileUrls(): string[] {
  return Object.values(siteConfig.social).filter(
    (url) => typeof url === "string" && url.length > 0 && url !== "#",
  );
}
