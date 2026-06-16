import { siteConfig } from "@/config/site";
import { getSocialProfileUrls, tradeDemoSeo } from "@/lib/seo-content";

type JsonLd = Record<string, unknown>;

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function buildOrganizationSchema(): JsonLd {
  const sameAs = getSocialProfileUrls();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    ...(siteConfig.email && { email: siteConfig.email }),
    ...(siteConfig.phone && { telephone: siteConfig.phone }),
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
    description: siteConfig.description,
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };
}
