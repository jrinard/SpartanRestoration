"use client";

import Link from "next/link";
import { useHeaderV3Preview } from "@/components/dev/HeaderV3PreviewContext";
import { headerV1ServiceNav, type HeaderV1NavItem } from "@/lib/header-v1-nav";
import { scrollToHashHref } from "@/lib/scroll-to-hash";
import { cn } from "@/lib/utils";

type HeaderV1NavProps = {
  items?: readonly HeaderV1NavItem[];
  ariaLabel?: string;
  className?: string;
};

function NavIconPlaceholder({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "header-v1-nav-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dashed border-current/35",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 opacity-70" fill="currentColor">
        <path d="M12 2 4 7v10l8 5 8-5V7l-8-5zm0 2.18 6 3.75v7.14l-6 3.75-6-3.75V7.93l6-3.75z" />
      </svg>
    </span>
  );
}

/** Header v1 service navigation — icon above label button. */
export function HeaderV1Nav({
  items = headerV1ServiceNav,
  ariaLabel = "Service navigation",
  className,
}: HeaderV1NavProps) {
  const preview = useHeaderV3Preview();
  const isCustom = Boolean(preview);

  if (items.length === 0) return null;

  return (
    <nav
      className={cn(
        "header-v1-nav header-v3-nav grid grid-flow-col auto-cols-[10rem] grid-rows-[auto_auto] justify-end gap-x-2 gap-y-1.5 sm:auto-cols-[11rem] lg:gap-3",
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
            }
          }}
          className={cn(
            "header-v1-nav-item group contents text-center no-underline",
            !isCustom && "text-muted transition-colors hover:text-foreground",
          )}
        >
          <NavIconPlaceholder className="justify-self-center" />
          <span
            className={cn(
              "header-v1-nav-link inline-flex w-full items-start justify-center justify-self-stretch px-3 py-2 font-bold leading-tight tracking-wide",
              isCustom ? "header-v3-nav-link radial-hover-shine" : "text-sm",
            )}
          >
            <span
              className={cn(
                "header-v1-nav-label whitespace-pre-line",
                isCustom && "relative z-[1]",
              )}
            >
              {item.label}
            </span>
          </span>
        </Link>
      ))}
    </nav>
  );
}
