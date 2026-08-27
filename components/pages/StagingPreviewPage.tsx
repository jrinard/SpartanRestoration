import { LiveHomePage } from "@/components/pages/LiveHomePage";
import type { HomepageConfig } from "@/lib/homepage-config";

type StagingPreviewPageProps = {
  config: HomepageConfig;
};

export function StagingPreviewPage({ config }: StagingPreviewPageProps) {
  return <LiveHomePage config={config} />;
}

export function StagingPreviewEmpty() {
  return <main id="main-content" className="min-h-screen bg-black" aria-hidden="true" />;
}

export function StagingPreviewSlugUnavailable({ slug: _slug }: { slug: string }) {
  return <main id="main-content" className="min-h-screen bg-black" aria-hidden="true" />;
}
