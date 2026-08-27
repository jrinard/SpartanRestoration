import { getServiceAreaLocationPath } from "@/lib/service-area-pages";
import { siteConfig } from "@/config/site";

export type ServiceAreaV2Card = {
  id: string;
  /** Config / URL slug — live path is `/${slug}` from `pages[]`. */
  slug: string;
  title: string;
  description: string;
  ctaLabel: string;
};

export const serviceAreaV2Cards: ServiceAreaV2Card[] = [
  {
    id: "clark-county",
    slug: "clark-county-wa",
    title: "Clark County, WA",
    description: `${siteConfig.name} is a local Vancouver, WA studio serving all of Clark County, from Vancouver and Salmon Creek to Battle Ground, Camas, and Washougal. We offer web design, software development, CRM tools, logo and branding, reputation growth with Reviewbox.io, and ongoing optimization. One loyal, honest team that plans, designs, and ships everything in-house.`,
    ctaLabel: "View Clark County",
  },
  {
    id: "salmon-creek",
    slug: "salmon-creek-wa",
    title: "Salmon Creek, WA",
    description: `${siteConfig.name} builds custom web design for Salmon Creek businesses near the I-5 interchange and around WSU Vancouver. We focus on mobile-friendly layouts, search optimization, and site speed so medical offices, retail shops, and professional teams get found and convert. Local support with straightforward quotes.`,
    ctaLabel: "View Salmon Creek",
  },
  {
    id: "hazel-dell",
    slug: "hazel-dell-wa",
    title: "Hazel Dell, WA",
    description: `Hazel Dell and the Highway 99 corridor deserve a web partner who shows up. ${siteConfig.name} is local, honest, and easy to work with on web design, site updates, and brand refreshes for commercial tenants and north Vancouver neighborhoods. Clear scopes, fair pricing, and real people you can call.`,
    ctaLabel: "View Hazel Dell",
  },
  {
    id: "felida",
    slug: "felida-wa",
    title: "Felida, WA",
    description: `${siteConfig.name} helps Felida professionals stand out with logo and branding, business cards, brochures, and graphic design that matches the quality of your work. We also build custom websites for neighborhoods near Felida Park and service pros above Lake River. Sharp identity and fast-loading sites from a local studio.`,
    ctaLabel: "View Felida",
  },
  {
    id: "ridgefield",
    slug: "ridgefield-wa",
    title: "Ridgefield, WA",
    description: `Ridgefield is growing fast, and your online presence should keep pace. ${siteConfig.name} delivers web design, landing pages for HOAs and commercial projects, and search optimization so new customers find you. Launch-ready builds plus ongoing support from a team that knows north Clark County.`,
    ctaLabel: "View Ridgefield",
  },
  {
    id: "la-center",
    slug: "la-center-wa",
    title: "La Center, WA",
    description: `${siteConfig.name} brings loyal, local web design to La Center and the rural north end of Clark County. Small-town storefront sites, service business pages, and print-ready graphic design for businesses that want to look professional without big-agency overhead. Honest quotes and personal attention.`,
    ctaLabel: "View La Center",
  },
  {
    id: "battle-ground",
    slug: "battle-ground-wa",
    title: "Battle Ground, WA",
    description: `${siteConfig.name} serves Battle Ground retailers, contractors, and offices with custom software development and CRM systems built around how you actually work. Pair that with web design and branding when you need a full digital foundation. Responsive local support with clear timelines.`,
    ctaLabel: "View Battle Ground",
  },
  {
    id: "brush-prairie",
    slug: "brush-prairie-wa",
    title: "Brush Prairie, WA",
    description: `Between Vancouver and Battle Ground, Brush Prairie businesses need branding that feels trustworthy and local. ${siteConfig.name} handles logo design, business cards, brochures, and graphic design alongside contractor and family-run service websites. Cohesive identity across print and web from one local team.`,
    ctaLabel: "View Brush Prairie",
  },
  {
    id: "hockinson",
    slug: "hockinson-wa",
    title: "Hockinson, WA",
    description: `${siteConfig.name} partners with Hockinson service businesses in the wooded hills of east Clark County. Custom software development, online booking flows, and web design for teams that need to be found and trusted in a rural market. Loyal local support with honest scopes and free project quotes.`,
    ctaLabel: "View Hockinson",
  },
  {
    id: "camas",
    slug: "camas-wa",
    title: "Camas, WA",
    description: `${siteConfig.name} builds for Camas from downtown districts to neighborhoods above Lacamas Lake. Software development, CRM setup, and custom web design for commercial and professional clients who outgrew templates. Local studio, direct communication, and work shipped in-house.`,
    ctaLabel: "View Camas",
  },
  {
    id: "washougal",
    slug: "washougal-wa",
    title: "Washougal, WA",
    description: `At the gateway to the Columbia Gorge, Washougal businesses compete regionally. ${siteConfig.name} helps with reputation growth through Reviewbox.io, stronger Google reviews, and web design that backs up your reputation online. Strategy and creative work from a local team that stays involved after launch.`,
    ctaLabel: "View Washougal",
  },
  {
    id: "orchards",
    slug: "orchards-wa",
    title: "Orchards, WA",
    description: `${siteConfig.name} is the local studio for Orchards, east of Vancouver. We build and maintain websites for retailers along Fourth Plain and 162nd, with ongoing optimization, SEO, and performance tuning so your site keeps working as your business grows. Dependable support from people who answer the phone.`,
    ctaLabel: "View Orchards",
  },
  {
    id: "woodland",
    slug: "woodland-wa",
    title: "Woodland, WA",
    description: `${siteConfig.name} supports Woodland industrial, distribution, and downtown businesses near the Port of Woodland and I-5. Custom software development, CRM tools, web design, and branding for companies that need systems and sites built to fit real workflows. Local, honest partnership with free written quotes.`,
    ctaLabel: "View Woodland",
  },
];

/** Resolve a service-area card by its URL slug (`camas-wa` or `service-areas/camas-wa`). */
export function getServiceAreaV2CardBySlug(slug: string): ServiceAreaV2Card | undefined {
  const city = slug.replace(/^service-areas\//, "");
  return serviceAreaV2Cards.find((card) => card.slug === city);
}

export function getServiceAreaV2CardSlugs(): string[] {
  return serviceAreaV2Cards.map((card) => card.slug);
}

/** Resolve the live path for a service-area card. */
export function getServiceAreaV2CardHref(card: ServiceAreaV2Card): string {
  return getServiceAreaLocationPath(card.slug);
}
