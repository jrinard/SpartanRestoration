import { siteConfig } from "@/config/site";
import { getSocialProfileUrls, tradeDemoSeo } from "@/lib/seo-content";

type JsonLd = Record<string, unknown>;

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function siteDescription(): string {
  return siteConfig.description || siteConfig.tagline;
}

export function buildOrganizationSchema(): JsonLd {
  const sameAs = getSocialProfileUrls();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteDescription(),
    ...(siteConfig.email && { email: siteConfig.email }),
    ...(siteConfig.phone && { telephone: siteConfig.phone }),
    ...(siteConfig.serviceArea && { areaServed: siteConfig.serviceArea }),
    knowsAbout: [
      "Web Design",
      "Custom Software Development",
      "Branding",
      "Graphic Design",
      "Online Reputation Management",
      "Reviewbox.io",
    ],
    ...(siteConfig.address.length > 0 && {
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.address,
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
  };
}

export function buildLocalBusinessSchema(): JsonLd {
  const sameAs = getSocialProfileUrls();

  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    name: siteConfig.name,
    url: siteConfig.url,
    description: tradeDemoSeo.description,
    ...(siteConfig.phone && {
      telephone: siteConfig.phone,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: siteConfig.phone,
        contactType: "customer service",
        areaServed: tradeDemoSeo.areaServed,
        availableLanguage: "English",
      },
    }),
    ...(siteConfig.email && { email: siteConfig.email }),
    ...(siteConfig.address.length > 0
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: siteConfig.address,
          },
        }
      : {
          address: {
            "@type": "PostalAddress",
            addressLocality: "Vancouver",
            addressRegion: "WA",
            addressCountry: "US",
          },
        }),
    areaServed: tradeDemoSeo.areaServed.map((name) => ({
      "@type": "City",
      name,
    })),
    knowsAbout: tradeDemoSeo.serviceTypes,
    ...(sameAs.length > 0 && { sameAs }),
    ...(siteConfig.phone && {
      potentialAction: {
        "@type": "ContactAction",
        target: `tel:${phoneDigits(siteConfig.phone)}`,
        name: "Call for a free quote",
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
