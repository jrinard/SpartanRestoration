import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export type NavItem = (typeof siteConfig.nav)[number];

type NavProps = {
  items?: readonly NavItem[];
  className?: string;
  linkClassName?: string;
  ariaLabel?: string;
};

/**
 * Reusable site navigation — compose into any header layout.
 */
export function Nav({
  items = siteConfig.nav,
  className,
  linkClassName,
  ariaLabel = "Main navigation",
}: NavProps) {
  if (items.length === 0) return null;

  return (
    <nav className={cn("flex flex-wrap items-center gap-6", className)} aria-label={ariaLabel}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm text-muted transition-colors hover:text-foreground",
            linkClassName,
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function splitNavItems(items: readonly NavItem[] = siteConfig.nav) {
  const midpoint = Math.ceil(items.length / 2);
  return {
    left: items.slice(0, midpoint),
    right: items.slice(midpoint),
    top: items.slice(0, midpoint),
    bottom: items.slice(midpoint),
  };
}
