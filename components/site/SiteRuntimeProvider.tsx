"use client";

import type { ReactNode } from "react";
import type { SiteConfigData } from "@/config/site-data";
import type { OrgPoliciesFile } from "@/lib/org/policies";
import { setRuntimeSite } from "@/lib/org/runtime-site";
import { setRuntimePolicies } from "@/lib/org/runtime-policies";

/** Puts the current org site/policies on the client for live/Vision pages. */
export function SiteRuntimeProvider({
  site,
  policies,
  children,
}: {
  site: SiteConfigData;
  policies?: OrgPoliciesFile;
  children: ReactNode;
}) {
  setRuntimeSite(site);
  if (policies) setRuntimePolicies(policies);
  return children;
}
