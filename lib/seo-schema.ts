import { siteConfig } from "@/config/site";
import {
  buildFooterV1ContactPointSchema,
  footerV1LogoUrl,
} from "@/lib/footer-v1-seo";
import { getSocialProfileUrls, tradeDemoSeo } from "@/lib/seo-content";

type JsonLd = Record<string, unknown>;

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function siteDescription(): string {
  return siteConfig.description || siteConfig.tagline;
}

function businessAddress(): JsonLd {
  const locality = siteConfig.locality;
  const region = locality?.region || "WA";
  const country = locality?.country || "US";

  if (siteConfig.address.length > 0) {
    return {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address,
      addressLocality: locality?.city || siteConfig.address,
      addressRegion: region,
      addressCountry: country,
    };
  }

  return {
    "@type": "PostalAddress",
    addressLocality: locality?.city || "Vancouver",
    addressRegion: region,
    addressCountry: country,
  };
}

function areaServedNames(): string[] {
  if (siteConfig.serviceAreas && siteConfig.serviceAreas.length > 0) {
    return siteConfig.serviceAreas;
  }
  return [...tradeDemoSeo.areaServed];
}

function areaServedSchema(): JsonLd[] {
  return areaServedNames().map((name) => ({
    "@type": "AdministrativeArea",
    name,
  }));
}

function localityGeo(): JsonLd | null {
  const latitude = siteConfig.locality?.latitude;
  const longitude = siteConfig.locality?.longitude;
  if (typeof latitude !== "number" || typeof longitude !== "number") return null;
  return {
    "@type": "GeoCoordinates",
    latitude,
    longitude,
  };
}

export function buildOrganizationSchema(): JsonLd {
  const sameAs = getSocialProfileUrls();
  const contactPoints = buildFooterV1ContactPointSchema();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: footerV1LogoUrl(),
    description: siteDescription(),
    ...(siteConfig.email && { email: siteConfig.email }),
    ...(siteConfig.phone && { telephone: siteConfig.phone }),
    areaServed: areaServedSchema(),
    knowsAbout: [
      "Web Design",
      "Custom Software Development",
      "Branding",
      "Graphic Design",
      "Online Reputation Management",
      "Reviewbox.io",
    ],
    address: businessAddress(),
    ...(contactPoints.length > 0 && { contactPoint: contactPoints }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function buildLocalBusinessSchema(): JsonLd {
  const sameAs = getSocialProfileUrls();
  const contactPoints = buildFooterV1ContactPointSchema();
  const primaryPhone = siteConfig.phone || contactPoints[0]?.telephone;
  const geo = localityGeo();

  return {
    "@context": "https://schema.org",
    "@type": siteConfig.locality ? "ProfessionalService" : "LocalBusiness",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: footerV1LogoUrl(),
    description: tradeDemoSeo.description || siteDescription(),
    ...(primaryPhone && {
      telephone: primaryPhone,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: primaryPhone,
        contactType: "customer service",
        areaServed: areaServedNames(),
        availableLanguage: "English",
      },
    }),
    ...(siteConfig.email && { email: siteConfig.email }),
    address: businessAddress(),
    ...(geo && { geo }),
    areaServed: areaServedSchema(),
    knowsAbout: tradeDemoSeo.serviceTypes,
    ...(sameAs.length > 0 && { sameAs }),
    ...(primaryPhone && {
      potentialAction: {
        "@type": "ContactAction",
        target: `tel:+${phoneDigits(primaryPhone).length === 10 ? `1${phoneDigits(primaryPhone)}` : phoneDigits(primaryPhone)}`,
        name: `Contact ${siteConfig.name}`,
      },
    }),
  };
}

export function buildWebSiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteDescription(),
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      logo: footerV1LogoUrl(),
    },
  };
}

type PortfolioSchemaProject = {
  title: string;
  description?: string;
  href?: string;
  imageSrc?: string;
};

export function buildPortfolioItemListSchema(
  projects: PortfolioSchemaProject[],
  listName = "LifeSpring Design Portfolio",
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        name: project.title,
        ...(project.description && { description: project.description }),
        ...(project.href && { url: project.href }),
        ...(project.imageSrc && { image: `${siteConfig.url}${project.imageSrc}` }),
        creator: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
      },
    })),
  };
}

export function buildServicesItemListSchema(
  services: { title: string; description: string }[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${siteConfig.name} Services`,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.title,
        description: service.description,
        provider: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        areaServed: siteConfig.serviceArea,
      },
    })),
  };
}

export type ServicesIconsV2SchemaService = {
  name: string;
  description?: string;
};

/** ItemList JSON-LD for ServicesIcons-v2 — uses resolved card labels. */
export function buildServicesIconsV2ItemListSchema(
  heading: string,
  seoDescription: string,
  services: ServicesIconsV2SchemaService[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: heading,
    description: seoDescription,
    numberOfItems: services.length,
    itemListElement: services.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.name,
        ...(service.description && { description: service.description }),
        provider: {
          "@type": "HomeAndConstructionBusiness",
          name: siteConfig.name,
          url: siteConfig.url,
          ...(siteConfig.phone && { telephone: siteConfig.phone }),
        },
        areaServed: tradeDemoSeo.areaServed.map((name) => ({
          "@type": "AdministrativeArea",
          name,
        })),
      },
    })),
  };
}

function toAbsoluteSiteUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return siteConfig.url;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `${siteConfig.url}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`;
}

export type HeroV4SchemaServicePill = {
  label: string;
  href: string;
  title: string;
  description: string;
};

export type BreadcrumbSchemaItem = {
  name: string;
  path: string;
};

export function buildBreadcrumbListSchema(items: BreadcrumbSchemaItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteSiteUrl(item.path),
    })),
  };
}

export type ServiceAreaLocationSchemaItem = {
  name: string;
  path: string;
  description: string;
  headlineArea: string;
};

/** ItemList of town landing pages for the service-areas hub. */
export function buildServiceAreaLocationsItemListSchema(
  locations: ServiceAreaLocationSchemaItem[],
  listDescription: string,
): JsonLd {
  const areaLabel = siteConfig.locality
    ? `${siteConfig.locality.city}, ${siteConfig.locality.region}`
    : siteConfig.serviceArea;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${siteConfig.name} Service Areas in ${areaLabel}`,
    description: listDescription,
    numberOfItems: locations.length,
    itemListElement: locations.map((location, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "WebPage",
        name: location.name,
        description: location.description,
        url: toAbsoluteSiteUrl(location.path),
      },
    })),
  };
}

/** WebPage schema for an individual service-area location landing page. */
export function buildServiceAreaLocationWebPageSchema(
  location: ServiceAreaLocationSchemaItem,
  pageTitle: string,
): JsonLd {
  const locality = location.headlineArea.includes("County")
    ? siteConfig.locality?.city || location.headlineArea
    : location.headlineArea;

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    description: location.description,
    url: toAbsoluteSiteUrl(location.path),
    about: {
      "@type": "Place",
      name: location.name,
      address: {
        "@type": "PostalAddress",
        addressLocality: locality,
        addressRegion: siteConfig.locality?.region || "WA",
        addressCountry: siteConfig.locality?.country || "US",
      },
    },
    provider: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}

export function resolveHeroV4ServicePillUrl(href: string, pathname: string): string {
  if (href.startsWith("http://") || href.startsWith("https://")) return href;
  if (href.startsWith("#")) return `${toAbsoluteSiteUrl(pathname || "/")}${href}`;
  if (href.startsWith("/")) return toAbsoluteSiteUrl(href);
  return toAbsoluteSiteUrl(`${pathname || ""}/${href}`);
}

function heroV4ServicesListName(): string {
  if (siteConfig.locality) {
    return `${siteConfig.name} Services in ${siteConfig.locality.city}, ${siteConfig.locality.region}`;
  }
  return `${siteConfig.name} Services`;
}

/** ItemList JSON-LD for Hero-v4 service pills — crawlable internal service links. */
export function buildHeroV4ServicePillsSchema(
  pills: HeroV4SchemaServicePill[],
  pathname: string,
  listName = heroV4ServicesListName(),
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    description: `Core services from ${siteConfig.name} for ${siteConfig.serviceArea || "local"} businesses.`,
    numberOfItems: pills.length,
    itemListElement: pills.map((pill, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: pill.label,
        description: pill.description,
        url: resolveHeroV4ServicePillUrl(pill.href, pathname),
        provider: {
          "@type": "Organization",
          name: siteConfig.name,
          url: siteConfig.url,
        },
        areaServed: siteConfig.serviceArea,
      },
    })),
  };
}

export type ImagesV1SchemaItem = {
  name: string;
  imageSrc: string;
  linkHref?: string;
};

/** ItemList JSON-LD for Images-v1 — logos/photos with optional outbound links. */
export function buildImagesV1ItemListSchema(
  heading: string,
  seoDescription: string,
  items: ImagesV1SchemaItem[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: heading,
    description: seoDescription,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => {
      const logoUrl = toAbsoluteSiteUrl(item.imageSrc);
      const linkHref = item.linkHref?.trim();

      return {
        "@type": "ListItem",
        position: index + 1,
        item: linkHref
          ? {
              "@type": "Organization",
              name: item.name,
              url: toAbsoluteSiteUrl(linkHref),
              logo: logoUrl,
            }
          : {
              "@type": "ImageObject",
              name: item.name,
              contentUrl: logoUrl,
            },
      };
    }),
  };
}
