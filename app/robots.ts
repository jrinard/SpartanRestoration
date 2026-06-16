import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const devDisallow = [
  "/playground",
  "/playground/",
  "/preview",
  "/preview/",
  "/about",
  "/services",
  "/contact",
  "/blog",
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
