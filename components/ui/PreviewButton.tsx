"use client";

import type { CSSProperties, ReactNode } from "react";
import { useHeroV21Preview } from "@/components/dev/HeroV21PreviewContext";
import { getButtonPreviewStyleRecord } from "@/lib/button-preview";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type PreviewButtonProps = {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
};

/** Primary CTA button — uses header-v3 button preview settings when available. */
export function PreviewButton({ children, className, size = "lg" }: PreviewButtonProps) {
  const preview = useHeroV21Preview();
  const buttonSettings = preview?.settings.button;
  const isCustom = Boolean(buttonSettings);

  const style: CSSProperties | undefined = buttonSettings
    ? getButtonPreviewStyleRecord(buttonSettings)
    : undefined;

  return (
    <Button
      size={size}
      className={cn(isCustom && "preview-button--custom", className)}
      style={style}
      data-button-size={buttonSettings?.navButtonSize}
    >
      {children}
    </Button>
  );
}
