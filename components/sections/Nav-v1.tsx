"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { useNavBarPreview } from "@/components/dev/NavBarPreviewContext";
import {
  useHashNavigationClick,
  useResolvePlaygroundHref,
} from "@/components/dev/useHashNavigation";
import { isContactHref } from "@/lib/contact-modal";
import {
  defaultNavBarPreviewSettings,
  getNavBarLayoutWidthClassName,
  isExternalNavHref,
  resolveNavBarLinkTarget,
  type NavBarLink,
} from "@/lib/nav-bar-preview";
import { cn } from "@/lib/utils";

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

type NavBarV1LinksProps = {
  items: readonly NavBarLink[];
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
  resolveHref: (href: string) => string;
  handleHashNavigation: (href: string, event: React.MouseEvent<HTMLAnchorElement>) => void;
  contactModal: ReturnType<typeof useContactModal>;
};

function NavBarV1Links({
  items,
  className,
  linkClassName,
  onNavigate,
  resolveHref,
  handleHashNavigation,
  contactModal,
}: NavBarV1LinksProps) {
  return (
    <ul className={className}>
      {items.map((item) => {
        const isExternal = isExternalNavHref(item.href);
        const opensNewTab = resolveNavBarLinkTarget(item) === "_blank";
        const linkClassNameValue = cn("nav-bar-v1-link", linkClassName);

        if (isExternal) {
          return (
            <li key={item.id} className="nav-bar-v1-item">
              <a
                href={item.href}
                target={opensNewTab ? "_blank" : undefined}
                rel={opensNewTab ? "noopener noreferrer" : undefined}
                onClick={() => onNavigate?.()}
                className={linkClassNameValue}
              >
                {item.label}
              </a>
            </li>
          );
        }

        return (
          <li key={item.id} className="nav-bar-v1-item">
            <Link
              href={resolveHref(item.href)}
              target={opensNewTab ? "_blank" : undefined}
              rel={opensNewTab ? "noopener noreferrer" : undefined}
              onClick={(event) => {
                if (contactModal && isContactHref(item.href)) {
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
  } as CSSProperties;

  const isContained = settings.layoutWidth === "contained";
  const innerBackgroundColor = isContained ? settings.backgroundColor : undefined;

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const linkProps = {
    items: settings.items,
    resolveHref,
    handleHashNavigation,
    contactModal,
  };

  return (
    <section
      className="nav-bar-v1"
      style={{
        ...barStyle,
        backgroundColor: isContained ? settings.outerBackgroundColor : settings.backgroundColor,
      }}
      aria-label="Secondary navigation"
    >
      <div className={cn(getNavBarLayoutWidthClassName(settings.layoutWidth))}>
        <nav
          className="nav-bar-v1-inner"
          style={innerBackgroundColor ? { backgroundColor: innerBackgroundColor } : undefined}
        >
          <NavBarV1Links
            {...linkProps}
            className="nav-bar-v1-list nav-bar-v1-list--desktop"
          />

          <div className="nav-bar-v1-mobile">
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
              className="nav-bar-v1-mobile-list"
              linkClassName="nav-bar-v1-link--mobile"
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </nav>
      </div>
    </section>
  );
}
