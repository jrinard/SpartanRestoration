"use client";

import { useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { useHeaderV3Preview } from "@/components/dev/HeaderV3PreviewContext";
import { LucideIconPicker } from "@/components/dev/LucideIconPicker";
import { IconFrame } from "@/components/icons/IconFrame";
import {
  defaultHeaderV1NavLinks,
  getHeaderV1NavLinkHref,
  headerV1NavLinkOpensContact,
  resolveHeaderV1NavLinkIcon,
  type HeaderV1NavLink,
} from "@/lib/header-v1-nav";
import {
  defaultHeaderV3PreviewSettings,
  defaultHeaderV1NavIconColor,
  getHeaderV1NavFontStyle,
  headerV1NavIconsAreVisible,
  headerV1NavTiltIsOn,
  pickHeaderV1NavIconFrameSettings,
} from "@/lib/header-v3-gradient";
import { defaultSiteIconName, type SiteIconName } from "@/lib/site-icons";
import {
  useHashNavigationClick,
  useResolvePlaygroundHref,
} from "@/components/dev/useHashNavigation";
import {
  devEditButtonClassName,
  devEditIconSize,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

type HeaderV1NavProps = {
  links?: readonly HeaderV1NavLink[];
  ariaLabel?: string;
  className?: string;
  /** Desktop icon/label grid, or a vertical list for the header hamburger. */
  layout?: "bar" | "mobile";
  onNavigate?: () => void;
};

function HeaderV1NavIcon({
  itemId,
  itemLabel,
  fallbackIcon,
  iconEditingEnabled,
  onIconChange,
}: {
  itemId: string;
  itemLabel: string;
  fallbackIcon: SiteIconName;
  iconEditingEnabled: boolean;
  onIconChange?: (iconName: SiteIconName) => void;
}) {
  const preview = useHeaderV3Preview();
  const settings = preview?.settings ?? defaultHeaderV3PreviewSettings;
  const iconName = preview?.getNavItemIcon(itemId, fallbackIcon) ?? fallbackIcon;
  const iconFrame = pickHeaderV1NavIconFrameSettings(settings);
  const iconColor = iconFrame.iconColor || defaultHeaderV1NavIconColor;
  const iconBorderColor = iconFrame.iconBorderColor || iconColor;
  const iconBackgroundColor = iconFrame.iconBackgroundColor || "transparent";
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const iconButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative shrink-0 justify-self-center">
      <IconFrame
        iconName={iconName}
        shape={iconFrame.iconFrameShape}
        size={iconFrame.iconFrameSize}
        iconColor={iconColor}
        borderColor={iconBorderColor}
        backgroundColor={iconBackgroundColor}
        context="header-v1"
        className="header-v1-nav-icon"
      />
      {iconEditingEnabled && onIconChange && (
        <>
          <button
            ref={iconButtonRef}
            type="button"
            onClick={() => setIconPickerOpen((open) => !open)}
            className={devEditButtonClassName}
            aria-label={`Change icon for ${itemLabel.replace("\n", " ")}`}
            aria-expanded={iconPickerOpen}
          >
            <Shuffle size={devEditIconSize} strokeWidth={2} />
          </button>
          {iconPickerOpen && (
            <LucideIconPicker
              value={iconName}
              onChange={onIconChange}
              onClose={() => setIconPickerOpen(false)}
              anchorRef={iconButtonRef}
            />
          )}
        </>
      )}
    </div>
  );
}

/** Header v1 navigation — icon above label button. */
export function HeaderV1Nav({
  links,
  ariaLabel = "Service navigation",
  className,
  layout = "bar",
  onNavigate,
}: HeaderV1NavProps) {
  const preview = useHeaderV3Preview();
  const contactModal = useContactModal();
  const isCustom = Boolean(preview);
  const iconEditingEnabled = preview?.contentEditingEnabled ?? false;
  const resolveHref = useResolvePlaygroundHref();
  const handleHashNavigation = useHashNavigationClick();

  function handleNavClick(
    link: HeaderV1NavLink,
    itemHref: string,
    event: MouseEvent<HTMLAnchorElement>,
  ) {
    if (contactModal && headerV1NavLinkOpensContact(link)) {
      event.preventDefault();
      contactModal.openContact();
      onNavigate?.();
      return;
    }
    handleHashNavigation(itemHref, event);
    onNavigate?.();
  }
  const settings = preview?.settings ?? defaultHeaderV3PreviewSettings;
  const showIcons = headerV1NavIconsAreVisible(settings);
  const tiltButtons = headerV1NavTiltIsOn(settings);
  const navFontStyle = getHeaderV1NavFontStyle(settings);
  const navLinks =
    links !== undefined
      ? links
      : preview
        ? settings.headerV1NavLinks
        : defaultHeaderV1NavLinks;

  if (navLinks.length === 0) return null;

  if (layout === "mobile") {
    return (
      <nav className={cn("header-v1-mobile-list", className)} aria-label={ariaLabel}>
        {navLinks.map((link) => {
          const itemHref = getHeaderV1NavLinkHref(link);
          const resolvedHref = resolveHref(itemHref);

          return (
            <Link
              key={link.id}
              href={resolvedHref}
              onClick={(event) => handleNavClick(link, itemHref, event)}
              className={cn(
                "header-v1-mobile-link no-underline",
                isCustom && "header-v1-mobile-link--custom",
              )}
            >
              <span
                className={cn(
                  "header-v1-nav-label whitespace-pre-line",
                  navFontStyle === "italic" && "header-v1-nav-label--italic",
                  navFontStyle === "slant" && "header-v1-nav-label--slant",
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      className={cn(
        "header-v1-nav header-v3-nav grid grid-flow-col auto-cols-[10rem] justify-end gap-x-2 gap-y-1.5 sm:auto-cols-[11rem] lg:gap-3",
        showIcons ? "grid-rows-[auto_auto]" : "grid-rows-[auto]",
        tiltButtons && "header-v1-nav--tilt",
        navFontStyle === "italic" && "header-v1-nav--style-italic",
        navFontStyle === "slant" && "header-v1-nav--style-slant",
        className,
      )}
      aria-label={ariaLabel}
    >
      {navLinks.map((link) => {
        const fallbackIcon = resolveHeaderV1NavLinkIcon(link);
        const itemHref = getHeaderV1NavLinkHref(link);
        const resolvedHref = resolveHref(itemHref);

        return (
          <Link
            key={link.id}
            href={resolvedHref}
            onClick={(event) => handleNavClick(link, itemHref, event)}
            className={cn(
              "header-v1-nav-item group contents text-center no-underline",
              !isCustom && "text-muted transition-colors hover:text-foreground",
            )}
          >
            {showIcons ? (
              <HeaderV1NavIcon
                itemId={link.id}
                itemLabel={link.label}
                fallbackIcon={fallbackIcon}
                iconEditingEnabled={iconEditingEnabled}
                onIconChange={
                  preview ? (nextIcon) => preview.setNavItemIcon(link.id, nextIcon) : undefined
                }
              />
            ) : null}
            <span
              className={cn(
                "header-v1-nav-link inline-flex w-full items-start justify-center justify-self-stretch px-3 py-2 font-bold leading-tight tracking-wide",
                isCustom ? "header-v3-nav-link" : "text-sm",
                tiltButtons && "header-v1-nav-link--tilt",
              )}
            >
              <span
                className={cn(
                  "header-v1-nav-label whitespace-pre-line",
                  isCustom && "relative z-[1]",
                  navFontStyle === "italic" && "header-v1-nav-label--italic",
                  navFontStyle === "slant" && "header-v1-nav-label--slant",
                )}
              >
                {link.label}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
