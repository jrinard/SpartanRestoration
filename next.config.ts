import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    const devRobots = {
      key: "X-Robots-Tag",
      value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
    };

    return [
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
