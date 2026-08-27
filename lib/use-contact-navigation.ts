"use client";

import { useContactModal } from "@/components/contact/ContactModalContext";
import { isContactHref } from "@/lib/contact-modal";
import type { MouseEvent } from "react";

/** Opens the contact modal when the href targets /contact. */
export function useContactNavigation() {
  const modal = useContactModal();

  return (href: string, event: MouseEvent) => {
    if (modal && isContactHref(href)) {
      event.preventDefault();
      modal.openContact();
    }
  };
}
