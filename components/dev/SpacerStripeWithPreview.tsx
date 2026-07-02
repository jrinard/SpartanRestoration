"use client";

import { SpacerStripe } from "@/components/sections/Spacer";
import { useSpacerStripePreview } from "@/components/dev/SpacerStripePreviewContext";

export function SpacerStripeWithPreview() {
  const context = useSpacerStripePreview();

  if (!context?.ready) return null;

  return (
    <SpacerStripe
      style={context.stripe}
      layoutWidth={context.layoutWidth}
      outerBackgroundColor={context.outerBackgroundColor}
    />
  );
}
