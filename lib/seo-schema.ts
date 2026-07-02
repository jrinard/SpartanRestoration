import { siteConfig } from "@/config/site";
import {
  buildFooterV1ContactPointSchema,
  footerV1LogoUrl,
} from "@/lib/footer-v1-seo";
import { getSocialProfileUrls, spartanRestorationSeo } from "@/lib/seo-content";

type JsonLd = Record<string, unknown>;

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function siteDescription(): string {
  return siteConfig.description || siteConfig.tagline;
}

function businessAddress(): JsonLd {
  if (siteConfig.address.length > 0) {
    return {
      "@type": "PostalAddress",
      addressLocality: siteConfig.address,
      addressRegion: "WA",
      addressCountry: "US",
    };
  }

  return {
    "@type": "PostalAddress",
    addressLocality: "Vancouver",
    addressRegion: "WA",
    addressCountry: "US",
  };
}

function areaServedSchema(): JsonLd[] {
  return spartanRestorationSeo.areaServed.map((name) => ({
    "@type": "AdministrativeArea",
    name,
  }));
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
    ...(siteConfig.serviceArea && { areaServed: siteConfig.serviceArea }),
    knowsAbout: spartanRestorationSeo.serviceTypes,
    address: businessAddress(),
    ...(contactPoints.length > 0 && { contactPoint: contactPoints }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function buildLocalBusinessSchema(): JsonLd {
  const sameAs = getSocialProfileUrls();
  const contactPoints = buildFooterV1ContactPointSchema();
  const primaryPhone = siteConfig.phone || contactPoints[0]?.telephone;

  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: footerV1LogoUrl(),
    description: siteDescription(),
    ...(primaryPhone && { telephone: primaryPhone }),
    ...(siteConfig.email && { email: siteConfig.email }),
    address: businessAddress(),
    areaServed: areaServedSchema(),
    knowsAbout: spartanRestorationSeo.serviceTypes,
    ...(contactPoints.length > 0 && { contactPoint: contactPoints }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(primaryPhone && {
      potentialAction: {
        "@type": "ContactAction",
        target: `tel:+${phoneDigits(primaryPhone).length === 10 ? `1${phoneDigits(primaryPhone)}` : phoneDigits(primaryPhone)}`,
        name: "Call Spartan Restoration",
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
