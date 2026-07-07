"use client";

import { useState } from "react";
import Link from "next/link";
import { Shuffle } from "lucide-react";
import { useHeaderV3Preview } from "@/components/dev/HeaderV3PreviewContext";
import { LucideIconPicker } from "@/components/dev/LucideIconPicker";
import { IconFrame } from "@/components/icons/IconFrame";
import {
  defaultHeaderV1NavLinks,
  getHeaderV1NavLinkHref,
  resolveHeaderV1NavLinkIcon,
  type HeaderV1NavLink,
} from "@/lib/header-v1-nav";
import {
  defaultHeaderV3PreviewSettings,
  defaultHeaderV1NavIconColor,
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
            type="button"
            onClick={() => setIconPickerOpen((open) => !open)}
            className={devEditButtonClassName}
            aria-label={`Change icon for ${itemLabel.replace("\n", " ")}`}
            aria-expanded={iconPickerOpen}
          >
            <Shuffle size={devEditIconSize} strokeWidth={2} />
          </button>
          {iconPickerOpen && (
            <div className="absolute top-8 left-1/2 z-30 -translate-x-1/2">
              <LucideIconPicker
                value={iconName}
                onChange={onIconChange}
                onClose={() => setIconPickerOpen(false)}
              />
            </div>
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
}: HeaderV1NavProps) {
  const preview = useHeaderV3Preview();
  const isCustom = Boolean(preview);
  const iconEditingEnabled = preview?.contentEditingEnabled ?? false;
  const resolveHref = useResolvePlaygroundHref();
  const handleHashNavigation = useHashNavigationClick();
  const settings = preview?.settings ?? defaultHeaderV3PreviewSettings;
  const navLinks = preview
    ? settings.headerV1NavLinks
    : links ?? defaultHeaderV1NavLinks;

  if (navLinks.length === 0) return null;

  return (
    <nav
      className={cn(
        "header-v1-nav header-v3-nav grid grid-flow-col auto-cols-[10rem] grid-rows-[auto_auto] justify-end gap-x-2 gap-y-1.5 sm:auto-cols-[11rem] lg:gap-3",
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
            onClick={(event) => handleHashNavigation(itemHref, event)}
            className={cn(
              "header-v1-nav-item group contents text-center no-underline",
              !isCustom && "text-muted transition-colors hover:text-foreground",
            )}
          >
            <HeaderV1NavIcon
              itemId={link.id}
              itemLabel={link.label}
              fallbackIcon={fallbackIcon}
              iconEditingEnabled={iconEditingEnabled}
              onIconChange={
                preview ? (nextIcon) => preview.setNavItemIcon(link.id, nextIcon) : undefined
              }
            />
            <span
              className={cn(
                "header-v1-nav-link inline-flex w-full items-start justify-center justify-self-stretch px-3 py-2 font-bold leading-tight tracking-wide",
                isCustom ? "header-v3-nav-link radial-hover-shine" : "text-sm",
              )}
            >
              <span
                className={cn(
                  "header-v1-nav-label whitespace-pre-line",
                  isCustom && "relative z-[1]",
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
