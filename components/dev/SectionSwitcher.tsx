"use client";

import { useState } from "react";
import {
  getSectionVariant,
  sectionGroups,
  type SectionGroupId,
} from "@/lib/section-registry";
import { cn } from "@/lib/utils";

type SectionSwitcherProps = {
  group: SectionGroupId;
  defaultVariant?: string;
  className?: string;
};

/**
 * Preview-only section wrapper with a dropdown to swap component variants.
 */
export function SectionSwitcher({ group, defaultVariant, className }: SectionSwitcherProps) {
  const section = sectionGroups[group];
  const initialVariant = defaultVariant ?? section.defaultVariant;
  const [variantId, setVariantId] = useState(initialVariant);

  const activeVariant = getSectionVariant(group, variantId);

  return (
    <div className={cn("relative", className)}>
      <label className="absolute top-4 left-6 z-20 flex items-center gap-2 lg:left-8">
        <span className="section-switcher-label font-mono text-sm tracking-widest text-accent-purple uppercase">
          {section.label}
        </span>
        <select
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none"
        >
          {Object.entries(section.variants).map(([key, variant]) => (
            <option key={key} value={key}>
              {variant.label}
            </option>
          ))}
        </select>
      </label>
      {activeVariant.render()}
    </div>
  );
}
