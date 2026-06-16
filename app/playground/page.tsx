import { HomePage } from "@/components/pages/HomePage";
import { PreviewShell } from "@/components/dev/PreviewShell";
import { TradeDemoJsonLd } from "@/components/seo/JsonLd";
import { createMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";

export const metadata = createMetadata({
  title: pageSeo.playground.title,
  description: pageSeo.playground.description,
  path: pageSeo.playground.path,
  noIndex: pageSeo.playground.noIndex,
});

export default function PlaygroundPage() {
  return (
    <>
      <TradeDemoJsonLd />
      <PreviewShell>
        <HomePage />
      </PreviewShell>
    </>
  );
}
