"use client";

import { useState } from "react";
import { PlaygroundModalSectionEditor } from "@/components/dev/PlaygroundModalSectionEditor";
import { PlaygroundSectionSlot } from "@/components/dev/PlaygroundSectionSlot";
import { SectionSwitcher } from "@/components/dev/SectionSwitcher";
import { usePlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import {
  canDuplicatePlaygroundSection,
  canIncludePlaygroundSectionInPreview,
  getPlaygroundSectionLabel,
  getPlaygroundSectionVariant,
  reorderVisiblePlaygroundSections,
} from "@/lib/playground-sections";
import {
  getPlaygroundModalOnlySections,
  getPlaygroundPageLayoutSections,
} from "@/lib/playground-modal-sections";

export function HomePage() {
  const {
    sections,
    setSections,
    updateSection,
    duplicateSection,
    visibleSections,
    contactFormEditorOpen,
    ready,
  } = usePlaygroundSections();
  const [dragSectionId, setDragSectionId] = useState<string | null>(null);
  const [overSectionId, setOverSectionId] = useState<string | null>(null);

  if (!ready) {
    return <main id="main-content" className="playground-sections" />;
  }

  const modalSections = getPlaygroundModalOnlySections(sections);
  const pageSections = getPlaygroundPageLayoutSections(visibleSections);

  return (
    <main id="main-content" className="playground-sections">
      {contactFormEditorOpen && modalSections.length > 0 && (
        <div className="playground-modal-sections">
          {modalSections.map((config) => (
            <PlaygroundModalSectionEditor
              key={config.id}
              config={config}
              onVariantChange={(variantId) => updateSection(config.id, { variant: variantId })}
            />
          ))}
        </div>
      )}

      {pageSections.map((config) => (
        <PlaygroundSectionSlot
          key={config.id}
          sectionId={config.id}
          label={getPlaygroundSectionLabel(sections, config)}
          compactControls={config.group === "spacer" || config.group === "content"}
          showPreviewToggle={canIncludePlaygroundSectionInPreview(config.group)}
          previewChecked={config.preview === true}
          onPreviewChange={(checked) => updateSection(config.id, { preview: checked })}
          hiddenChecked={config.hidden === true}
          onHiddenChange={(checked) => updateSection(config.id, { hidden: checked })}
          onDuplicate={
            canDuplicatePlaygroundSection(config.group)
              ? () => duplicateSection(config.id)
              : undefined
          }
          isDragging={dragSectionId === config.id}
          isDropTarget={
            overSectionId === config.id && dragSectionId !== null && dragSectionId !== config.id
          }
          onDragStart={setDragSectionId}
          onDragEnd={() => {
            setDragSectionId(null);
            setOverSectionId(null);
          }}
          onDragOver={setOverSectionId}
          onDrop={(fromSectionId, toSectionId) => {
            setSections(reorderVisiblePlaygroundSections(sections, fromSectionId, toSectionId));
            setDragSectionId(null);
            setOverSectionId(null);
          }}
        >
          <SectionSwitcher
            group={config.group}
            sectionId={config.id}
            defaultVariant={config.defaultVariant}
            variant={getPlaygroundSectionVariant(config)}
            onVariantChange={(variantId) => updateSection(config.id, { variant: variantId })}
          />
        </PlaygroundSectionSlot>
      ))}
    </main>
  );
}
