"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Images, Pencil } from "lucide-react";
import { ContactTrigger } from "@/components/contact/ContactTrigger";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import { useFooterV1Preview } from "@/components/dev/FooterV1PreviewContext";
import { useFooterV1NavLinks } from "@/components/dev/useFooterV1NavLinks";
import {
  usePlaygroundNavLinkHref,
  usePlaygroundPageLink,
} from "@/components/dev/usePlaygroundPageLink";
import { useHashNavigationClick } from "@/components/dev/useHashNavigation";
import { siteConfig } from "@/config/site";
import {
  buildDefaultFooterV1Copyright,
  defaultFooterV1PreviewSettings,
  getFooterV1CssVariables,
  getFooterV1LayoutWidthClassName,
  getFooterV1MainBackgroundStyle,
  resolveFooterV1LogoSrc,
  type FooterV1Content,
} from "@/lib/footer-v1-preview";
import {
  footerV1PhoneTelHref,
  footerV1ServiceAreaId,
  getFooterV1TeamContacts,
} from "@/lib/footer-v1-seo";
import { isContactHref } from "@/lib/contact-modal";
import {
  isExternalNavHref,
  resolveNavBarLinkTarget,
  getNavBarLinkVisibilityClassName,
} from "@/lib/nav-bar-preview";
import {
  devEditButtonClassName,
  devEditIconSize,
  devLibraryIconSize,
  devLibraryLabelClassName,
  devLibraryPillClassName,
} from "@/lib/dev-overlay-controls";
import { usePlaygroundImageLibraryFolder } from "@/lib/use-playground-image-library-folder";
import { cn } from "@/lib/utils";

type FooterV1Props = {
  description?: string;
};

function EditableTextBlock({
  editingEnabled,
  ariaLabel,
  editorTitle,
  value,
  multiline,
  rows,
  className,
  editButtonClassName,
  onSave,
  children,
}: {
  editingEnabled: boolean;
  ariaLabel: string;
  editorTitle: string;
  value: string;
  multiline?: boolean;
  rows?: number;
  className?: string;
  editButtonClassName?: string;
  onSave?: (value: string) => void;
  children: ReactNode;
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div className={cn("relative max-w-full pr-8", className)}>
      {children}
      {editingEnabled && onSave && (
        <>
          <button
            type="button"
            onClick={() => setEditorOpen((open) => !open)}
            className={cn(devEditButtonClassName, editButtonClassName)}
            aria-label={ariaLabel}
            aria-expanded={editorOpen}
          >
            <Pencil size={devEditIconSize} strokeWidth={2} />
          </button>
          {editorOpen && (
            <div className="absolute top-full right-0 z-30 mt-2">
              <TextImageTextEditor
                value={value}
                multiline={multiline}
                rows={rows}
                dialogTitle={editorTitle}
                dialogAriaLabel={editorTitle}
                inputAriaLabel={ariaLabel}
                onChange={onSave}
                onClose={() => setEditorOpen(false)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Classic footer — white main area, horizontal nav, full-width credit bar. */
export function FooterV1({ description }: FooterV1Props) {
  const year = new Date().getFullYear();
  const preview = useFooterV1Preview();
  const settings = preview?.settings ?? defaultFooterV1PreviewSettings;
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const [logoLibraryOpen, setLogoLibraryOpen] = useState(false);

  const defaultContent = useMemo<FooterV1Content>(
    () => ({
      brandName: siteConfig.name,
      tagline: description ?? siteConfig.tagline,
      serviceArea: siteConfig.serviceArea ?? "",
      contacts: getFooterV1TeamContacts(),
      copyright: buildDefaultFooterV1Copyright(siteConfig.name, year),
    }),
    [description, year],
  );

  const content = preview?.getContent(defaultContent) ?? defaultContent;
  const { folder: libraryFolder } = usePlaygroundImageLibraryFolder();
  const logoSrc = resolveFooterV1LogoSrc(settings, libraryFolder);
  const navLinks = useFooterV1NavLinks();
  const handlePageLink = usePlaygroundPageLink();
  const handleHashNavigation = useHashNavigationClick();
  const resolveNavHref = usePlaygroundNavLinkHref();
  const contactModal = useContactModal();
  const isContained = settings.layoutWidth === "contained";
  const mainBackgroundStyle = getFooterV1MainBackgroundStyle(settings);

  const contentPaddingPx = settings.contentInsetPx;
  const footerStyle = getFooterV1CssVariables(settings) as CSSProperties;
  const mainOuterStyle: CSSProperties = isContained
    ? { backgroundColor: settings.outerBackgroundColor }
    : mainBackgroundStyle;
  const mainInnerStyle: CSSProperties = isContained
    ? {
        ...mainBackgroundStyle,
        marginInline: contentPaddingPx,
      }
    : {
        paddingInline: contentPaddingPx,
      };

  const canEditContent = editingEnabled && Boolean(preview);

  return (
    <footer
      className="footer-v1"
      style={footerStyle}
      role="contentinfo"
      aria-label={`${content.brandName} site footer`}
    >
      <div className="footer-v1-main text-foreground" style={mainOuterStyle}>
        <div className={cn(getFooterV1LayoutWidthClassName(settings.layoutWidth))}>
          <div className="footer-v1-content py-14 lg:py-16" style={mainInnerStyle}>
            <div className="footer-v1-columns">
              <div className="footer-v1-brand">
                <div className="footer-v1-logo-wrap relative inline-flex max-w-full">
                  <Link
                    href={resolveNavHref("/")}
                    onClick={(event) => handlePageLink("/", event)}
                    className="inline-flex no-underline"
                    aria-label={`${content.brandName} — Home`}
                  >
                    <Image
                      src={logoSrc}
                      alt={`${content.brandName} logo`}
                      width={1137}
                      height={352}
                      className="footer-v1-logo block w-auto object-contain object-center lg:object-left"
                    />
                  </Link>
                  {canEditContent && preview && (
                    <>
                      <button
                        type="button"
                        onClick={() => setLogoLibraryOpen((open) => !open)}
                        className={devLibraryPillClassName}
                        aria-label="Choose footer logo from library"
                        aria-expanded={logoLibraryOpen}
                      >
                        <Images size={devLibraryIconSize} strokeWidth={2} />
                        <span className={devLibraryLabelClassName}>Library</span>
                      </button>
                      {logoLibraryOpen && (
                        <div className="absolute top-full left-0 z-40 mt-2">
                          <ImageLibraryPicker
                            value={logoSrc}
                            onSelect={(entry) => preview.setContentLogo(entry.src)}
                            onClose={() => setLogoLibraryOpen(false)}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
                <EditableTextBlock
                  editingEnabled={canEditContent}
                  ariaLabel="Edit business name"
                  editorTitle="Edit business name"
                  value={content.brandName}
                  className="footer-v1-brand-name-wrap mt-3 w-full max-w-sm"
                  onSave={canEditContent ? preview!.setContentBrandName : undefined}
                >
                  {(content.brandName || canEditContent) && (
                    <span className="footer-v1-brand-name block text-left font-serif text-xl font-semibold tracking-wide">
                      {content.brandName}
                    </span>
                  )}
                </EditableTextBlock>
                <EditableTextBlock
                  editingEnabled={canEditContent}
                  ariaLabel="Edit tagline"
                  editorTitle="Edit tagline"
                  value={content.tagline}
                  multiline
                  rows={4}
                  className="footer-v1-tagline-wrap mt-4 w-full max-w-sm"
                  onSave={canEditContent ? preview!.setContentTagline : undefined}
                >
                  {(content.tagline || canEditContent) && (
                    <p className="footer-v1-tagline text-left text-sm leading-relaxed">{content.tagline}</p>
                  )}
                </EditableTextBlock>
                {siteConfig.footerTaglineLink?.label?.trim() &&
                  siteConfig.footerTaglineLink?.href?.trim() && (
                    <a
                      href={siteConfig.footerTaglineLink.href.trim()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-v1-tagline-link mt-3 inline-block text-sm font-semibold tracking-wide uppercase transition-colors"
                    >
                      {siteConfig.footerTaglineLink.label.trim()}
                    </a>
                  )}
              </div>

              <div className="footer-v1-nav-column flex flex-col items-center justify-center gap-4">
                <ContactTrigger className="footer-v1-contact-btn inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold tracking-wide uppercase transition-colors">
                  Contact Us
                </ContactTrigger>
                <nav className="footer-v1-nav w-full" aria-label="Footer navigation">
                  <h2 className="sr-only">Site navigation</h2>
                  <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
                    {navLinks.map((item, index) => {
                      const isExternal = isExternalNavHref(item.href);
                      const opensNewTab = resolveNavBarLinkTarget(item) === "_blank";
                      const linkClassName =
                        "footer-v1-nav-link text-sm font-semibold tracking-wide uppercase transition-colors";

                      return (
                        <li
                          key={`${item.id}-${index}`}
                          className={getNavBarLinkVisibilityClassName(item)}
                        >
                          {isExternal ? (
                            <a
                              href={item.href}
                              target={opensNewTab ? "_blank" : undefined}
                              rel={opensNewTab ? "noopener noreferrer" : undefined}
                              className={linkClassName}
                            >
                              {item.label}
                            </a>
                          ) : (
                            <Link
                              href={resolveNavHref(item.href)}
                              target={opensNewTab ? "_blank" : undefined}
                              rel={opensNewTab ? "noopener noreferrer" : undefined}
                              onClick={(event) => {
                                if (contactModal && isContactHref(item.href)) {
                                  event.preventDefault();
                                  contactModal.openContact();
                                  return;
                                }
                                handleHashNavigation(item.href, event);
                                handlePageLink(item.href, event);
                              }}
                              className={linkClassName}
                            >
                              {item.label}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                <EditableTextBlock
                  editingEnabled={canEditContent}
                  ariaLabel="Edit service area"
                  editorTitle="Edit service area"
                  value={content.serviceArea}
                  multiline
                  rows={2}
                  className="max-w-md text-center"
                  onSave={canEditContent ? preview!.setContentServiceArea : undefined}
                >
                  {(content.serviceArea || canEditContent) && (
                    <p
                      id={footerV1ServiceAreaId}
                      className="footer-v1-service-area text-sm leading-relaxed"
                    >
                      {content.serviceArea}
                    </p>
                  )}
                </EditableTextBlock>
              </div>

              <section
                className="footer-v1-contact lg:text-right"
                aria-labelledby="footer-v1-contact-heading"
              >
                <div className="footer-v1-contact-details">
                  <h2
                    id="footer-v1-contact-heading"
                    className="footer-v1-contact-heading font-semibold tracking-wide uppercase"
                  >
                    Contact
                  </h2>
                  <address className="footer-v1-address mt-4 not-italic">
                    <div className="footer-v1-contact-list flex flex-col gap-4 lg:items-end">
                      {content.contacts.map((contact, index) => (
                        <div
                          key={`${contact.name}-${index}`}
                          className="footer-v1-team-contact flex w-full max-w-full flex-col items-start lg:items-end"
                        >
                          <EditableTextBlock
                            editingEnabled={canEditContent}
                            ariaLabel={`Edit contact ${index + 1} name`}
                            editorTitle={`Edit contact ${index + 1} name`}
                            value={contact.name}
                            className="w-full max-w-full pr-8 lg:pr-0 lg:pl-9"
                            editButtonClassName="lg:-left-9 lg:right-auto"
                            onSave={
                              canEditContent
                                ? (value) => preview!.setContentContactName(index, value)
                                : undefined
                            }
                          >
                            {(contact.name || canEditContent) && (
                              <p className="footer-v1-team-name font-semibold lg:text-right">
                                {contact.name}
                              </p>
                            )}
                          </EditableTextBlock>
                          <EditableTextBlock
                            editingEnabled={canEditContent}
                            ariaLabel={`Edit contact ${index + 1} phone`}
                            editorTitle={`Edit contact ${index + 1} phone`}
                            value={contact.phone}
                            className="mt-1 w-full max-w-full pr-8 lg:pr-0 lg:pl-9"
                            editButtonClassName="lg:-left-9 lg:right-auto"
                            onSave={
                              canEditContent
                                ? (value) => preview!.setContentContactPhone(index, value)
                                : undefined
                            }
                          >
                            {(contact.phone || canEditContent) && (
                              <a
                                href={footerV1PhoneTelHref(contact.phone)}
                                className="footer-v1-contact-link block lg:text-right"
                              >
                                {contact.phone}
                              </a>
                            )}
                          </EditableTextBlock>
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
          <EditableTextBlock
            editingEnabled={canEditContent}
            ariaLabel="Edit copyright line"
            editorTitle="Edit copyright"
            value={content.copyright}
            className="inline-block"
            onSave={canEditContent ? preview!.setContentCopyright : undefined}
          >
            {(content.copyright || canEditContent) && (
              <p className="footer-v1-copyright">{content.copyright}</p>
            )}
          </EditableTextBlock>
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
