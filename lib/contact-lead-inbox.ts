import { isValidLeadToEmail } from "@/lib/contact-preview";

const LEAD_INBOX_SPLIT = /[,;\n]+/;

/** Parse one or more inbox addresses from org fields or comma/semicolon-separated text. */
export function parseLeadInboxEmails(
  ...parts: (string | undefined | null)[]
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of parts) {
    if (!part?.trim()) continue;
    for (const segment of part.split(LEAD_INBOX_SPLIT)) {
      const email = segment.trim();
      if (!email || !isValidLeadToEmail(email)) continue;
      const key = email.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(email);
    }
  }

  return result;
}

export function formatLeadInboxList(emails: readonly string[]): string {
  return emails.join(", ");
}
