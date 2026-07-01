"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from "react";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { CONTACT_PAGE_HREF, isContactHref } from "@/lib/contact-modal";

type ContactTriggerProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href?: string;
  children: ReactNode;
};

/** Opens the contact modal when href targets /contact; keeps the page link as fallback. */
export function ContactTrigger({
  href = CONTACT_PAGE_HREF,
  onClick,
  children,
  ...props
}: ContactTriggerProps) {
  const modal = useContactModal();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (modal && isContactHref(href)) {
      event.preventDefault();
      modal.openContact();
    }
  }

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
