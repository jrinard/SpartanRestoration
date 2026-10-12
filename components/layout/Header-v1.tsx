"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Images } from "lucide-react";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { useHeaderV3Preview } from "@/components/dev/HeaderV3PreviewContext";
import { HeaderBrand } from "@/components/ui/HeaderBrand";
import { HeaderBrandLink } from "@/components/ui/HeaderBrandLink";
import { HeaderV1Nav } from "@/components/layout/HeaderV1Nav";
import {
  defaultHeaderV3PreviewSettings,
  getHeaderBackgroundLayerHeightPx,
  getHeaderBarButtonStyleRecord,
  getHeaderCustomBackground,
  getHeaderInnerHeightStyle,
  getHeaderLayoutWidthClassName,
  getHeaderLogoImageHeightPx,
  getHeaderLogoLinkStyle,
  getHeaderLogoVerticalAlignClassName,
  headerLogoOverflows,
  headerV1MobileNavIsOn,
  resolveHeaderLibraryLogoSrc,
} from "@/lib/header-v3-gradient";
import {
  devLibraryIconSize,
  devLibraryLabelClassName,
  devLibraryPillClassName,
} from "@/lib/dev-overlay-controls";
import { usePlaygroundImageLibraryFolder } from "@/lib/use-playground-image-library-folder";
import { cn } from "@/lib/utils";

type HeaderV1Props = {
  className?: string;
};

function HeaderV1MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="header-v1-mobile-icon" aria-hidden="true">
        <path
          fill="currentColor"
          d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4l-6.29 6.31-1.42-1.42L9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.29-6.3z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="header-v1-mobile-icon" aria-hidden="true">
      <path fill="currentColor" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
    </svg>
  );
}

/** Classic header — logo left, navigation right. */
export function HeaderV1({ className }: HeaderV1Props) {
  const preview = useHeaderV3Preview();
  const settings = preview?.settings ?? defaultHeaderV3PreviewSettings;
  const canEditLogo = preview?.contentEditingEnabled ?? false;
  const { folder: libraryFolder } = usePlaygroundImageLibraryFolder();
  const logoSrc = resolveHeaderLibraryLogoSrc(settings, libraryFolder);
  const [logoLibraryOpen, setLogoLibraryOpen] = useState(false);
  const layoutWidth = settings.layoutWidth;
  const layoutWidthMobile = settings.layoutWidthMobile;
  const isCustom = Boolean(preview);
  const includeMobileNav = headerV1MobileNavIsOn(settings);
  const logoOverflow = headerLogoOverflows(settings, "header-v1");
  const logoImageHeightPx = getHeaderLogoImageHeightPx(settings, "header-v1");
  const backgroundLayerHeightPx = getHeaderBackgroundLayerHeightPx(settings, "header-v1");
  const [mobileOpen, setMobileOpen] = useState(false);

  const style: CSSProperties | undefined = preview
    ? {
        ...getHeaderBarButtonStyleRecord(settings),
        ...(logoImageHeightPx !== null
          ? ({ "--header-logo-height": `${logoImageHeightPx}px` } as CSSProperties)
          : {}),
      }
    : undefined;

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!includeMobileNav) setMobileOpen(false);
  }, [includeMobileNav]);

  return (
    <header
      className={cn(
        "header-v1 relative",
        !isCustom && "bg-background/80 backdrop-blur-sm",
        isCustom && "header-custom",
        logoOverflow && "header-logo-overflow",
        includeMobileNav && "header-v1--mobile-nav",
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
          getHeaderLayoutWidthClassName(layoutWidth, layoutWidthMobile),
          "relative z-10 flex items-center overflow-visible",
          includeMobileNav ? "justify-between" : "justify-center md:justify-between",
        )}
        style={getHeaderInnerHeightStyle(settings, "header-v1")}
      >
        <HeaderBrandLink
          className={cn(
            "header-brand-link relative flex shrink-0 items-center max-md:px-4",
            includeMobileNav
              ? "max-md:min-w-0"
              : "max-md:mx-auto max-md:w-full max-md:justify-center",
            logoOverflow && "header-brand-link--overflow",
            (settings.logoMarginTopPx > 0 ||
              settings.logoHeightPx > 0 ||
              settings.logoSizePx > 0) &&
              "header-brand-link--offset",
            getHeaderLogoVerticalAlignClassName(settings.logoVerticalAlign),
          )}
          style={isCustom ? getHeaderLogoLinkStyle(settings, "header-v1") : undefined}
        >
          <HeaderBrand
            priority
            headerVariant="header-v1"
            className={
              includeMobileNav ? "max-md:object-left" : "max-md:mx-auto max-md:object-center"
            }
          />
          {canEditLogo && preview ? (
            <>
              <button
                type="button"
                onClick={() => setLogoLibraryOpen((open) => !open)}
                className={cn(devLibraryPillClassName, "absolute -bottom-1 left-0 z-20")}
                aria-label="Choose header logo from library"
                aria-expanded={logoLibraryOpen}
              >
                <Images size={devLibraryIconSize} strokeWidth={2} />
                <span className={devLibraryLabelClassName}>Library</span>
              </button>
              {logoLibraryOpen ? (
                <div className="absolute top-full left-0 z-40 mt-2">
                  <ImageLibraryPicker
                    value={logoSrc}
                    onSelect={(entry) => {
                      preview.setSettings({ ...settings, headerLogoSrc: entry.src });
                      setLogoLibraryOpen(false);
                    }}
                    onClose={() => setLogoLibraryOpen(false)}
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </HeaderBrandLink>
        <HeaderV1Nav
          ariaLabel="Service navigation"
          className="header-custom-nav hidden justify-end md:flex"
        />
        {includeMobileNav ? (
          <>
            <div className="header-v1-mobile">
              <button
                type="button"
                className="header-v1-mobile-toggle"
                aria-expanded={mobileOpen}
                aria-controls="header-v1-mobile-menu"
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                onClick={() => setMobileOpen((open) => !open)}
              >
                <HeaderV1MenuIcon open={mobileOpen} />
              </button>
            </div>
            <div
              id="header-v1-mobile-menu"
              className={cn(
                "header-v1-mobile-menu bg-background",
                mobileOpen ? "block" : "hidden",
              )}
              style={
                isCustom ? { background: getHeaderCustomBackground(settings) } : undefined
              }
            >
              <HeaderV1Nav
                ariaLabel="Mobile navigation"
                layout="mobile"
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
