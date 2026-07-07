"use client";

import Image from "next/image";
import { useFooterV3Preview } from "@/components/dev/FooterV3PreviewContext";
import { useCreativeThemeOptional } from "@/components/dev/CreativeProvider";
import { defaultColorThemeId } from "@/lib/color-themes";
import { getBrandLogoSrc, usesLifeSpringLogo } from "@/lib/brand-logo";
import { defaultFooterV3PreviewSettings } from "@/lib/footer-v3-preview";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type FooterBrandProps = {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function FooterBrand({ className, width = 220, height = 76, priority }: FooterBrandProps) {
  const preview = useFooterV3Preview();
  const creativeTheme = useCreativeThemeOptional();
  const colorThemeId = creativeTheme?.colorThemeId ?? defaultColorThemeId;
  const logoVariant =
    preview?.settings.logoVariant ?? defaultFooterV3PreviewSettings.logoVariant;

  return (
    <Image
      src={getBrandLogoSrc(colorThemeId, logoVariant)}
      alt={`${siteConfig.name} logo`}
      width={width}
      height={height}
      className={cn(
        "footer-brand-logo h-16 w-auto object-contain object-left sm:h-[4.5rem]",
        !usesLifeSpringLogo(colorThemeId) && "footer-brand-logo--spartan",
        className,
      )}
      priority={priority}
    />
  );
}
