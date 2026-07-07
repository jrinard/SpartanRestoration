"use client";

import { SpacerLine } from "@/components/sections/Spacer";
import { useSpacerPreview } from "@/components/dev/SpacerStripePreviewContext";

export function SpacerLineWithPreview() {
  const context = useSpacerPreview();

  if (!context?.ready) return null;

  return (
    <SpacerLine
      layoutWidth={context.layoutWidth}
      outerBackgroundColor={context.outerBackgroundColor}
    />
  );
}
