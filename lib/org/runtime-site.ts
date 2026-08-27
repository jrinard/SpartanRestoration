import type { SiteConfigData } from "@/config/site-data";
import { fallbackSiteConfig } from "@/config/site-data";

let runtimeOverride: SiteConfigData | null = null;

export function setRuntimeSite(site: SiteConfigData | null): void {
  runtimeOverride = site;
}

export function getRuntimeSite(): SiteConfigData {
  return runtimeOverride ?? fallbackSiteConfig;
}

export function getRuntimeSiteOverride(): SiteConfigData | null {
  return runtimeOverride;
}
