"use client";

import { useFooterV1Preview } from "@/components/dev/FooterV1PreviewContext";
import { usePlaygroundNavLinks } from "@/components/dev/usePlaygroundNavLinks";
import {
  defaultFooterV1PreviewSettings,
  footerUsesGlobalNav,
  getDefaultFooterV1NavLinks,
} from "@/lib/footer-v1-preview";
import type { NavBarLink } from "@/lib/nav-bar-preview";

/** Footer nav links — global Nav-v1 when enabled, otherwise per-footer items. */
export function useFooterV1NavLinks(): NavBarLink[] {
  const footer = useFooterV1Preview();
  const globalLinks = usePlaygroundNavLinks();
  const settings = footer?.settings ?? defaultFooterV1PreviewSettings;

  if (footerUsesGlobalNav(settings)) {
    return globalLinks;
  }

  return settings.navItems?.length ? settings.navItems : getDefaultFooterV1NavLinks();
}
