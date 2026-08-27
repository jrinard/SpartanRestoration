import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UnderConstruction } from "@/components/under-construction/UnderConstruction";
import { LiveHomePage } from "@/components/pages/LiveHomePage";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedProjects, getPublishedServices } from "@/lib/org/migrate-section-copy";
import { getProjects, getSimpleServices } from "@/lib/demo-content";
import { liveOrgPageMetadata, loadLiveOrgPage } from "@/lib/org/live-page.server";
import { buildLiveSlugSeoSchemas } from "@/lib/org/live-page-jsonld";
import { isReservedPageSlug, joinCatchAllSlug } from "@/lib/playground-pages";
import { siteConfig } from "@/config/site";
import {
  buildPortfolioItemListSchema,
  buildServicesItemListSchema,
} from "@/lib/seo-schema";

export const dynamic = "force-dynamic";

type LiveSlugPageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({ params }: LiveSlugPageProps): Promise<Metadata> {
  const slug = joinCatchAllSlug((await params).slug);
  if (isReservedPageSlug(slug)) {
    return {};
  }
  return liveOrgPageMetadata(slug);
}

export default async function LiveSlugPage({ params }: LiveSlugPageProps) {
  const slug = joinCatchAllSlug((await params).slug);
  if (isReservedPageSlug(slug)) notFound();

  const page = await loadLiveOrgPage(slug);
  if (!page) notFound();

  if (page.underConstruction) {
    return <UnderConstruction />;
  }

  const { config, seo } = page;

  return (
    <SiteShell config={config}>
      <JsonLd
        data={[
          ...buildLiveSlugSeoSchemas(slug, seo),
          buildPortfolioItemListSchema(
            getPublishedProjects(config).length > 0
              ? getPublishedProjects(config)
              : getProjects(),
            `${siteConfig.name} Projects`,
          ),
          buildServicesItemListSchema(
            getPublishedServices(config).length > 0
              ? getPublishedServices(config)
              : getSimpleServices(),
          ),
        ]}
      />
      <LiveHomePage config={config} />
    </SiteShell>
  );
}
