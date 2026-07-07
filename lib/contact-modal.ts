/** Route used as fallback when JavaScript is unavailable. */
export const CONTACT_PAGE_HREF = "/contact";

export function isContactHref(href: string): boolean {
  if (!href) return false;
  if (href === CONTACT_PAGE_HREF) return true;

  if (href.startsWith("/")) return false;

  try {
    const url = new URL(href);
    return url.pathname === CONTACT_PAGE_HREF;
  } catch {
    return href.endsWith(CONTACT_PAGE_HREF);
  }
}
