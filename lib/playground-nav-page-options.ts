import { CONTACT_PAGE_HREF } from "@/lib/contact-modal";
import { getPlaygroundPageHref, type PlaygroundPage } from "@/lib/playground-pages";

export type PlaygroundNavPageOption = {
  label: string;
  href: string;
};

/** Baked-in target for nav links that open the contact modal (no /contact page required). */
export const contactPopupPageOption: PlaygroundNavPageOption = {
  label: "Contact (popup)",
  href: CONTACT_PAGE_HREF,
};

export function isContactPopupPageHref(pageHref: string): boolean {
  return pageHref.trim() === CONTACT_PAGE_HREF;
}

export function getPlaygroundNavPageOptions(
  pages: readonly PlaygroundPage[] | undefined,
  ready: boolean,
): PlaygroundNavPageOption[] {
  const home: PlaygroundNavPageOption = { label: "Home", href: "/" };
  if (!ready || !pages?.length) {
    return [home, contactPopupPageOption];
  }

  const extras = pages
    .filter((page) => !page.isHome)
    .map((page) => ({
      label: page.name,
      href: getPlaygroundPageHref(page),
    }));

  return [home, ...extras, contactPopupPageOption];
}
