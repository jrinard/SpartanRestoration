"use client";

import { siteConfig } from "@/config/site";
import { ServiceAreaV2WithPreview } from "@/components/dev/ServiceAreaV2WithPreview";
import { clientOrgIdStorageKey, getClientOrgId } from "@/lib/org/browser-storage";
import { getServiceAreaV2CardsForOrg } from "@/lib/service-area-v2-cards";

function resolveServiceAreaOrgId(): string {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(clientOrgIdStorageKey);
      if (stored) return stored;
    } catch {
      // ignore
    }
  }
  if (siteConfig.assets.themeFolder === "spartan") return "spartan";
  return getClientOrgId();
}

/** ServiceArea-v2 with org-specific hub cards (LSD towns vs Spartan hybrid hub). */
export function ServiceAreaV2OrgSection() {
  const cards = getServiceAreaV2CardsForOrg(resolveServiceAreaOrgId());
  return <ServiceAreaV2WithPreview cards={cards} />;
}
