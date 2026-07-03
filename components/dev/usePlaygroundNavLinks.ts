"use client";

import { useEffect, useState } from "react";
import { useNavBarPreview } from "@/components/dev/NavBarPreviewContext";
import { siteConfig } from "@/config/site";
import type { NavBarLink } from "@/lib/nav-bar-preview";
import { playgroundNavSyncEvent } from "@/lib/playground-nav-sync";
import { loadNavBarPreviewSettings } from "@/lib/nav-bar-preview-storage";

function readNavLinksFromStorage(): NavBarLink[] {
  try {
    return loadNavBarPreviewSettings().items;
  } catch {
    return siteConfig.footerNav.map((item) => ({ ...item }));
  }
}

const defaultNavLinks = (): NavBarLink[] =>
  siteConfig.footerNav.map((item) => ({ ...item }));

/** Nav links synced from playground pages (nav bar preview storage). */
export function usePlaygroundNavLinks(): NavBarLink[] {
  const navPreview = useNavBarPreview();
  const [links, setLinks] = useState<NavBarLink[]>(defaultNavLinks);

  useEffect(() => {
    if (navPreview) {
      setLinks(navPreview.settings.items);
      return;
    }

    const load = () => setLinks(readNavLinksFromStorage());

    load();
    window.addEventListener(playgroundNavSyncEvent, load);
    return () => window.removeEventListener(playgroundNavSyncEvent, load);
  }, [navPreview, navPreview?.settings.items]);

  return navPreview?.settings.items ?? links;
}
