"use client";

import { SectionPreview } from "@/components/dev/SectionPreview";
import type { HomepageConfig, HomepageSectionEntry } from "@/lib/homepage-config";
import { getHomepageSections } from "@/lib/homepage-config";

type LiveHomePageProps = {
  config: HomepageConfig;
};

function LiveHomeSections({
  sections,
  previewSettings,
}: {
  sections: HomepageSectionEntry[];
  previewSettings?: HomepageConfig["previewSettings"];
}) {
  return (
    <main id="main-content">
      {sections.map((section, index) => (
        <SectionPreview
          key={section.id ?? `${section.group}-${index}`}
          group={section.group}
          variant={section.variant}
          sectionId={section.id}
          previewSettings={previewSettings}
        />
      ))}
    </main>
  );
}

/** Live homepage — renders the published section stack from homepage-config.json. */
export function LiveHomePage({ config }: LiveHomePageProps) {
  return (
    <LiveHomeSections
      sections={getHomepageSections(config)}
      previewSettings={config.previewSettings}
    />
  );
}
