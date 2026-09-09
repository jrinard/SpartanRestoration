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

export function StagingPreviewSlugUnavailable({ slug }: { slug: string }) {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white"
    >
      <div className="max-w-md">
        <p className="text-lg font-medium">/{slug} isn’t in the staged preview yet.</p>
        <p className="mt-2 text-sm text-white/70">
          In Forge, keep Preview on for this page’s sections, then Save to /preview.
        </p>
      </div>
    </main>
  );
}
