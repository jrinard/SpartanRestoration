"use client";

import { useCreativeThemeOptional } from "@/components/dev/CreativeProvider";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { getColorTheme } from "@/lib/color-themes";
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

  return (
    <BrandLogo
      priority={priority}
      className={className}
      width={width}
      height={height}
    />
  );
}
