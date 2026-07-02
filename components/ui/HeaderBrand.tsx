"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useHeaderV3Preview } from "@/components/dev/HeaderV3PreviewContext";
import { useCreativeThemeOptional } from "@/components/dev/CreativeProvider";
import { defaultColorThemeId } from "@/lib/color-themes";
import { getBrandLogoSrc, usesLifeSpringLogo } from "@/lib/brand-logo";
import {
  defaultHeaderV3PreviewSettings,
  getHeaderLogoImageHeightPx,
} from "@/lib/header-v3-gradient";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type HeaderBrandProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  /** Text wordmark instead of logo image. */
  wordmark?: string;
  headerVariant?: "header-v1" | "header-v2" | "header-v3";
};

/** Theme-aware header logo — LifeSpring assets or the Spartan brand mark. */
export function HeaderBrand({
  className,
  width = 240,
  height = 82,
  priority,
  wordmark,
  headerVariant = "header-v3",
}: HeaderBrandProps) {
  const creativeTheme = useCreativeThemeOptional();
  const headerPreview = useHeaderV3Preview();
  const colorThemeId = creativeTheme?.colorThemeId ?? defaultColorThemeId;
  const settings = headerPreview?.settings ?? defaultHeaderV3PreviewSettings;
  const customLogoHeightPx =
    headerVariant === "header-v1" || headerVariant === "header-v2"
      ? getHeaderLogoImageHeightPx(settings, headerVariant)
      : null;
  const usesCustomLogoHeight =
    (headerVariant === "header-v1" || headerVariant === "header-v2") &&
    customLogoHeightPx !== null;

  if (wordmark) {
    return (
      <span
        className={cn("header-theme-wordmark inline-flex items-center text-center", className)}
        aria-label={wordmark}
      >
        {wordmark}
      </span>
    );
  }

  const logoVariant = settings.logoVariant;

  const imageStyle: CSSProperties | undefined = usesCustomLogoHeight
    ? {
        height: `${customLogoHeightPx}px`,
        width: "auto",
      }
    : undefined;

  return (
    <Image
      src={getBrandLogoSrc(colorThemeId, logoVariant)}
      alt={siteConfig.name}
      width={width}
      height={height}
      className={cn(
        "header-brand-logo w-auto object-contain",
        usesCustomLogoHeight
          ? "header-brand-logo--custom-height max-h-none object-left"
          : "h-14 max-h-full object-left",
        !usesLifeSpringLogo(colorThemeId) && "header-brand-logo--spartan",
        className,
      )}
      style={imageStyle}
      priority={priority}
    />
  );
}
