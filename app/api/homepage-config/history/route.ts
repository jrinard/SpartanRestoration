import { readHomepageConfigHistoryManifest } from "@/lib/homepage-config-history.server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Homepage history is only available in development.", { status: 403 });
  }

  const manifest = await readHomepageConfigHistoryManifest();
  return Response.json(manifest);
}
