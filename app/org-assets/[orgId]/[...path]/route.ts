import { readFile, stat } from "node:fs/promises";
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

const assetCacheControl =
  "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800";

type RouteContext = {
  params: Promise<{ orgId: string; path: string[] }>;
};

function contentTypeFor(filePath: string): string {
  return contentTypes[path.extname(filePath).toLowerCase()] ?? "application/octet-stream";
}

function etagFor(size: number, mtimeMs: number): string {
  return `"${size.toString(16)}-${Math.floor(mtimeMs).toString(16)}"`;
}

export async function GET(request: Request, context: RouteContext) {
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
    const fileStat = await stat(filePath);
    const etag = etagFor(fileStat.size, fileStat.mtimeMs);
    const lastModified = fileStat.mtime.toUTCString();
    const cacheHeaders = {
      ETag: etag,
      "Last-Modified": lastModified,
      "Cache-Control": assetCacheControl,
    };

    if (request.headers.get("if-none-match") === etag) {
      return new Response(null, { status: 304, headers: cacheHeaders });
    }

    const data = await readFile(filePath);
    return new Response(data, {
      headers: {
        "Content-Type": contentTypeFor(filePath),
        ...cacheHeaders,
      },
    });
  } catch {
    return new Response("Not found.", { status: 404 });
  }
}
