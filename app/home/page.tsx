import { HomePage } from "@/components/pages/HomePage";
import { PreviewShell } from "@/components/dev/PreviewShell";
import { createMetadata } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export const metadata = createMetadata({
  title: "Home Preview",
  description: siteConfig.description,
  path: "/home",
  noIndex: true,
});

export default function HomePreviewPage() {
  return (
    <PreviewShell showControls>
      <HomePage />
    </PreviewShell>
  );
}
