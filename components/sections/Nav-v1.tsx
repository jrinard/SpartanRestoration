"use client";

import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from "react";
import Link from "next/link";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { useNavBarPreview } from "@/components/dev/NavBarPreviewContext";
import {
  useHashNavigationClick,
  useResolvePlaygroundHref,
} from "@/components/dev/useHashNavigation";
import {
  defaultNavBarPreviewSettings,
  filterNavBarLinksForViewport,
  getNavBarMobileToggleAlignClassName,
  getNavBarLayoutWidthClassName,
  isExternalNavHref,
  navBarLinkHasDropdown,
  navBarLinkOpensContactModal,
  resolveNavBarLinkTarget,
  type NavBarDropdownItem,
  type NavBarLink,
} from "@/lib/nav-bar-preview";
import { cn } from "@/lib/utils";

function NavBarDropdownChevron() {
  return (
    <svg viewBox="0 0 10 10" className="nav-bar-v1-dropdown-chevron" aria-hidden="true">
      <path fill="currentColor" d="M2 1.5 8 5 2 8.5Z" />
    </svg>
  );
}

function NavBarMenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="nav-bar-v1-mobile-icon" aria-hidden="true">
        <path
          fill="currentColor"
          d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4l-6.29 6.31-1.42-1.42L9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.29-6.3z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="nav-bar-v1-mobile-icon" aria-hidden="true">
      <path fill="currentColor" d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
    </svg>
  );
}

type NavBarV1LinkRenderProps = {
  item: NavBarLink | NavBarDropdownItem;
  linkClassName?: string;
  onNavigate?: () => void;
  resolveHref: (href: string) => string;
  handleHashNavigation: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
  contactModal: ReturnType<typeof useContactModal>;
};

function NavBarV1Anchor({
  item,
  linkClassName,
  onNavigate,
  resolveHref,
  handleHashNavigation,
  contactModal,
}: NavBarV1LinkRenderProps) {
  const isExternal = isExternalNavHref(item.href);
  const opensNewTab = resolveNavBarLinkTarget(item) === "_blank";
  const linkClassNameValue = cn("nav-bar-v1-link", linkClassName);

  if (isExternal) {
    return (
      <a
        href={item.href}
        target={opensNewTab ? "_blank" : undefined}
        rel={opensNewTab ? "noopener noreferrer" : undefined}
        onClick={() => onNavigate?.()}
        className={linkClassNameValue}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link
      href={resolveHref(item.href)}
      target={opensNewTab ? "_blank" : undefined}
      rel={opensNewTab ? "noopener noreferrer" : undefined}
      onClick={(event) => {
        if (contactModal && navBarLinkOpensContactModal(item)) {
          event.preventDefault();
          contactModal.openContact();
          onNavigate?.();
          return;
        }
        handleHashNavigation(item.href, event);
        onNavigate?.();
      }}
      className={linkClassNameValue}
    >
      {item.label}
    </Link>
  );
}

type NavBarV1LinksProps = {
  items: readonly NavBarLink[];
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
  resolveHref: (href: string) => string;
  handleHashNavigation: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
  contactModal: ReturnType<typeof useContactModal>;
  menuVariant?: "desktop" | "mobile";
};

function NavBarV1Links({
  items,
  className,
  linkClassName,
  onNavigate,
  resolveHref,
  handleHashNavigation,
  contactModal,
  menuVariant = "desktop",
}: NavBarV1LinksProps) {
  const linkProps = {
    linkClassName,
    onNavigate,
    resolveHref,
    handleHashNavigation,
    contactModal,
  };

  return (
    <ul className={className}>
      {items.map((item) => {
        const hasDropdown = navBarLinkHasDropdown(item);

        if (!hasDropdown) {
          return (
            <li key={item.id} className="nav-bar-v1-item">
              <NavBarV1Anchor item={item} {...linkProps} />
            </li>
          );
        }

        const dropdownItems = item.dropdownItems ?? [];

        if (menuVariant === "mobile") {
          return (
            <li key={item.id} className="nav-bar-v1-item nav-bar-v1-item--dropdown-mobile">
              <div className={cn("nav-bar-v1-dropdown-trigger", linkClassName)}>
                <NavBarDropdownChevron />
                <NavBarV1Anchor
                  item={item}
                  {...linkProps}
                  linkClassName="nav-bar-v1-dropdown-label-link"
                />
              </div>
              <ul className="nav-bar-v1-dropdown-mobile-list">
                {dropdownItems.map((sub) => (
                  <li key={sub.id} className="nav-bar-v1-item">
                    <NavBarV1Anchor
                      item={sub}
                      {...linkProps}
                      linkClassName={cn(linkClassName, "nav-bar-v1-link--dropdown-sub")}
                    />
                  </li>
                ))}
              </ul>
            </li>
          );
        }

        return (
          <li key={item.id} className="nav-bar-v1-item nav-bar-v1-item--dropdown">
            <div className="nav-bar-v1-dropdown">
              <div className={cn("nav-bar-v1-dropdown-trigger", linkClassName)}>
                <NavBarDropdownChevron />
                <NavBarV1Anchor
                  item={item}
                  {...linkProps}
                  linkClassName="nav-bar-v1-dropdown-label-link"
                />
              </div>
              <ul className="nav-bar-v1-dropdown-menu" role="menu" aria-label={`${item.label} menu`}>
                {dropdownItems.map((sub) => (
                  <li key={sub.id} role="none">
                    <NavBarV1Anchor
                      item={sub}
                      {...linkProps}
                      linkClassName="nav-bar-v1-link nav-bar-v1-link--dropdown-sub"
                      onNavigate={() => {
                        onNavigate?.();
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Secondary navigation bar — evenly spaced links on a solid background. */
export function NavV1() {
  const preview = useNavBarPreview();
  const settings = preview?.settings ?? defaultNavBarPreviewSettings;
  const resolveHref = useResolvePlaygroundHref();
  const handleHashNavigation = useHashNavigationClick();
  const contactModal = useContactModal();
  const [mobileOpen, setMobileOpen] = useState(false);

  const barStyle = {
    "--nav-bar-height": `${settings.heightPx}px`,
    "--nav-bar-link-color": settings.linkColor,
    "--nav-bar-link-hover-color": settings.linkHoverColor,
    "--nav-bar-dropdown-bg": settings.backgroundColor,
  } as CSSProperties;

  const isContained = settings.layoutWidth === "contained";
  const mobileWidth = settings.layoutWidthMobile ?? settings.layoutWidth;
  const mobileFullDesktopContained =
    mobileWidth === "full" && settings.layoutWidth === "contained";
  const innerBackgroundColor = isContained ? settings.backgroundColor : undefined;

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const desktopItems = useMemo(
    () => filterNavBarLinksForViewport(settings.items, "desktop"),
    [settings.items],
  );
  const mobileItems = useMemo(
    () => filterNavBarLinksForViewport(settings.items, "mobile"),
    [settings.items],
  );

  const linkProps = {
    resolveHref,
    handleHashNavigation,
    contactModal,
  };

  return (
    <section
      className={cn(
        "nav-bar-v1",
        mobileFullDesktopContained && "lg:!bg-[var(--nav-outer-bg)]",
      )}
      style={{
        ...barStyle,
        ...(mobileFullDesktopContained
          ? ({
              backgroundColor: settings.backgroundColor,
              ["--nav-outer-bg" as string]: settings.outerBackgroundColor,
            } as CSSProperties)
          : {
              backgroundColor: isContained
                ? settings.outerBackgroundColor
                : settings.backgroundColor,
            }),
      }}
      aria-label="Secondary navigation"
    >
      <div
        className={cn(
          getNavBarLayoutWidthClassName(settings.layoutWidth, settings.layoutWidthMobile),
        )}
      >
        <nav
          className="nav-bar-v1-inner"
          style={innerBackgroundColor ? { backgroundColor: innerBackgroundColor } : undefined}
        >
          <NavBarV1Links
            {...linkProps}
            items={desktopItems}
            className="nav-bar-v1-list nav-bar-v1-list--desktop"
            menuVariant="desktop"
          />

          <div
            className={cn(
              "nav-bar-v1-mobile",
              getNavBarMobileToggleAlignClassName(settings.mobileToggleAlign),
            )}
          >
            <button
              type="button"
              className="nav-bar-v1-mobile-toggle"
              aria-expanded={mobileOpen}
              aria-controls="nav-bar-v1-mobile-menu"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <NavBarMenuIcon open={mobileOpen} />
            </button>
          </div>

          <div
            id="nav-bar-v1-mobile-menu"
            className={cn("nav-bar-v1-mobile-menu", mobileOpen ? "block" : "hidden")}
            style={innerBackgroundColor ? { backgroundColor: innerBackgroundColor } : undefined}
          >
            <NavBarV1Links
              {...linkProps}
              items={mobileItems}
              className="nav-bar-v1-mobile-list"
              linkClassName="nav-bar-v1-link--mobile"
              onNavigate={() => setMobileOpen(false)}
              menuVariant="mobile"
            />
          </div>
        </nav>
      </div>
    </section>
  );
}
