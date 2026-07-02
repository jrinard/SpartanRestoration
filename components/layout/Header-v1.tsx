"use client";

import type { CSSProperties } from "react";
import { useHeaderV3Preview } from "@/components/dev/HeaderV3PreviewContext";
import { siteConfig } from "@/config/site";
import { HeaderBrand } from "@/components/ui/HeaderBrand";
import { HeaderBrandLink } from "@/components/ui/HeaderBrandLink";
import { HeaderV3Nav } from "@/components/layout/HeaderV3Nav";
import {
  defaultHeaderV3PreviewSettings,
  getHeaderBackgroundLayerHeightPx,
  getHeaderBarButtonStyleRecord,
  getHeaderCustomBackground,
  getHeaderInnerHeightStyle,
  getHeaderLayoutWidthClassName,
  getHeaderLogoHeightPx,
  getHeaderLogoLinkStyle,
  headerLogoOverflows,
} from "@/lib/header-v3-gradient";
import { cn } from "@/lib/utils";

type HeaderV1Props = {
  className?: string;
};

/** Classic header — logo left, navigation right. */
export function HeaderV1({ className }: HeaderV1Props) {
  const preview = useHeaderV3Preview();
  const settings = preview?.settings ?? defaultHeaderV3PreviewSettings;
  const layoutWidth = settings.layoutWidth;
  const isCustom = Boolean(preview);
  const logoOverflow = headerLogoOverflows(settings, "header-v1");
  const logoHeightPx = getHeaderLogoHeightPx(settings, "header-v1");
  const backgroundLayerHeightPx = getHeaderBackgroundLayerHeightPx(settings, "header-v1");

  const style: CSSProperties | undefined = preview
    ? {
        ...getHeaderBarButtonStyleRecord(settings),
        ...(settings.logoHeightPx > 0
          ? ({ "--header-logo-height": `${logoHeightPx}px` } as CSSProperties)
          : {}),
      }
    : undefined;

  return (
    <header
      className={cn(
        "relative border-b border-border",
        !isCustom && "bg-background/80 backdrop-blur-sm",
        isCustom && "header-custom",
        logoOverflow && "header-logo-overflow",
        className,
      )}
      style={style}
      data-nav-button-size={settings.navButtonSize}
      data-logo-height={settings.logoHeightPx > 0 ? logoHeightPx : undefined}
    >
      {isCustom && (
        <div
          className="header-custom-bg pointer-events-none absolute inset-x-0 top-0 z-0"
          style={{
            height: `${backgroundLayerHeightPx}px`,
            background: getHeaderCustomBackground(settings),
          }}
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          getHeaderLayoutWidthClassName(layoutWidth),
          "relative z-10 flex items-center justify-between overflow-visible",
        )}
        style={getHeaderInnerHeightStyle(settings, "header-v1")}
      >
        <HeaderBrandLink
          className={cn(
            "header-brand-link flex shrink-0 items-center",
            logoOverflow && "header-brand-link--overflow",
            (settings.logoMarginTopPx > 0 || settings.logoHeightPx > 0) &&
              "header-brand-link--offset",
          )}
          style={isCustom ? getHeaderLogoLinkStyle(settings, "header-v1") : undefined}
        >
          <HeaderBrand priority headerVariant="header-v1" />
        </HeaderBrandLink>
        <HeaderV3Nav
          items={siteConfig.primaryNav}
          ariaLabel="Primary navigation"
          className="header-custom-nav hidden justify-end md:flex"
        />
      </div>
    </header>
  );
}
