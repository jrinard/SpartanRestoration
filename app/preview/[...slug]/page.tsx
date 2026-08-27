import {
  StagingPreviewPage,
  StagingPreviewSlugUnavailable,
} from "@/components/pages/StagingPreviewPage";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedProjects, getPublishedServices } from "@/lib/org/migrate-section-copy";
import { resolveStagingPreviewPageConfig } from "@/lib/homepage-staging-config.server";
import { createMetadata } from "@/lib/seo";
import {
  buildPortfolioItemListSchema,
  buildServicesItemListSchema,
} from "@/lib/seo-schema";
import { pageSeo } from "@/lib/seo-content";
import { siteConfig } from "@/config/site";
import { joinCatchAllSlug } from "@/lib/playground-pages";

export const dynamic = "force-dynamic";

export const metadata = createMetadata({
  title: pageSeo.preview.title,
  description: pageSeo.preview.description,
  path: pageSeo.preview.path,
  noIndex: pageSeo.preview.noIndex,
});

type PreviewSlugRoutePageProps = {
  params: Promise<{ slug: string[] }>;
};

export default async function PreviewSlugRoutePage({ params }: PreviewSlugRoutePageProps) {
  const slug = joinCatchAllSlug((await params).slug);
  const staged = await resolveStagingPreviewPageConfig(slug);

  if (!staged) {
    return <StagingPreviewSlugUnavailable slug={slug} />;
  }

  const projects = getPublishedProjects(staged.config);
  const services = getPublishedServices(staged.config);
  const jsonLd = [
    ...(projects.length > 0
      ? [buildPortfolioItemListSchema(projects, `${siteConfig.name} Projects`)]
      : []),
    ...(services.length > 0
      ? [buildServicesItemListSchema(services)]
      : []),
  ];

  return (
    <>
      {jsonLd.length > 0 ? <JsonLd data={jsonLd} /> : null}
      <SiteShell config={staged.config}>
        <StagingPreviewPage config={staged.config} />
      </SiteShell>
    </>
  );
}
