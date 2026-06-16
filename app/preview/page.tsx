import { PreviewPage } from "@/components/pages/PreviewPage";
import { PreviewShell } from "@/components/dev/PreviewShell";
import { createMetadata } from "@/lib/seo";
import { pageSeo } from "@/lib/seo-content";

export const metadata = createMetadata({
  title: pageSeo.preview.title,
  description: pageSeo.preview.description,
  path: pageSeo.preview.path,
  noIndex: pageSeo.preview.noIndex,
});

export default function PreviewRoutePage() {
  return (
    <PreviewShell>
      <PreviewPage />
    </PreviewShell>
  );
}
