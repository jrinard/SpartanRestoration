import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { NextConfig } from "next";

function listOrgIds(): string[] {
  try {
    const fromOrgs = readdirSync(path.join(process.cwd(), "orgs"), { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isDirectory() && /^[a-z0-9][a-z0-9-]{0,62}$/.test(entry.name),
      )
      .map((entry) => entry.name);
    if (fromOrgs.length > 0) return fromOrgs;
  } catch {
    // Packed Vision has no orgs/ folder.
  }

  try {
    const site = JSON.parse(
      readFileSync(path.join(process.cwd(), "site", "org.json"), "utf8"),
    ) as { id?: string };
    if (typeof site.id === "string") return [site.id];
  } catch {
    // Builder without a packed site/ is fine.
  }

  return [];
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // Vision deploys read org pillar from site/ at runtime — ensure it ships in server bundles.
  outputFileTracingIncludes: {
    "/*": ["./site/**/*"],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:file(google[a-z0-9]+.html)",
          destination: "/api/site-verification/:file",
        },
        ...listOrgIds().map((id) => ({
          source: `/${id}/:path*`,
          destination: `/org-assets/${id}/:path*`,
        })),
      ],
    };
  },
  async headers() {
    const devRobots = {
      key: "X-Robots-Tag",
      value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
    };

    return [
      {
        source: "/forge",
        headers: [devRobots],
      },
      {
        source: "/forge/:path*",
        headers: [devRobots],
      },
      {
        source: "/playground",
        headers: [devRobots],
      },
      {
        source: "/playground/:path*",
        headers: [devRobots],
      },
      {
        source: "/preview",
        headers: [devRobots],
      },
      {
        source: "/preview/:path*",
        headers: [devRobots],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
