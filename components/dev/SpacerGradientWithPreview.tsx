"use client";

import { SpacerGradient } from "@/components/sections/Spacer";
import { useSpacerPreview } from "@/components/dev/SpacerStripePreviewContext";

export function SpacerGradientWithPreview() {
  const context = useSpacerPreview();

  if (!context?.ready) return null;

  return (
    <SpacerGradient
      style={context.gradient}
      layoutWidth={context.layoutWidth}
      outerBackgroundColor={context.outerBackgroundColor}
    />
  );
}
