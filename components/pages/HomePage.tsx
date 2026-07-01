"use client";

import { useState } from "react";
import { PlaygroundSectionSlot } from "@/components/dev/PlaygroundSectionSlot";
import { SectionSwitcher } from "@/components/dev/SectionSwitcher";
import { sectionGroups } from "@/lib/section-registry";
import {
  getPlaygroundSectionVariant,
  type PlaygroundSectionConfig,
} from "@/lib/playground-sections";
import { usePlaygroundSections } from "@/lib/use-playground-sections";

function reorderSections(
  sections: PlaygroundSectionConfig[],
  fromIndex: number,
  toIndex: number,
) {
  if (fromIndex === toIndex) return sections;

  const next = [...sections];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function HomePage() {
  const { sections, setSections, updateSection, duplicateSpacer } = usePlaygroundSections();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  return (
    <main id="main-content">
      {sections.map((config, index) => (
        <PlaygroundSectionSlot
          key={config.id}
          index={index}
          label={
            config.group === "spacer"
              ? `${sectionGroups[config.group].label} ${sections.slice(0, index + 1).filter((s) => s.group === "spacer").length}`
              : sectionGroups[config.group].label
          }
          compactControls={config.group === "spacer"}
          previewChecked={config.preview === true}
          onPreviewChange={(checked) => updateSection(config.id, { preview: checked })}
          onDuplicate={
            config.group === "spacer" ? () => duplicateSpacer(config.id) : undefined
          }
          isDragging={dragIndex === index}
          isDropTarget={overIndex === index && dragIndex !== null && dragIndex !== index}
          onDragStart={setDragIndex}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDragOver={setOverIndex}
          onDrop={(fromIndex, toIndex) => {
            setSections(reorderSections(sections, fromIndex, toIndex));
            setDragIndex(null);
            setOverIndex(null);
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
