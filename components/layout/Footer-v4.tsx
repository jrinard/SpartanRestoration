"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Images, Pencil } from "lucide-react";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import { useFooterV4Preview } from "@/components/dev/FooterV4PreviewContext";
import {
  usePlaygroundNavLinkHref,
  usePlaygroundPageLink,
} from "@/components/dev/usePlaygroundPageLink";
import { siteConfig } from "@/config/site";
import {
  buildFooterV4DefaultContent,
  defaultFooterV4PreviewSettings,
  getFooterV4Style,
  resolveFooterV4LogoSrc,
  type FooterV4ServiceLink,
} from "@/lib/footer-v4-preview";
import {
  devEditButtonClassName,
  devEditIconSize,
  devLibraryIconSize,
  devLibraryLabelClassName,
  devLibraryPillClassName,
} from "@/lib/dev-overlay-controls";
import { usePlaygroundImageLibraryFolder } from "@/lib/use-playground-image-library-folder";
import { cn } from "@/lib/utils";

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

function EditableTextBlock({
  editingEnabled,
  ariaLabel,
  editorTitle,
  value,
  multiline,
  rows,
  className,
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
            className={devEditButtonClassName}
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

type FooterV4Props = {
  hours: string[];
  serviceLinks: FooterV4ServiceLink[];
  licenses: string[];
};

/**
 * Blue gradient footer banner — OSP-style company, hours, and services columns.
 */
export function FooterV4({ hours, serviceLinks, licenses }: FooterV4Props) {
  const preview = useFooterV4Preview();
  const settings = preview?.settings ?? defaultFooterV4PreviewSettings;
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const [logoLibraryOpen, setLogoLibraryOpen] = useState(false);
  const { folder: libraryFolder } = usePlaygroundImageLibraryFolder();
  const handlePageLink = usePlaygroundPageLink();
  const resolveNavHref = usePlaygroundNavLinkHref();

  const defaultContent = useMemo(
    () => buildFooterV4DefaultContent({ hours, serviceLinks, licenses }),
    [hours, licenses, serviceLinks],
  );

  const content = preview?.getContent(defaultContent) ?? defaultContent;
  const logoSrc = resolveFooterV4LogoSrc(settings, libraryFolder);
  const footerStyle = getFooterV4Style(settings) as CSSProperties;
  const canEditContent = editingEnabled && Boolean(preview);

  const socialLinks: { label: string; href: string; icon: ReactNode }[] = [];
  if (settings.showFacebook && content.facebookUrl.trim()) {
    socialLinks.push({
      label: "Facebook",
      href: content.facebookUrl.trim(),
      icon: <FacebookIcon />,
    });
  }
  if (settings.showInstagram && content.instagramUrl.trim()) {
    socialLinks.push({
      label: "Instagram",
      href: content.instagramUrl.trim(),
      icon: <InstagramIcon />,
    });
  }

  const hoursBlock = (
    <>
      <h2 className="footer-washing-heading">Hours</h2>
      {content.hours.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <div className="footer-washing-licenses">
        {content.licenses.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
    </>
  );

  return (
    <footer className="footer-washing" style={footerStyle}>
      <aside className="footer-washing-banner" role="complementary">
        <div className="footer-washing-grid">
          <div className="footer-washing-company">
            <div className="footer-washing-logo-wrap relative inline-flex max-w-full">
              <Image
                src={logoSrc}
                alt={`${siteConfig.name} logo`}
                width={320}
                height={192}
                className="footer-washing-logo block w-auto object-contain"
              />
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
                            onSelect={(entry) => {
                              preview.saveContentOverrides({ contentLogoSrc: entry.src });
                              setLogoLibraryOpen(false);
                            }}
                            onClose={() => setLogoLibraryOpen(false)}
                          />
                    </div>
                  )}
                </>
              )}
            </div>
            <h3 className="sr-only">{siteConfig.name}</h3>
            <EditableTextBlock
              editingEnabled={canEditContent}
              ariaLabel="Edit footer address"
              editorTitle="Footer address"
              value={content.address}
              multiline
              rows={3}
              onSave={(value) => preview?.saveContentOverrides({ contentAddress: value })}
            >
              <address>
                {content.address.split("\n").map((line, index, lines) => (
                  <span key={`${line}-${index}`}>
                    {line}
                    {index < lines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </address>
            </EditableTextBlock>
            {content.phone ? (
              <EditableTextBlock
                editingEnabled={canEditContent}
                ariaLabel="Edit footer phone"
                editorTitle="Footer phone"
                value={content.phone}
                onSave={(value) => preview?.saveContentOverrides({ contentPhone: value })}
              >
                <a
                  href={`tel:${content.phone.replace(/\D/g, "")}`}
                  className="footer-washing-phone"
                >
                  {content.phone}
                </a>
              </EditableTextBlock>
            ) : null}
            {content.email ? (
              <EditableTextBlock
                editingEnabled={canEditContent}
                ariaLabel="Edit footer email"
                editorTitle="Footer email"
                value={content.email}
                onSave={(value) => preview?.saveContentOverrides({ contentEmail: value })}
              >
                <a href={`mailto:${content.email}`}>{content.email}</a>
              </EditableTextBlock>
            ) : null}
            {socialLinks.length > 0 ? (
              <div className="footer-washing-social">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit on ${link.label}`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </a>
                ))}
              </div>
            ) : null}
            <EditableTextBlock
              editingEnabled={canEditContent}
              ariaLabel="Edit footer hours and licenses"
              editorTitle="Footer hours and licenses"
              value={[...content.hours, "", ...content.licenses].join("\n")}
              multiline
              rows={8}
              className="footer-washing-hours-mobile"
              onSave={(value) => {
                const lines = value.split("\n");
                const blankIndex = lines.findIndex((line) => !line.trim());
                const hourLines =
                  blankIndex === -1 ? lines : lines.slice(0, blankIndex);
                const licenseLines =
                  blankIndex === -1 ? [] : lines.slice(blankIndex + 1);
                preview?.saveContentOverrides({
                  contentHours: hourLines.map((line) => line.trim()).filter(Boolean),
                  contentLicenses: licenseLines.map((line) => line.trim()).filter(Boolean),
                });
              }}
            >
              <div className="footer-washing-hours-mobile">{hoursBlock}</div>
            </EditableTextBlock>
          </div>

          <div className="footer-washing-services">
            <h2 className="footer-washing-heading">Services</h2>
            <ul>
              {content.serviceLinks.map((item) => (
                <li key={`${item.label}-${item.href}`}>
                  <Link
                    href={resolveNavHref(item.href)}
                    onClick={(event) => handlePageLink(item.href, event)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <EditableTextBlock
            editingEnabled={canEditContent}
            ariaLabel="Edit footer hours and licenses"
            editorTitle="Footer hours and licenses"
            value={[...content.hours, "", ...content.licenses].join("\n")}
            multiline
            rows={8}
            className="footer-washing-hours-desktop"
            onSave={(value) => {
              const lines = value.split("\n");
              const blankIndex = lines.findIndex((line) => !line.trim());
              const hourLines = blankIndex === -1 ? lines : lines.slice(0, blankIndex);
              const licenseLines = blankIndex === -1 ? [] : lines.slice(blankIndex + 1);
              preview?.saveContentOverrides({
                contentHours: hourLines.map((line) => line.trim()).filter(Boolean),
                contentLicenses: licenseLines.map((line) => line.trim()).filter(Boolean),
              });
            }}
          >
            <div className="footer-washing-hours-desktop">{hoursBlock}</div>
          </EditableTextBlock>
        </div>
      </aside>
      <div className="footer-washing-bottom" role="contentinfo">
        <EditableTextBlock
          editingEnabled={canEditContent}
          ariaLabel="Edit footer copyright"
          editorTitle="Footer copyright"
          value={content.copyright}
          onSave={(value) => preview?.saveContentOverrides({ contentCopyright: value })}
        >
          <p>{content.copyright}</p>
        </EditableTextBlock>
      </div>
    </footer>
  );
}
