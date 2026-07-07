import {
  StagingPreviewEmpty,
  StagingPreviewPage,
  StagingPreviewSlugUnavailable,
} from "@/components/pages/StagingPreviewPage";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { projects, simpleServices } from "@/lib/demo-content";
import { resolveStagingPreviewPageConfig } from "@/lib/homepage-staging-config.server";
import { createMetadata } from "@/lib/seo";
import {
  buildPortfolioItemListSchema,
  buildServicesItemListSchema,
} from "@/lib/seo-schema";
import { pageSeo } from "@/lib/seo-content";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: pageSeo.preview.title,
  description: pageSeo.preview.description,
  path: pageSeo.preview.path,
  noIndex: pageSeo.preview.noIndex,
});

type PreviewSlugRoutePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PreviewSlugRoutePage({ params }: PreviewSlugRoutePageProps) {
  const { slug } = await params;
  const staged = await resolveStagingPreviewPageConfig(slug);

  if (!staged) {
    return <StagingPreviewSlugUnavailable slug={slug} />;
  }

  return (
    <>
      <JsonLd
        data={[
          buildPortfolioItemListSchema(projects, `${siteConfig.name} Projects`),
          buildServicesItemListSchema(simpleServices),
        ]}
      />
      <SiteShell config={staged.config}>
        <StagingPreviewPage config={staged.config} />
      </SiteShell>
    </>
  );
}
