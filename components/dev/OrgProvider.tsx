"use client";

import type { ReactNode } from "react";
import type { OrgContactFile, OrgListItem, OrgMeta, OrgPillar, OrgSeoFile, SiteConfigData } from "@/lib/org/types";
import type { OrgPoliciesFile } from "@/lib/org/policies";
import type { AnalyticsPreviewSettings } from "@/lib/analytics-preview";
import type { FaviconPreviewSettings } from "@/lib/favicon-preview";

type OrgSettingsPatch = {
  org?: OrgMeta;
  site?: SiteConfigData;
  seo?: OrgSeoFile;
  favicon?: FaviconPreviewSettings;
  analytics?: AnalyticsPreviewSettings;
  contact?: OrgContactFile;
  policies?: OrgPoliciesFile;
};

type OrgContextValue = {
  orgId: string;
  pillar: OrgPillar;
  orgs: OrgListItem[];
  ready: boolean;
  openOrg: (orgId: string) => Promise<void>;
  createOrg: (id: string, name: string, number?: number) => Promise<void>;
  saveSettings: (patch: OrgSettingsPatch) => Promise<void>;
  deleteOrg: (confirmName: string) => Promise<void>;
};

/** Vision pack stub — multi-org Forge UI is not available at runtime. */
export function OrgProvider({ children }: { children?: ReactNode }) {
  return children ?? null;
}

export function useOrg(): never {
  throw new Error("Forge-only");
}

export function useOptionalOrg(): OrgContextValue | null {
  return null;
}
