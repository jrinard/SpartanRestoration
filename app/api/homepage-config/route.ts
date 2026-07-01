import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeHomepageConfig } from "@/lib/homepage-config";
import { readHomepageConfig } from "@/lib/homepage-config.server";
import { readLaunchMode, writeLaunchMode } from "@/lib/launch-mode.server";

const configPath = () => path.join(process.cwd(), "lib", "homepage-config.json");

export async function GET() {
  const [config, launchMode] = await Promise.all([readHomepageConfig(), readLaunchMode()]);
  return Response.json({ launchMode, config });
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Homepage publish is only available in development.", { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid JSON body.", { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return new Response("Invalid JSON body.", { status: 400 });
  }

  const payload = body as { action?: string; config?: unknown };

  if (payload.action === "revert") {
    await writeLaunchMode("under-construction");
    return Response.json({ ok: true, launchMode: "under-construction" });
  }

  if (payload.action === "publish") {
    const normalized = normalizeHomepageConfig(payload.config);

    if (normalized.sections.length === 0) {
      return new Response("No sections are checked for Preview in the playground.", {
        status: 400,
      });
    }

    await writeFile(configPath(), `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
    await writeLaunchMode("live");

    return Response.json({ ok: true, launchMode: "live", config: normalized });
  }

  return new Response('Expected action "publish" or "revert".', { status: 400 });
}
