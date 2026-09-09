"use client";

import { usePathname } from "next/navigation";
import { useFooterV1Preview } from "@/components/dev/FooterV1PreviewContext";
import { useNavBarPreview } from "@/components/dev/NavBarPreviewContext";
import { usePlaygroundNavLinks } from "@/components/dev/usePlaygroundNavLinks";
import {
  defaultFooterV1PreviewSettings,
  footerUsesGlobalNav,
  getDefaultFooterV1NavLinks,
} from "@/lib/footer-v1-preview";
import type { NavBarLink } from "@/lib/nav-bar-preview";

function isForgePath(pathname: string | null): boolean {
  return pathname?.startsWith("/forge") === true || pathname?.startsWith("/playground") === true;
}

/** Footer nav links — global Nav-v1 when enabled, otherwise per-footer items. */
export function useFooterV1NavLinks(): NavBarLink[] {
  const footer = useFooterV1Preview();
  const navPreview = useNavBarPreview();
  const playgroundLinks = usePlaygroundNavLinks();
  const pathname = usePathname();
  const settings = footer?.settings ?? defaultFooterV1PreviewSettings;

  if (footerUsesGlobalNav(settings)) {
    if (navPreview) return navPreview.settings.items;
    if (isForgePath(pathname)) return playgroundLinks;
    return getDefaultFooterV1NavLinks();
  }

  return settings.navItems?.length ? settings.navItems : getDefaultFooterV1NavLinks();
}
