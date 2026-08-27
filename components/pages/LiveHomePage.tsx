"use client";

import { useMemo } from "react";
import { SectionPreview } from "@/components/dev/SectionPreview";
import type { HomepageConfig, HomepageSectionEntry } from "@/lib/homepage-config";
import { getHomepageSections } from "@/lib/homepage-config";

type LiveHomePageProps = {
  config: HomepageConfig;
};

function LiveHomeSections({
  sections,
  previewSettings,
  homeSectionIds,
}: {
  sections: HomepageSectionEntry[];
  previewSettings?: HomepageConfig["previewSettings"];
  homeSectionIds: ReadonlySet<string>;
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
          homeSectionIds={homeSectionIds}
        />
      ))}
    </main>
  );
}

/** Live homepage — renders the published section stack from homepage-config.json. */
export function LiveHomePage({ config }: LiveHomePageProps) {
  const homeSectionIds = useMemo(
    () =>
      new Set(
        getHomepageSections(config)
          .map((section) => section.id)
          .filter((id): id is string => Boolean(id)),
      ),
    [config],
  );

  return (
    <LiveHomeSections
      sections={getHomepageSections(config)}
      previewSettings={config.previewSettings}
      homeSectionIds={homeSectionIds}
    />
  );
}
