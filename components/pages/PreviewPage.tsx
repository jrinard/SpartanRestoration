"use client";

import { SectionPreview } from "@/components/dev/SectionPreview";
import { usePreviewPathSlug } from "@/components/dev/usePlaygroundPageLink";
import { getPlaygroundSectionVariant } from "@/lib/playground-sections";
import { usePlaygroundSectionsStorage } from "@/components/dev/PlaygroundSectionsProvider";

export function PreviewPage() {
  const previewSlug = usePreviewPathSlug();
  const { previewSections, ready, activePage } = usePlaygroundSectionsStorage(previewSlug);

  if (!ready) {
    return <main id="main-content" />;
  }

  return (
    <main id="main-content">
      {activePage && (
        <div className="border-b border-border/60 bg-muted/30 px-6 py-2 text-center font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Previewing: {activePage.name}
        </div>
      )}
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
