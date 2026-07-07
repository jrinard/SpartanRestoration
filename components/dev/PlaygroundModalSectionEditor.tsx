"use client";

import { SectionSwitcher } from "@/components/dev/SectionSwitcher";
import {
  getPlaygroundModalSectionHint,
  getPlaygroundModalSectionLabel,
} from "@/lib/playground-modal-sections";
import {
  getPlaygroundSectionVariant,
  type PlaygroundSectionConfig,
} from "@/lib/playground-sections";

type PlaygroundModalSectionEditorProps = {
  config: PlaygroundSectionConfig;
  onVariantChange: (variantId: string) => void;
};

/** Playground editor for modal-only sections (contact popup, etc.). */
export function PlaygroundModalSectionEditor({
  config,
  onVariantChange,
}: PlaygroundModalSectionEditorProps) {
  const label = getPlaygroundModalSectionLabel(config.group);
  const hint = getPlaygroundModalSectionHint(config.group);

  return (
    <section
      className="playground-modal-section-editor border-b border-accent-purple/25 bg-accent-purple/[0.06]"
      aria-label={`${label} editor`}
      data-modal-section={config.group}
    >
      <div className="border-b border-accent-purple/15 px-6 py-3 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs tracking-wide text-accent-purple uppercase">
              Modal · {label}
            </p>
            <p className="mt-1 max-w-3xl text-sm text-muted">{hint}</p>
          </div>
          <span className="shrink-0 rounded border border-accent-purple/30 bg-background/80 px-2 py-1 font-mono text-[10px] tracking-wide text-accent-purple/90 uppercase">
            Not on page
          </span>
        </div>
      </div>

      <div className="playground-modal-section-editor-body">
        <SectionSwitcher
          group={config.group}
          sectionId={config.id}
          defaultVariant={config.defaultVariant}
          variant={getPlaygroundSectionVariant(config)}
          onVariantChange={onVariantChange}
        />
      </div>
    </section>
  );
}
