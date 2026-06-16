import {
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/seo-schema";

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
};

/** Renders JSON-LD structured data for search engines. */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return <JsonLd data={buildOrganizationSchema()} />;
}

export function WebSiteJsonLd() {
  return <JsonLd data={buildWebSiteSchema()} />;
}

export function LocalBusinessJsonLd() {
  return <JsonLd data={buildLocalBusinessSchema()} />;
}

/** Default site-wide structured data bundle. */
export function SiteJsonLd() {
  return (
    <>
      <WebSiteJsonLd />
      <OrganizationJsonLd />
    </>
  );
}

/** Trade-services demo structured data for OSP-style playground home. */
export function TradeDemoJsonLd() {
  return <LocalBusinessJsonLd />;
}
