import {
  StagingPreviewPage,
  StagingPreviewSlugUnavailable,
} from "@/components/pages/StagingPreviewPage";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedProjects, getPublishedServices } from "@/lib/org/migrate-section-copy";
import { resolveStagingPreviewPageConfig } from "@/lib/homepage-staging-config.server";
import type { Metadata } from "next";
import {
  buildPortfolioItemListSchema,
  buildServicesItemListSchema,
} from "@/lib/seo-schema";
import { previewOrgPageMetadata } from "@/lib/org/live-page.server";
import { siteConfig } from "@/config/site";
import { joinCatchAllSlug } from "@/lib/playground-pages";

export const dynamic = "force-dynamic";

type PreviewSlugRoutePageProps = {
  params: Promise<{ slug: string[] }>;
};

export async function generateMetadata({
  params,
}: PreviewSlugRoutePageProps): Promise<Metadata> {
  const slug = joinCatchAllSlug((await params).slug);
  return previewOrgPageMetadata(slug);
}

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
