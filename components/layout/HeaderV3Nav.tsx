"use client";

import Link from "next/link";
import { useHeaderV3Preview } from "@/components/dev/HeaderV3PreviewContext";
import { useContactModal } from "@/components/contact/ContactModalContext";
import type { NavItem } from "@/components/layout/Nav";
import { isContactHref } from "@/lib/contact-modal";
import { scrollToHashHref } from "@/lib/scroll-to-hash";
import { cn } from "@/lib/utils";

type HeaderV3NavProps = {
  items: readonly NavItem[];
  ariaLabel?: string;
  orientation?: "horizontal" | "vertical";
  onNavigate?: () => void;
  className?: string;
};

export function HeaderV3Nav({
  items,
  ariaLabel = "Primary navigation",
  orientation = "horizontal",
  onNavigate,
  className,
}: HeaderV3NavProps) {
  const preview = useHeaderV3Preview();
  const modal = useContactModal();
  const isCustom = Boolean(preview);
  const isVertical = orientation === "vertical";

  if (items.length === 0) return null;

  return (
    <nav
      className={cn(
        "header-v3-nav",
        isVertical
          ? "flex w-full flex-col items-stretch gap-3"
          : "flex w-full flex-wrap items-center justify-end gap-1.5 lg:gap-2",
        className,
      )}
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={(event) => {
            if (scrollToHashHref(item.href)) {
              event.preventDefault();
            } else if (modal && isContactHref(item.href)) {
              event.preventDefault();
              modal.openContact();
            }
            onNavigate?.();
          }}
          className={cn(
            "font-medium uppercase tracking-wide",
            isVertical && "w-full rounded-sm px-4 py-4 text-left text-lg",
            isCustom
              ? "header-v3-nav-link radial-hover-shine"
              : cn(
                  "text-sm text-muted transition-colors hover:text-foreground lg:text-base",
                  isVertical && "text-lg hover:bg-hover-overlay",
                ),
          )}
        >
          {isCustom ? (
            <span className="relative z-[1]">{item.label}</span>
          ) : (
            item.label
          )}
        </Link>
      ))}
    </nav>
  );
}
