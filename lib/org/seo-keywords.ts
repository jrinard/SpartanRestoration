/** Comma-separated textarea ↔ `seo.json` keywords array. */
export function formatSeoKeywordsForInput(keywords?: string[]): string {
  if (!keywords?.length) return "";
  return keywords.join(", ");
}

export function parseSeoKeywordsInput(raw: string): string[] | undefined {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const part of raw.split(",")) {
    const phrase = part.trim();
    if (!phrase) continue;
    const key = phrase.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(phrase);
  }

  return unique.length > 0 ? unique : undefined;
}

/** Keep existing keywords when the textarea is empty (unchanged), not a deliberate wipe. */
export function resolveSeoKeywordsForSave(
  keywordsText: string,
  existing?: string[],
): string[] | undefined {
  const parsed = parseSeoKeywordsInput(keywordsText);
  if (parsed) return parsed;
  if (existing?.length) return existing;
  return undefined;
}
