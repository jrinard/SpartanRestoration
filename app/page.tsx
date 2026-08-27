import type { Metadata } from "next";
import { UnderConstruction } from "@/components/under-construction/UnderConstruction";
import { LiveHomePage } from "@/components/pages/LiveHomePage";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedProjects, getPublishedServices } from "@/lib/org/migrate-section-copy";
import { getProjects, getSimpleServices } from "@/lib/demo-content";
import { liveOrgPageMetadata, loadLiveOrgPage } from "@/lib/org/live-page.server";
import { siteConfig } from "@/config/site";
import {
  buildPortfolioItemListSchema,
  buildServicesItemListSchema,
} from "@/lib/seo-schema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return liveOrgPageMetadata();
}

export default async function Home() {
  const page = await loadLiveOrgPage();
  if (!page) return null;

  if (page.underConstruction) {
    return <UnderConstruction />;
  }

  const { config } = page;

  return (
    <SiteShell config={config}>
      <JsonLd
        data={[
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
