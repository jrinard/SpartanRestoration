"use client";

import { SectionPreview } from "@/components/dev/SectionPreview";
import { getPlaygroundSectionVariant } from "@/lib/playground-sections";
import { usePlaygroundSectionsStorage } from "@/components/dev/PlaygroundSectionsProvider";

export function PreviewPage() {
  const { previewSections, ready } = usePlaygroundSectionsStorage();

  if (!ready) {
    return <main id="main-content" />;
  }

  return (
    <main id="main-content">
      {previewSections.map((config) => (
        <SectionPreview
          key={config.id}
          group={config.group}
          variant={getPlaygroundSectionVariant(config)}
          sectionId={config.id}
        />
      ))}
    </main>
  );
}
