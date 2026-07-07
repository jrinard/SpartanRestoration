import {
  deleteHomepageConfigHistoryEntry,
  readHomepageConfigHistorySnapshot,
} from "@/lib/homepage-config-history.server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Homepage history is only available in development.", { status: 403 });
  }

  const { id } = await context.params;
  const snapshot = await readHomepageConfigHistorySnapshot(id);

  if (!snapshot) {
    return new Response("History entry not found.", { status: 404 });
  }

  return Response.json(snapshot);
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (process.env.NODE_ENV !== "development") {
    return new Response("Homepage history is only available in development.", { status: 403 });
  }

  const { id } = await context.params;
  const deleted = await deleteHomepageConfigHistoryEntry(id);

  if (!deleted) {
    return new Response("History entry not found.", { status: 404 });
  }

  return Response.json({ ok: true });
}
