"use client";

import type { NavBarLink } from "@/lib/nav-bar-preview";

/** Vision pack stub — Forge editor removed in Phase 5. */
export function NavBarLinkEditor(_props: {
  link: NavBarLink;
  linkIndex: number;
  onSave: (link: NavBarLink) => void;
  onDelete: () => void;
  onClose: () => void;
  allowCurrentPage?: boolean;
}): null {
  return null;
}
