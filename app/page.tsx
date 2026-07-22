import type { Metadata } from "next";
import { UnderConstruction } from "@/components/under-construction/UnderConstruction";
import { LiveHomePage } from "@/components/pages/LiveHomePage";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { readHomepageConfig } from "@/lib/homepage-config.server";
import { isUnderConstruction, readLaunchMode } from "@/lib/launch-mode.server";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";
import { pageSeo, spartanRestorationServices } from "@/lib/seo-content";
import {
  buildLocalBusinessSchema,
  buildServicesItemListSchema,
} from "@/lib/seo-schema";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const launchMode = await readLaunchMode();

  if (isUnderConstruction(launchMode)) {
    return createMetadata({
      title: pageSeo.home.title,
      description: pageSeo.home.description,
      path: pageSeo.home.path,
      ogImage: siteConfig.assets.logo,
      ogImageAlt: pageSeo.home.ogImageAlt,
    });
  }

  return createMetadata({
    title: siteConfig.name,
    description: siteConfig.description,
    path: pageSeo.home.path,
  });
}

export default async function Home() {
  const [launchMode, config] = await Promise.all([readLaunchMode(), readHomepageConfig()]);

  if (isUnderConstruction(launchMode)) {
    return <UnderConstruction />;
  }

  return (
    <SiteShell config={config}>
      <JsonLd
        data={[
          buildLocalBusinessSchema(),
          buildServicesItemListSchema([...spartanRestorationServices]),
        ]}
      />
      <LiveHomePage config={config} />
    </SiteShell>
  );
}
