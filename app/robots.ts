import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const devDisallow = [
  "/forge",
  "/forge/",
  "/playground",
  "/playground/",
  "/preview",
  "/preview/",
];

export default function robots(): MetadataRoute.Robots {
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
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
