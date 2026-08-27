import { fallbackSiteConfig, type SiteConfigData, type TeamContact } from "@/config/site-data";
import { getRuntimeSite } from "@/lib/org/runtime-site";

export type { SiteConfigData, TeamContact };

export type SiteConfig = SiteConfigData;

export { fallbackSiteConfig };

/**
 * Live site identity. Playground Open org updates this via setRuntimeSite.
 * Server code that needs the current org on disk should use readOrg().
 */
export const siteConfig: SiteConfigData = new Proxy(fallbackSiteConfig, {
  get(target, prop, receiver) {
    const live = getRuntimeSite();
    if (typeof prop === "string" && prop in live) {
      return live[prop as keyof SiteConfigData];
    }
    return Reflect.get(target, prop, receiver);
  },
});
