"use client";

import Image from "next/image";
import { useFooterV3Preview } from "@/components/dev/FooterV3PreviewContext";
import { defaultFooterV3PreviewSettings } from "@/lib/footer-v3-preview";
import { getLifeSpringLogoSrc } from "@/lib/lifespring-logo";
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
  const logoVariant =
    preview?.settings.logoVariant ?? defaultFooterV3PreviewSettings.logoVariant;

  return (
    <Image
      src={getLifeSpringLogoSrc(logoVariant)}
      alt={`${siteConfig.name} logo`}
      width={width}
      height={height}
      className={cn("h-16 w-auto sm:h-[4.5rem]", className)}
      priority={priority}
    />
  );
}
