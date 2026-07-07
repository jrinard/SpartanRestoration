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
  getHeaderLogoImageHeightPx,
  getHeaderLogoLinkStyle,
  headerLogoOverflows,
} from "@/lib/header-v3-gradient";
import { cn } from "@/lib/utils";

type HeaderV2Props = {
  className?: string;
};

const headerV2Nav = siteConfig.primaryNav;

function splitHeaderV2Nav() {
  const midpoint = Math.ceil(headerV2Nav.length / 2);
  return {
    left: headerV2Nav.slice(0, midpoint),
    right: headerV2Nav.slice(midpoint),
  };
}

/** Centered logo — navigation split on left and right. */
export function HeaderV2({ className }: HeaderV2Props) {
  const preview = useHeaderV3Preview();
  const settings = preview?.settings ?? defaultHeaderV3PreviewSettings;
  const { left, right } = splitHeaderV2Nav();
  const layoutWidth = settings.layoutWidth;
  const isCustom = Boolean(preview);
  const logoOverflow = headerLogoOverflows(settings, "header-v2");
  const logoImageHeightPx = getHeaderLogoImageHeightPx(settings, "header-v2");
  const backgroundLayerHeightPx = getHeaderBackgroundLayerHeightPx(settings, "header-v2");

  const style: CSSProperties | undefined = preview
    ? {
        ...getHeaderBarButtonStyleRecord(settings),
        ...(logoImageHeightPx !== null
          ? ({ "--header-logo-height": `${logoImageHeightPx}px` } as CSSProperties)
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
      data-logo-height={logoImageHeightPx !== null ? logoImageHeightPx : undefined}
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
          "header-v2-inner relative z-10 grid grid-cols-[1fr_auto_1fr] items-center gap-x-6 gap-y-4 overflow-visible",
        )}
        style={getHeaderInnerHeightStyle(settings, "header-v2")}
      >
        <HeaderV3Nav
          items={left}
          ariaLabel="Primary navigation (left)"
          className="header-v2-nav-left header-custom-nav hidden justify-end md:flex"
        />
        <HeaderBrandLink
          className={cn(
            "header-brand-link flex justify-center",
            logoOverflow && "header-brand-link--overflow",
            (settings.logoMarginTopPx > 0 ||
              settings.logoHeightPx > 0 ||
              settings.logoSizePx > 0) &&
              "header-brand-link--offset",
          )}
          style={isCustom ? getHeaderLogoLinkStyle(settings, "header-v2") : undefined}
        >
          <HeaderBrand priority headerVariant="header-v2" />
        </HeaderBrandLink>
        <HeaderV3Nav
          items={right}
          ariaLabel="Primary navigation (right)"
          className="header-v2-nav-right header-custom-nav hidden justify-start md:flex"
        />
      </div>
    </header>
  );
}
