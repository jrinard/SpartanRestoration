"use client";

import { useState } from "react";
import { PlaygroundSectionSlot } from "@/components/dev/PlaygroundSectionSlot";
import { SectionSwitcher } from "@/components/dev/SectionSwitcher";
import { usePlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import {
  getPlaygroundSectionLabel,
  getPlaygroundSectionVariant,
  reorderVisiblePlaygroundSections,
} from "@/lib/playground-sections";

export function HomePage() {
  const { sections, setSections, updateSection, duplicateSpacer, visibleSections } =
    usePlaygroundSections();
  const [dragSectionId, setDragSectionId] = useState<string | null>(null);
  const [overSectionId, setOverSectionId] = useState<string | null>(null);

  return (
    <main id="main-content" className="playground-sections">
      {visibleSections.map((config) => (
        <PlaygroundSectionSlot
          key={config.id}
          sectionId={config.id}
          label={getPlaygroundSectionLabel(sections, config)}
          compactControls={config.group === "spacer"}
          previewChecked={config.preview === true}
          onPreviewChange={(checked) => updateSection(config.id, { preview: checked })}
          hiddenChecked={config.hidden === true}
          onHiddenChange={(checked) => updateSection(config.id, { hidden: checked })}
          onDuplicate={
            config.group === "spacer" ? () => duplicateSpacer(config.id) : undefined
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
