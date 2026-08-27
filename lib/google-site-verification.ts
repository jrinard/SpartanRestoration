export const googleSiteVerificationFilePattern = /^google[a-z0-9]+\.html$/i;

export function normalizeGoogleSiteVerificationFile(value: unknown): string {
  if (typeof value !== "string") return "";
  const filename = value.trim().split(/[/\\]/).pop() ?? "";
  return googleSiteVerificationFilePattern.test(filename) ? filename : "";
}

export function isGoogleSiteVerificationFile(value: unknown): value is string {
  return normalizeGoogleSiteVerificationFile(value).length > 0;
}
