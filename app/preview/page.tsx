import { PreviewPage } from "@/components/pages/PreviewPage";
import { PreviewShell } from "@/components/dev/PreviewShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { projects, simpleServices } from "@/lib/demo-content";
import { createMetadata } from "@/lib/seo";
import {
  buildPortfolioItemListSchema,
  buildServicesItemListSchema,
} from "@/lib/seo-schema";
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
      <JsonLd
        data={[
          buildPortfolioItemListSchema(projects, "LifeSpring Design Web Projects"),
          buildServicesItemListSchema(simpleServices),
        ]}
      />
      <PreviewPage />
    </PreviewShell>
  );
}
