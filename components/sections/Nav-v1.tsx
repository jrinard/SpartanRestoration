"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useNavBarPreview } from "@/components/dev/NavBarPreviewContext";
import {
  usePlaygroundNavLinkHref,
  usePlaygroundPageLink,
} from "@/components/dev/usePlaygroundPageLink";
import {
  defaultNavBarPreviewSettings,
  getNavBarLayoutWidthClassName,
} from "@/lib/nav-bar-preview";
import { cn } from "@/lib/utils";

/** Secondary navigation bar — evenly spaced links on a solid background. */
export function NavV1() {
  const preview = useNavBarPreview();
  const settings = preview?.settings ?? defaultNavBarPreviewSettings;
  const handlePageLink = usePlaygroundPageLink();
  const resolveNavHref = usePlaygroundNavLinkHref();

  const barStyle = {
    "--nav-bar-height": `${settings.heightPx}px`,
    "--nav-bar-link-color": settings.linkColor,
    "--nav-bar-link-hover-color": settings.linkHoverColor,
  } as CSSProperties;

  const isContained = settings.layoutWidth === "contained";

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
          style={isContained ? { backgroundColor: settings.backgroundColor } : undefined}
        >
          <ul className="nav-bar-v1-list">
            {settings.items.map((item, index) => (
              <li key={`${item.label}-${item.href}-${index}`} className="nav-bar-v1-item">
                <Link
                  href={resolveNavHref(item.href)}
                  onClick={(event) => handlePageLink(item.href, event)}
                  className="nav-bar-v1-link"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
