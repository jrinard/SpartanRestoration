"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useOptionalPlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import { requestScrollToHash, resolveScrollHash } from "@/lib/scroll-to-hash";
import { isForgePathname } from "@/lib/forge";

/** Scrolls to a pending or URL hash after navigation / playground page changes. */
export function HashScrollOnNavigate() {
  const pathname = usePathname();
  const playground = useOptionalPlaygroundSections();
  const isPlayground = isForgePathname(pathname);

  useEffect(() => {
    const hash = resolveScrollHash();
    if (!hash || hash.length < 2) return;

    if (isPlayground && !playground?.ready) return;

    return requestScrollToHash(hash, { maxAttempts: 60, intervalMs: 100 });
  }, [
    pathname,
    isPlayground,
    playground?.ready,
    playground?.activePageId,
    playground?.visibleSections.length,
  ]);

  return null;
}
