"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ContactTrigger } from "@/components/contact/ContactTrigger";
import { useFooterV1Preview } from "@/components/dev/FooterV1PreviewContext";
import { siteConfig } from "@/config/site";
import {
  defaultFooterV1PreviewSettings,
  getFooterV1CssVariables,
  getFooterV1LayoutWidthClassName,
  getFooterV1MainBackground,
} from "@/lib/footer-v1-preview";
import {
  footerV1PhoneTelHref,
  footerV1ServiceAreaId,
  getFooterV1TeamContacts,
} from "@/lib/footer-v1-seo";
import { usePlaygroundNavLinks } from "@/components/dev/usePlaygroundNavLinks";
import {
  usePlaygroundNavLinkHref,
  usePlaygroundPageLink,
} from "@/components/dev/usePlaygroundPageLink";
import { scrollToHashHref } from "@/lib/scroll-to-hash";
import { cn } from "@/lib/utils";

type FooterV1Props = {
  description?: string;
};

/** Classic footer — white main area, horizontal nav, full-width credit bar. */
export function FooterV1({ description }: FooterV1Props) {
  const year = new Date().getFullYear();
  const blurb = description ?? siteConfig.tagline;
  const preview = useFooterV1Preview();
  const settings = preview?.settings ?? defaultFooterV1PreviewSettings;
  const teamContacts = getFooterV1TeamContacts();
  const navLinks = usePlaygroundNavLinks();
  const handlePageLink = usePlaygroundPageLink();
  const resolveNavHref = usePlaygroundNavLinkHref();
  const isContained = settings.layoutWidth === "contained";
  const mainBackground = getFooterV1MainBackground(settings);

  const contentPaddingPx = settings.contentInsetPx;
  const footerStyle = getFooterV1CssVariables(settings) as CSSProperties;
  const mainOuterStyle: CSSProperties = isContained
    ? { backgroundColor: settings.outerBackgroundColor }
    : { background: mainBackground };
  const mainInnerStyle: CSSProperties = isContained
    ? {
        background: mainBackground,
        marginInline: contentPaddingPx,
      }
    : {
        paddingInline: contentPaddingPx,
      };

  return (
    <footer
      className="footer-v1"
      style={footerStyle}
      role="contentinfo"
      aria-label={`${siteConfig.name} site footer`}
    >
      <div className="footer-v1-main text-foreground" style={mainOuterStyle}>
        <div className={cn(getFooterV1LayoutWidthClassName(settings.layoutWidth))}>
          <div className="footer-v1-content py-14 lg:py-16" style={mainInnerStyle}>
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12">
            <div className="footer-v1-brand">
              <Link
                href={resolveNavHref("/")}
                onClick={(event) => handlePageLink("/", event)}
                className="inline-flex flex-col items-start gap-3 no-underline"
                aria-label={`${siteConfig.name} — Home`}
              >
                <Image
                  src={siteConfig.assets.logo}
                  alt={`${siteConfig.name} logo`}
                  width={1137}
                  height={352}
                  className="footer-v1-logo h-14 w-auto max-w-[220px] object-contain object-left sm:h-16"
                />
                <span className="footer-v1-brand-name font-serif text-xl font-semibold tracking-wide">
                  {siteConfig.name}
                </span>
              </Link>
              {blurb && (
                <p className="footer-v1-tagline mt-4 max-w-sm text-sm leading-relaxed">{blurb}</p>
              )}
            </div>

            <div className="footer-v1-nav-column flex flex-col items-center justify-center gap-4 lg:px-4">
              <ContactTrigger className="footer-v1-contact-btn inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold tracking-wide uppercase transition-colors">
                Contact Us
              </ContactTrigger>
              <nav className="footer-v1-nav w-full" aria-label="Footer navigation">
                <h2 className="sr-only">Site navigation</h2>
                <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                  {navLinks.map((item, index) => (
                    <li key={`${item.href}-${index}`}>
                      <Link
                        href={resolveNavHref(item.href)}
                        onClick={(event) => {
                          if (scrollToHashHref(item.href)) {
                            event.preventDefault();
                            return;
                          }
                          handlePageLink(item.href, event);
                        }}
                        className="footer-v1-nav-link text-sm font-semibold tracking-wide uppercase transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              {siteConfig.serviceArea && (
                <p
                  id={footerV1ServiceAreaId}
                  className="footer-v1-service-area max-w-md text-center text-sm leading-relaxed"
                >
                  {siteConfig.serviceArea}
                </p>
              )}
            </div>

            <section className="footer-v1-contact lg:text-right" aria-labelledby="footer-v1-contact-heading">
              <div className="footer-v1-contact-details">
                <h2
                  id="footer-v1-contact-heading"
                  className="footer-v1-contact-heading font-semibold tracking-wide uppercase"
                >
                  Contact
                </h2>
                <address className="footer-v1-address mt-4 not-italic">
                  <div className="footer-v1-contact-list flex flex-col gap-4 lg:items-end">
                    {teamContacts.map((contact) => (
                      <div key={contact.name} className="footer-v1-team-contact">
                        <p className="footer-v1-team-name font-semibold">{contact.name}</p>
                        {contact.phone && (
                          <a
                            href={footerV1PhoneTelHref(contact.phone)}
                            className="footer-v1-contact-link mt-1 inline-block transition-colors"
                          >
                            {contact.phone}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </address>
              </div>
            </section>
          </div>
          </div>
        </div>
      </div>

      <div className="footer-v1-bottom-bar">
        <div className="footer-v1-bottom-bar-inner">
          <p className="footer-v1-copyright">
            &copy; {year} {siteConfig.name}. All rights reserved.
          </p>
          <span className="footer-v1-bottom-divider" aria-hidden="true">
            ·
          </span>
          <a
            href={siteConfig.designerCredit.href}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-v1-designer-link"
            aria-label={`Website design by ${siteConfig.designerCredit.label}`}
          >
            {siteConfig.designerCredit.label}
          </a>
        </div>
      </div>
    </footer>
  );
}
