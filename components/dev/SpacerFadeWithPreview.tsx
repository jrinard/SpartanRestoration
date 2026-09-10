"use client";

import { SpacerFade } from "@/components/sections/Spacer";
import { useSpacerPreview } from "@/components/dev/SpacerStripePreviewContext";

export function SpacerFadeWithPreview() {
  const context = useSpacerPreview();

  if (!context?.ready) return null;

  return (
    <SpacerFade
      layoutWidth={context.layoutWidth}
      layoutWidthMobile={context.layoutWidthMobile}
      outerBackgroundColor={context.outerBackgroundColor}
    />
  );
}
