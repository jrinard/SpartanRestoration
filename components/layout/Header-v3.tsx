import Link from "next/link";
import { siteConfig } from "@/config/site";
import { HeaderBrand } from "@/components/ui/HeaderBrand";
import { Container } from "@/components/ui/Container";
import { Nav } from "@/components/layout/Nav";
import { cn } from "@/lib/utils";

type HeaderV3Props = {
  className?: string;
};

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

const utilitySocial = [
  { label: "Facebook", href: siteConfig.social.facebook, icon: <FacebookIcon /> },
  { label: "Instagram", href: siteConfig.social.instagram, icon: <InstagramIcon /> },
];

/** Main nav minus Contact — shown in the utility row instead. */
const primaryNav = siteConfig.nav.filter((item) => item.href !== "/contact");

/** Logo left, utility + social top-right, primary nav on a darker strip below. */
export function HeaderV3({ className }: HeaderV3Props) {
  return (
    <header className={cn("border-b border-border bg-background/80 backdrop-blur-sm", className)}>
      <Container as="div" className="py-4 lg:py-5">
        <div className="flex items-center gap-6 lg:gap-10">
          <Link href="/" className="shrink-0 self-center">
            <HeaderBrand priority className="h-14 lg:h-16" width={240} height={82} />
          </Link>

          <div className="hidden min-w-0 flex-1 flex-col md:flex">
            <div className="header-v3-utility-bar flex flex-wrap items-center justify-end gap-x-5 gap-y-2 border-b border-border pb-2.5 text-sm">
              {siteConfig.phone && (
                <a
                  href={`tel:${siteConfig.phone.replace(/\D/g, "")}`}
                  className="font-medium text-foreground transition-colors hover:text-accent-blue"
                >
                  {siteConfig.phone}
                </a>
              )}
              {utilitySocial.length > 0 && (
                <div className="flex items-center gap-3 border-l border-border pl-5">
                  {utilitySocial.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="text-muted transition-colors hover:text-foreground"
                    >
                      {link.icon}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="header-v3-nav-bar mt-2.5 rounded-sm px-4 py-2.5 lg:px-5">
              <Nav
                items={primaryNav}
                className="header-v3-nav justify-end gap-5 lg:gap-6"
                linkClassName="text-xs font-medium uppercase tracking-wide"
                ariaLabel="Primary navigation"
              />
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}
