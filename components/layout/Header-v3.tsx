"use client";

import { useState } from "react";
import { useHeaderV3Preview } from "@/components/dev/HeaderV3PreviewContext";
import { siteConfig } from "@/config/site";
import { HeaderBrand } from "@/components/ui/HeaderBrand";
import { HeaderBrandLink } from "@/components/ui/HeaderBrandLink";
import { HeaderV3Nav } from "@/components/layout/HeaderV3Nav";
import { HeaderV3NavBar } from "@/components/layout/HeaderV3NavBar";
import {
  defaultHeaderV3PreviewSettings,
  getHeaderV3InnerClassName,
} from "@/lib/header-v3-gradient";
import { cn } from "@/lib/utils";

type HeaderV3Props = {
  className?: string;
};

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path
          fill="currentColor"
          d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4l-6.29 6.31-1.42-1.42L9.17 12 2.88 5.71 4.3 4.29l6.29 6.3 6.29-6.3z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"
      />
    </svg>
  );
}

const utilitySocial = [
  { label: "Facebook", href: siteConfig.social.facebook, icon: <FacebookIcon /> },
];

const headerV3Nav = siteConfig.primaryNav;

function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function HeaderV3UtilityContent({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-x-5 gap-y-2", className)}>
      {(siteConfig.serviceArea || siteConfig.phone) && (
        <div className="flex flex-wrap items-center justify-end gap-x-2 gap-y-1 text-base lg:text-lg">
          {siteConfig.serviceArea && (
            <span className="header-v3-service-area mr-3 lg:mr-4">{siteConfig.serviceArea}</span>
          )}
          {siteConfig.phone && (
            <a
              href={`tel:${siteConfig.phone.replace(/\D/g, "")}`}
              className="header-v3-phone-link font-bold transition-colors"
            >
              {formatPhoneDisplay(siteConfig.phone)}
            </a>
          )}
        </div>
      )}
      {utilitySocial.length > 0 && (
        <div className="flex items-center gap-3.5 border-l border-border pl-5">
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
  );
}

function HeaderV3MobilePhone() {
  if (!siteConfig.phone) return null;

  return (
    <a
      href={`tel:${siteConfig.phone.replace(/\D/g, "")}`}
      className="header-v3-phone-link text-center text-base font-bold transition-colors md:hidden"
    >
      {formatPhoneDisplay(siteConfig.phone)}
    </a>
  );
}

/** Logo left, utility + social top-right, primary nav on a darker strip below. */
export function HeaderV3({ className }: HeaderV3Props) {
  const preview = useHeaderV3Preview();
  const [mobileOpen, setMobileOpen] = useState(false);
  const layoutWidth =
    preview?.settings.layoutWidth ?? defaultHeaderV3PreviewSettings.layoutWidth;

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <header className={cn("border-b border-border bg-background/80 backdrop-blur-sm", className)}>
      <div className={getHeaderV3InnerClassName(layoutWidth)}>
        <div className="md:hidden">
          <div className="flex flex-col items-center">
            <HeaderBrandLink className="my-2.5 shrink-0">
              <HeaderBrand priority className="h-[4.25rem]" width={240} height={82} />
            </HeaderBrandLink>
          </div>

          <div className="relative mt-2 flex items-center justify-center">
            <HeaderV3MobilePhone />
            <button
              type="button"
              className="header-v3-menu-toggle absolute right-0 top-1/2 inline-flex shrink-0 -translate-y-1/2 items-center justify-center rounded-sm border border-border p-2.5 text-foreground transition-colors hover:bg-hover-overlay"
              aria-expanded={mobileOpen}
              aria-controls="header-v3-mobile-menu"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </div>

        <div className="hidden items-center gap-4 md:flex lg:gap-10">
          <HeaderBrandLink className="my-2.5 shrink-0 self-center">
            <HeaderBrand priority className="h-[4.25rem] lg:h-20" width={240} height={82} />
          </HeaderBrandLink>

          <div className="min-w-0 flex-1 flex-col">
            <div className="header-v3-utility-bar mt-2 flex flex-wrap items-center justify-end gap-x-5 gap-y-2 border-b border-border pb-3">
              <HeaderV3UtilityContent />
            </div>

            <HeaderV3NavBar className="mt-2.5 flex justify-end rounded-sm px-4 py-3 lg:px-5 lg:py-3.5">
              <HeaderV3Nav items={headerV3Nav} ariaLabel="Primary navigation" />
            </HeaderV3NavBar>
          </div>
        </div>

        <div
          id="header-v3-mobile-menu"
          className={cn(
            "header-v3-mobile-menu border-t border-border md:hidden",
            mobileOpen ? "block" : "hidden",
          )}
        >
          <HeaderV3NavBar className="mt-2 rounded-sm px-2 py-4">
            <HeaderV3Nav
              items={headerV3Nav}
              ariaLabel="Mobile primary navigation"
              orientation="vertical"
              onNavigate={closeMobileMenu}
            />
          </HeaderV3NavBar>
        </div>
      </div>
    </header>
  );
}
