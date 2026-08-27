import { readFile } from "node:fs/promises";
import path from "node:path";
import { isSafeOrgId, orgAssetsDir } from "@/lib/org/paths";

const contentTypes: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".html": "text/html; charset=utf-8",
};

type RouteContext = {
  params: Promise<{ orgId: string; path: string[] }>;
};

function contentTypeFor(filePath: string): string {
  return contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

export async function GET(_request: Request, context: RouteContext) {
  const { orgId, path: segments } = await context.params;
  if (!isSafeOrgId(orgId) || !Array.isArray(segments) || segments.length === 0) {
    return new Response("Not found.", { status: 404 });
  }

  if (segments.some((segment) => segment === ".." || segment.includes("\0"))) {
    return new Response("Not found.", { status: 404 });
  }

  const assetsRoot = path.resolve(orgAssetsDir(orgId));
  const filePath = path.resolve(assetsRoot, ...segments);
  const relative = path.relative(assetsRoot, filePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return new Response("Not found.", { status: 404 });
  }

  try {
    const data = await readFile(filePath);
    return new Response(data, {
      headers: {
        "Content-Type": contentTypeFor(filePath),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Not found.", { status: 404 });
  }
}
