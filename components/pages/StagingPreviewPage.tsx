import { LiveHomePage } from "@/components/pages/LiveHomePage";
import type { HomepageConfig } from "@/lib/homepage-config";

type StagingPreviewPageProps = {
  config: HomepageConfig;
};

export function StagingPreviewPage({ config }: StagingPreviewPageProps) {
  return <LiveHomePage config={config} />;
}

export function StagingPreviewEmpty() {
  return (
    <main
      id="main-content"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 py-16 text-center"
    >
      <p className="font-mono text-sm tracking-wide text-muted-foreground uppercase">
        No staging layout yet
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        In the playground, check Preview on the sections you want to share, then click{" "}
        <span className="font-mono text-foreground">Save to /preview</span>, commit, and deploy.
      </p>
    </main>
  );
}

export function StagingPreviewSlugUnavailable({ slug }: { slug: string }) {
  return (
    <main
      id="main-content"
      className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-6 py-16 text-center"
    >
      <p className="font-mono text-sm tracking-wide text-muted-foreground uppercase">
        Page not in staging
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        <span className="font-mono text-foreground">/preview/{slug}</span> is not staged yet. Check
        Preview on that page&apos;s sections in the playground, then click{" "}
        <span className="font-mono text-foreground">Save to /preview</span>.
      </p>
    </main>
  );
}
