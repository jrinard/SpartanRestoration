"use client";

import Image from "next/image";
import { useHeaderV3Preview } from "@/components/dev/HeaderV3PreviewContext";
import { useCreativeThemeOptional } from "@/components/dev/CreativeProvider";
import { getColorTheme } from "@/lib/color-themes";
import { defaultHeaderV3PreviewSettings } from "@/lib/header-v3-gradient";
import { getLifeSpringLogoSrc } from "@/lib/lifespring-logo";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type HeaderBrandProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

/** LifeSpring logo in the header, or the active theme name for all other preview themes. */
export function HeaderBrand({ className, width = 240, height = 82, priority }: HeaderBrandProps) {
  const creativeTheme = useCreativeThemeOptional();
  const headerPreview = useHeaderV3Preview();

  if (creativeTheme && creativeTheme.colorThemeId !== "lifespring") {
    const theme = getColorTheme(creativeTheme.colorThemeId);
    const wordmark = theme.headerWordmark ?? theme.label;

    return (
      <span
        className={cn("header-theme-wordmark inline-flex items-center", className)}
        aria-label={wordmark}
      >
        {wordmark}
      </span>
    );
  }

  const logoVariant =
    headerPreview?.settings.logoVariant ?? defaultHeaderV3PreviewSettings.logoVariant;

  return (
    <Image
      src={getLifeSpringLogoSrc(logoVariant)}
      alt={siteConfig.name}
      width={width}
      height={height}
      className={cn("h-14 w-auto", className)}
      priority={priority}
    />
  );
}
