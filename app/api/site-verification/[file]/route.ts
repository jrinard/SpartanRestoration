import { readFile } from "node:fs/promises";
import path from "node:path";
import { orgAssetsDir } from "@/lib/org/paths";
import { readCurrentOrgId } from "@/lib/org/read-org.server";
import { readHomepageConfig } from "@/lib/homepage-config.server";
import { normalizeGoogleSiteVerificationFile } from "@/lib/google-site-verification";

type RouteContext = {
  params: Promise<{ file: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const requested = normalizeGoogleSiteVerificationFile((await context.params).file);
  if (!requested) {
    return new Response("Not found.", { status: 404 });
  }

  const orgId = await readCurrentOrgId();
  const config = await readHomepageConfig();
  const stored = normalizeGoogleSiteVerificationFile(
    config.previewSettings?.analytics?.siteVerificationFile,
  );
  if (!stored || stored !== requested) {
    return new Response("Not found.", { status: 404 });
  }

  try {
    const data = await readFile(path.join(orgAssetsDir(orgId), stored), "utf8");
    return new Response(data, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return new Response("Not found.", { status: 404 });
  }
}
