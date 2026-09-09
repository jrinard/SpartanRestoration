import type { MetadataRoute } from "next";
import { readCurrentOrgId, readOrgSite } from "@/lib/org/read-org.server";
import { setRuntimeSite } from "@/lib/org/runtime-site";

const devDisallow = [
  "/forge",
  "/forge/",
  "/playground",
  "/playground/",
  "/preview",
  "/preview/",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const orgId = await readCurrentOrgId();
  const site = await readOrgSite(orgId);
  setRuntimeSite(site);

  const baseUrl = site.url.replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: devDisallow,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: devDisallow,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
