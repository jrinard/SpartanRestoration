import { siteConfig, type TeamContact } from "@/config/site";

/** Anchor id for Service Area — must match `siteConfig.footerNav` `#service-area` href. */
export const footerV1ServiceAreaId = "service-area";

/** Team contacts shown in the footer, with site-level fallback. */
export function getFooterV1TeamContacts(): TeamContact[] {
  if (siteConfig.teamContacts.length > 0) {
    return siteConfig.teamContacts;
  }

  if (!siteConfig.phone && !siteConfig.email) {
    return [];
  }

  return [
    {
      name: siteConfig.name,
      phone: siteConfig.phone,
      email: siteConfig.email,
    },
  ];
}

/** E.164-style tel href for crawlable click-to-call links. */
export function footerV1PhoneTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+${digits.length === 10 ? `1${digits}` : digits}` : "tel:";
}

type SchemaContactPoint = {
  "@type": "ContactPoint";
  telephone: string;
  contactType: string;
  availableLanguage: string;
  areaServed?: string;
  email?: string;
  name?: string;
};

/** JSON-LD contact points aligned with footer v1 team listing. */
export function buildFooterV1ContactPointSchema(): SchemaContactPoint[] {
  return getFooterV1TeamContacts()
    .filter((contact) => contact.phone)
    .map((contact) => ({
      "@type": "ContactPoint",
      telephone: contact.phone,
      contactType: "customer service",
      availableLanguage: "English",
      ...(siteConfig.serviceArea && { areaServed: siteConfig.serviceArea }),
      ...(contact.email && { email: contact.email }),
      ...(contact.name && { name: contact.name }),
    }));
}

export function footerV1LogoUrl(): string {
  return `${siteConfig.url}${siteConfig.assets.logo}`;
}
