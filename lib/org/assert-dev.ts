export function developmentForbiddenResponse(feature: string): Response | null {
  if (process.env.NODE_ENV === "development") return null;
  return new Response(`${feature} is only available in development.`, { status: 403 });
}
