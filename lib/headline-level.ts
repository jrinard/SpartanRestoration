export type HeadlineLevel = "h1" | "h2";

export function normalizeHeadlineLevel(
  value: unknown,
  fallback: HeadlineLevel = "h2",
): HeadlineLevel {
  return value === "h1" || value === "h2" ? value : fallback;
}

export const headlineLevelOptions: { value: HeadlineLevel; label: string }[] = [
  { value: "h2", label: "H2 (default)" },
  { value: "h1", label: "Page H1 (same size)" },
];
