"use client";

import type { CSSProperties } from "react";
import { useHeaderV3Preview } from "@/components/dev/HeaderV3PreviewContext";
import { HeaderBrand } from "@/components/ui/HeaderBrand";
import { HeaderBrandLink } from "@/components/ui/HeaderBrandLink";
import { HeaderV1Nav } from "@/components/layout/HeaderV1Nav";
import {
  defaultHeaderV1NavLinks,
  partitionHeaderV1NavLinksBySide,
} from "@/lib/header-v1-nav";
import {
  defaultHeaderV3PreviewSettings,
  getHeaderBackgroundLayerHeightPx,
  getHeaderBarButtonStyleRecord,
  getHeaderInnerHeightStyle,
  getHeaderLayoutWidthClassName,
  getHeaderV2MobileLogoAlignClassName,
  getHeaderLogoImageHeightPx,
  getHeaderLogoLinkStyle,
  getHeaderLogoVerticalAlignClassName,
  getHeaderV2BarColor,
  getHeaderV2BarInnerBackgroundStyle,
  headerLogoOverflows,
} from "@/lib/header-v3-gradient";
import { cn } from "@/lib/utils";

type HeaderV2Props = {
  className?: string;
};

/** Centered logo — v1-style icon nav split on left and right. */
export function HeaderV2({ className }: HeaderV2Props) {
  const preview = useHeaderV3Preview();
  const settings = preview?.settings ?? defaultHeaderV3PreviewSettings;
  const layoutWidth = settings.layoutWidth;
  const isCustom = Boolean(preview);
  const logoOverflow = headerLogoOverflows(settings, "header-v2");
  const logoImageHeightPx = getHeaderLogoImageHeightPx(settings, "header-v2");
  const backgroundLayerHeightPx = getHeaderBackgroundLayerHeightPx(settings, "header-v2");
  const navLinks = preview ? settings.headerV1NavLinks : defaultHeaderV1NavLinks;
  const { left, right } = partitionHeaderV1NavLinksBySide(navLinks);
  const showNav = settings.headerV2NavVisible && (left.length > 0 || right.length > 0);

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
        "header-v2 relative",
        !isCustom && "border-b border-border bg-background/80 backdrop-blur-sm",
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
            backgroundColor: getHeaderV2BarColor(settings),
          }}
          aria-hidden="true"
        />
      )}
      <div className={cn(getHeaderLayoutWidthClassName(layoutWidth))}>
        <div className="relative w-full">
          {isCustom && (
            <div
              className="header-custom-bg pointer-events-none absolute inset-x-0 top-0 z-0"
              style={{
                height: `${backgroundLayerHeightPx}px`,
                ...getHeaderV2BarInnerBackgroundStyle(settings),
              }}
              aria-hidden="true"
            />
          )}
          <div
            className={cn(
              "header-v2-inner relative z-10 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-x-4 overflow-visible lg:gap-x-6",
              getHeaderV2MobileLogoAlignClassName(settings.headerV2MobileLogoAlign),
            )}
            style={getHeaderInnerHeightStyle(settings, "header-v2")}
          >
            {showNav ? (
              <HeaderV1Nav
                links={left}
                ariaLabel="Service navigation (left)"
                className="header-v2-nav-left header-custom-nav hidden justify-end md:grid"
              />
            ) : (
              <div aria-hidden="true" />
            )}
            <HeaderBrandLink
              className={cn(
                "header-brand-link header-v2-brand-link relative z-50 flex justify-center",
                logoOverflow && "header-brand-link--overflow",
                (settings.logoMarginTopPx !== 0 ||
                  settings.logoHeightPx > 0 ||
                  settings.logoSizePx > 0) &&
                  "header-brand-link--offset",
                getHeaderLogoVerticalAlignClassName(settings.logoVerticalAlign),
              )}
              style={isCustom ? getHeaderLogoLinkStyle(settings, "header-v2") : undefined}
            >
              <HeaderBrand priority headerVariant="header-v2" className="mx-auto object-center" />
            </HeaderBrandLink>
            {showNav ? (
              <HeaderV1Nav
                links={right}
                ariaLabel="Service navigation (right)"
                className="header-v2-nav-right header-custom-nav hidden justify-start md:grid"
              />
            ) : (
              <div aria-hidden="true" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
