"use client";

import { useMemo, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { PreviewAwareLink } from "@/components/site/PreviewAwareLink";
import { usePathname } from "next/navigation";
import { useContactV1Preview } from "@/components/dev/ContactV1PreviewContext";
import { useContactModal } from "@/components/contact/ContactModalContext";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { isContactHref } from "@/lib/contact-modal";
import {
  defaultContactPreviewSettings,
  getHeroV4FormSettings,
} from "@/lib/contact-preview";
import { scrollToHashHref } from "@/lib/scroll-to-hash";
import { HeroV4ContactInfo } from "@/components/sections/Hero-v4-contact-info";
import { HeroV4Form } from "@/components/sections/Hero-v4-form";
import { HeroV4Gallery } from "@/components/sections/Hero-v4-gallery";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import { NavBarLinkEditor } from "@/components/dev/NavBarLinkEditor";
import { HeroV4LinksControls } from "@/components/dev/HeroV4LinksControls";
import { useHeroV4Preview } from "@/components/dev/HeroV4PreviewContext";
import { siteConfig } from "@/config/site";
import { getButtonPreviewStyleRecord, type ButtonPreviewSettings } from "@/lib/button-preview";
import type { HeroBannerSlide } from "@/lib/hero-banner-preview";
import type {
  HeroV4Breadcrumb,
  HeroV4FormLeadSourceId,
  HeroV4LabelFontStyle,
  HeroV4PreviewSettings,
  HeroV4ServicePill,
} from "@/lib/hero-v4-preview";
import {
  defaultHeroV4Breadcrumbs,
  defaultHeroV4ContactInfoItems,
  defaultHeroV4FormLeadSourceId,
  defaultHeroV4PreviewSettings,
  defaultHeroV4ServicePills,
  formatHeroV4Bullets,
  heroV4BreadcrumbsToNavLinks,
  heroV4PillsToNavLinks,
  navLinksToHeroV4Breadcrumbs,
  navLinksToHeroV4Pills,
  normalizeHeroV4PreviewSettings,
  normalizeHeroV4MultilineText,
  parseHeroV4Bullets,
  splitHeroV4BodyBlocks,
  splitHeroV4HeadlineLines,
  resolveHeroV4FormLeadSource,
  resolveHeroV4ShowCta,
} from "@/lib/hero-v4-preview";
import type { NavBarLink } from "@/lib/nav-bar-preview";
import { phoneTelHref } from "@/lib/phone";
import { buildBreadcrumbListSchema, buildHeroV4ServicePillsSchema } from "@/lib/seo-schema";
import { devEditButtonClassName, devEditIconSize } from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

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

  if (!editingEnabled || !onSave) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative max-w-full pr-8", className)}>
      {children}
      <button
        type="button"
        onClick={() => setEditorOpen((open) => !open)}
        className={devEditButtonClassName}
        aria-label={ariaLabel}
        aria-expanded={editorOpen}
      >
        <Pencil size={devEditIconSize} strokeWidth={2} />
      </button>
      {editorOpen ? (
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
      ) : null}
    </div>
  );
}

function EditableLinksBlock({
  editingEnabled,
  ariaLabel,
  title,
  addLabel,
  allowCurrentPage,
  links,
  onChange,
  className,
  children,
}: {
  editingEnabled: boolean;
  ariaLabel: string;
  title: string;
  addLabel: string;
  allowCurrentPage?: boolean;
  links: ReturnType<typeof heroV4PillsToNavLinks>;
  onChange: (links: ReturnType<typeof heroV4PillsToNavLinks>) => void;
  className?: string;
  children: ReactNode;
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  if (!editingEnabled) {
    return <>{children}</>;
  }

  return (
    <div className={cn("relative max-w-full pr-8", className)}>
      {children}
      <button
        type="button"
        onClick={() => setEditorOpen((open) => !open)}
        className={devEditButtonClassName}
        aria-label={ariaLabel}
        aria-expanded={editorOpen}
      >
        <Pencil size={devEditIconSize} strokeWidth={2} />
      </button>
      {editorOpen ? (
        <div className="absolute top-full left-0 z-30 mt-2">
          <HeroV4LinksControls
            title={title}
            links={links}
            allowCurrentPage={allowCurrentPage}
            addLabel={addLabel}
            onChange={onChange}
          />
        </div>
      ) : null}
    </div>
  );
}

type HeroV4Props = {
  breadcrumbs?: HeroV4Breadcrumb[];
  eyebrow?: string;
  headline?: string;
  body?: string;
  bullets?: string[];
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  phoneLabel?: string;
  phoneHref?: string;
  formTitle?: string;
  formSubtext?: string;
  formTrustNotes?: string[];
  formLeadSource?: HeroV4FormLeadSourceId;
  showForm?: boolean;
  showCta?: boolean;
  showPhoneCta?: boolean;
  showServicePills?: boolean;
  servicePills?: HeroV4ServicePill[];
  showGallery?: boolean;
  gallerySlides?: HeroBannerSlide[];
  galleryIntervalMs?: number;
  galleryTransition?: "fade" | "slide";
  galleryHeightPx?: number;
  galleryBackground?: string;
  galleryRadiusPx?: number;
  galleryBorderWidthPx?: number;
  galleryBorderColor?: string;
  labelFontStyle?: HeroV4LabelFontStyle;
  headlineBold?: boolean;
  headlineFirstLineItalic?: boolean;
  headlineUppercase?: boolean;
  headlineFontSizePx?: number;
  button?: ButtonPreviewSettings;
  phoneButton?: ButtonPreviewSettings;
  buttonSize?: ButtonPreviewSettings["navButtonSize"];
  buttonRadiusPx?: number;
  backgroundColor?: string;
  showContactInfo?: boolean;
  contactInfoItems?: HeroV4PreviewSettings["contactInfoItems"];
  contactInfoIconColor?: string;
  contactInfoIconBackground?: string;
  contactInfoIconRadiusPx?: number;
  className?: string;
};

/**
 * Split hero — editable copy on the left, optional lead form on the right.
 * Same vertical rhythm as Hero-v3.
 */
export function HeroV4({
  breadcrumbs = defaultHeroV4Breadcrumbs,
  eyebrow = defaultHeroV4PreviewSettings.eyebrow,
  headline = defaultHeroV4PreviewSettings.headline,
  body = defaultHeroV4PreviewSettings.body,
  bullets = defaultHeroV4PreviewSettings.bullets,
  primaryCtaLabel = defaultHeroV4PreviewSettings.primaryCtaLabel,
  primaryCtaHref = defaultHeroV4PreviewSettings.primaryCtaHref,
  phoneLabel = defaultHeroV4PreviewSettings.phoneLabel,
  phoneHref = defaultHeroV4PreviewSettings.phoneHref,
  formTitle = defaultHeroV4PreviewSettings.formTitle,
  formSubtext = defaultHeroV4PreviewSettings.formSubtext,
  formTrustNotes = defaultHeroV4PreviewSettings.formTrustNotes,
  formLeadSource = defaultHeroV4FormLeadSourceId,
  showForm = defaultHeroV4PreviewSettings.showForm,
  showCta,
  showPhoneCta = defaultHeroV4PreviewSettings.showPhoneCta,
  showServicePills = defaultHeroV4PreviewSettings.showServicePills,
  servicePills = defaultHeroV4ServicePills,
  showGallery = false,
  gallerySlides = [],
  galleryIntervalMs = defaultHeroV4PreviewSettings.galleryIntervalMs,
  galleryTransition = defaultHeroV4PreviewSettings.galleryTransition,
  galleryHeightPx = defaultHeroV4PreviewSettings.galleryHeightPx,
  galleryBackground = defaultHeroV4PreviewSettings.galleryBackground,
  galleryRadiusPx = defaultHeroV4PreviewSettings.galleryRadiusPx,
  galleryBorderWidthPx = defaultHeroV4PreviewSettings.galleryBorderWidthPx,
  galleryBorderColor = defaultHeroV4PreviewSettings.galleryBorderColor,
  labelFontStyle = defaultHeroV4PreviewSettings.labelFontStyle,
  headlineBold = false,
  headlineFirstLineItalic = false,
  headlineUppercase = false,
  headlineFontSizePx,
  button,
  phoneButton,
  buttonSize,
  buttonRadiusPx,
  backgroundColor,
  showContactInfo = false,
  contactInfoItems = defaultHeroV4ContactInfoItems,
  contactInfoIconColor,
  contactInfoIconBackground,
  contactInfoIconRadiusPx,
  className,
}: HeroV4Props) {
  const pathname = usePathname();
  const modal = useContactModal();
  const contactPreview = useContactV1Preview();
  const preview = useHeroV4Preview();
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const [ctaEditorOpen, setCtaEditorOpen] = useState(false);
  const formSettings = useMemo(() => {
    const heroForm = preview?.settings;
    return getHeroV4FormSettings(
      contactPreview?.settings ?? defaultContactPreviewSettings,
      resolveHeroV4FormLeadSource(formLeadSource),
      heroForm
        ? {
            formSubmitText: heroForm.formSubmitText,
            formButtonBackground: heroForm.formButtonBackground,
            formButtonTextColor: heroForm.formButtonTextColor,
            formButtonRadiusPx: heroForm.formButtonRadiusPx,
            formFields: heroForm.formFields,
          }
        : undefined,
    );
  }, [contactPreview?.settings, formLeadSource, preview?.settings]);
  const bodyBlocks = useMemo(() => {
    const blocks = splitHeroV4BodyBlocks(body);
    return blocks.length > 0 ? blocks : [body];
  }, [body]);
  const showPrimaryCta = resolveHeroV4ShowCta({ showForm, showCta });
  const showGalleryColumn =
    showGallery && (gallerySlides.length > 0 || editingEnabled);
  const galleryLayout = showGalleryColumn && !showForm;
  const showRightColumn = showForm || showGalleryColumn;
  const showPhone = showPhoneCta && (Boolean(phoneLabel) || editingEnabled);
  const visibleServicePills = showServicePills ? servicePills : [];
  const showBreadcrumbRow =
    breadcrumbs.length > 0 || (editingEnabled && Boolean(preview?.settings.showBreadcrumbs));
  const showPillsRow = visibleServicePills.length > 0 || (editingEnabled && showServicePills);
  const showActions = showPrimaryCta || showPhone || showPillsRow;
  const sectionBackgroundColor = backgroundColor ?? preview?.settings.backgroundColor;
  const resolvedShowContactInfo = preview?.settings.showContactInfo ?? showContactInfo;
  const resolvedContactInfoItems =
    preview?.settings.contactInfoItems && preview.settings.contactInfoItems.length > 0
      ? preview.settings.contactInfoItems
      : contactInfoItems;
  const ctaButtonSettings = button ?? preview?.settings.button;
  const phoneButtonSettings = phoneButton ?? preview?.settings.phoneButton;
  const sharedButtonSize =
    buttonSize ?? preview?.settings.buttonSize ?? ctaButtonSettings?.navButtonSize;
  const sharedButtonRadiusPx =
    buttonRadiusPx ?? preview?.settings.buttonRadiusPx ?? ctaButtonSettings?.navButtonRadiusPx;
  const sharedShapeStyle =
    typeof sharedButtonRadiusPx === "number"
      ? ({
          borderRadius: `${sharedButtonRadiusPx}px`,
          "--header-v3-nav-radius": `${sharedButtonRadiusPx}px`,
        } as CSSProperties)
      : undefined;
  const ctaButtonStyle =
    ctaButtonSettings || sharedShapeStyle
      ? ({
          ...(ctaButtonSettings
            ? (getButtonPreviewStyleRecord(ctaButtonSettings) as CSSProperties)
            : {}),
          ...sharedShapeStyle,
        } as CSSProperties)
      : undefined;
  const phoneButtonStyle =
    phoneButtonSettings || sharedShapeStyle
      ? ({
          ...(phoneButtonSettings
            ? (getButtonPreviewStyleRecord(phoneButtonSettings) as CSSProperties)
            : {}),
          ...sharedShapeStyle,
        } as CSSProperties)
      : undefined;

  const pageJsonLd = useMemo(() => {
    const blocks: Record<string, unknown>[] = [];
    if (breadcrumbs.length > 0) {
      blocks.push(
        buildBreadcrumbListSchema(
          breadcrumbs.map((crumb) => ({
            name: crumb.label,
            path: crumb.href || pathname || "/",
          })),
        ),
      );
    }
    if (visibleServicePills.length > 0) {
      blocks.push(buildHeroV4ServicePillsSchema(visibleServicePills, pathname));
    }
    return blocks;
  }, [breadcrumbs, pathname, visibleServicePills]);

  const update = (patch: Partial<HeroV4PreviewSettings>) => {
    if (!preview) return;
    preview.setSettings(normalizeHeroV4PreviewSettings({ ...preview.settings, ...patch }));
  };

  function handlePrimaryCtaClick(event: MouseEvent<HTMLAnchorElement>) {
    if (modal && isContactHref(primaryCtaHref)) {
      event.preventDefault();
      modal.openContact({ message: primaryCtaLabel });
      return;
    }
    if (scrollToHashHref(primaryCtaHref)) {
      event.preventDefault();
    }
  }

  const phoneLink = showPhone ? (
    <EditableTextBlock
      editingEnabled={editingEnabled}
      ariaLabel="Edit hero phone"
      editorTitle="Hero phone"
      value={phoneLabel}
      onSave={(value) => update({ phoneLabel: value, phoneHref: phoneTelHref(value) })}
    >
      {phoneLabel ? (
        <a
          href={phoneHref}
          className={cn(
            "hero-v4-phone inline-flex items-center rounded-lg px-6 py-3 text-base font-medium transition-colors",
            phoneButtonSettings && "hero-v4-phone--custom",
          )}
          style={phoneButtonStyle}
          data-button-size={sharedButtonSize}
        >
          {labelFontStyle === "slant" ? (
            <span className="hero-v4-phone-label">{phoneLabel}</span>
          ) : (
            phoneLabel
          )}
        </a>
      ) : (
        <p className="text-sm text-muted/70">Add phone</p>
      )}
    </EditableTextBlock>
  ) : null;

  return (
    <section
      className={cn(
        "hero-v4 hero-v3 relative overflow-hidden py-11 lg:py-[3.75rem]",
        labelFontStyle === "italic" && "hero-v4--style-italic",
        labelFontStyle === "slant" && "hero-v4--style-slant",
        className,
      )}
    >
      {pageJsonLd.length > 0 ? <JsonLd data={pageJsonLd} /> : null}
      <div
        className={cn(
          "hero-v3-bg pointer-events-none absolute inset-0",
          sectionBackgroundColor && "hero-v3-bg--solid",
        )}
        style={sectionBackgroundColor ? { background: sectionBackgroundColor } : undefined}
        aria-hidden="true"
      />

      <Container className="relative">
        <div
          className={cn(
            "hero-v4-grid grid items-start",
            showForm &&
              "gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(300px,400px)] lg:gap-12",
            galleryLayout &&
              "hero-v4-grid--gallery gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(580px,640px)] lg:gap-12",
            !showRightColumn && "hero-v4-grid--copy-only max-w-4xl gap-10",
          )}
        >
          <div className="hero-v4-copy min-w-0">
            {showBreadcrumbRow ? (
              <EditableLinksBlock
                editingEnabled={editingEnabled}
                ariaLabel="Edit hero breadcrumbs"
                title="Breadcrumb links"
                addLabel="+ Add crumb"
                allowCurrentPage
                links={heroV4BreadcrumbsToNavLinks(breadcrumbs)}
                onChange={(links) => update({ breadcrumbs: navLinksToHeroV4Breadcrumbs(links) })}
              >
                {breadcrumbs.length > 0 ? (
                  <nav className="hero-v4-breadcrumbs mb-5 text-sm text-muted" aria-label="Breadcrumb">
                    <ol className="flex flex-wrap items-center gap-2">
                      {breadcrumbs.map((crumb, index) => (
                        <li key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                          {index > 0 ? (
                            <span className="text-muted/60" aria-hidden="true">
                              /
                            </span>
                          ) : null}
                          {crumb.href ? (
                            <PreviewAwareLink href={crumb.href} className="transition-colors hover:text-foreground">
                              {crumb.label}
                            </PreviewAwareLink>
                          ) : (
                            <span className="text-foreground/90">{crumb.label}</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>
                ) : (
                  <p className="hero-v4-breadcrumbs mb-5 text-sm text-muted/70">Add breadcrumb</p>
                )}
              </EditableLinksBlock>
            ) : null}

            <EditableTextBlock
              editingEnabled={editingEnabled}
              ariaLabel="Edit hero eyebrow"
              editorTitle="Hero eyebrow"
              value={eyebrow}
              onSave={(value) => update({ eyebrow: value })}
            >
              <p className="hero-v4-eyebrow text-sm font-medium uppercase tracking-[0.18em] text-accent-blue">
                {eyebrow}
              </p>
            </EditableTextBlock>

            <EditableTextBlock
              editingEnabled={editingEnabled}
              ariaLabel="Edit hero headline"
              editorTitle="Hero headline"
              value={headline}
              multiline
              rows={3}
              onSave={(value) => update({ headline: value })}
            >
              <h1
                className={cn(
                  "hero-v4-headline mt-4 font-serif leading-[1.08] tracking-tight text-foreground",
                  !headlineFontSizePx && "text-4xl sm:text-5xl lg:text-[3.25rem]",
                  headlineBold ? "font-semibold" : "font-light",
                  headlineFirstLineItalic && labelFontStyle !== "slant" && "italic",
                  headlineUppercase && "uppercase",
                )}
                style={headlineFontSizePx ? { fontSize: `${headlineFontSizePx}px` } : undefined}
              >
                {splitHeroV4HeadlineLines(headline).map((line, index) => (
                  <span key={`headline-line-${index}`} className="hero-v4-headline-line block">
                    {line || "\u00A0"}
                  </span>
                ))}
              </h1>
            </EditableTextBlock>

            <EditableTextBlock
              editingEnabled={editingEnabled}
              ariaLabel="Edit hero body"
              editorTitle="Hero body"
              value={body}
              multiline
              rows={5}
              onSave={(value) => update({ body: normalizeHeroV4MultilineText(value).trim() })}
            >
              {bodyBlocks.map((block, index) => (
                  <p
                    key={`hero-body-${index}`}
                    className={cn(
                      "hero-v4-body max-w-2xl whitespace-pre-line text-base leading-relaxed text-muted sm:text-lg",
                      index === 0 ? "mt-5" : "mt-4",
                    )}
                  >
                    {block || "\u00A0"}
                  </p>
                ),
              )}
            </EditableTextBlock>

            {bullets.length > 0 || (editingEnabled && preview?.settings.showBullets) ? (
              <EditableTextBlock
                editingEnabled={editingEnabled}
                ariaLabel="Edit hero bullets"
                editorTitle="Hero bullets"
                value={formatHeroV4Bullets(bullets)}
                multiline
                rows={5}
                onSave={(value) => update({ bullets: parseHeroV4Bullets(value) })}
              >
                {bullets.length > 0 ? (
                  <ul className="hero-v4-bullets mt-8 grid gap-3 sm:grid-cols-2">
                    {bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3 text-sm text-foreground sm:text-base">
                        <span className="hero-v4-bullet-icon mt-1 shrink-0" aria-hidden="true" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-8 text-sm text-muted/70">Add bullets</p>
                )}
              </EditableTextBlock>
            ) : null}

            {showActions ? (
              <div
                className={cn(
                  "hero-v4-actions mt-8 flex flex-col items-start gap-4",
                  !showPrimaryCta && "sm:w-auto",
                )}
              >
                {showPillsRow ? (
                  <EditableLinksBlock
                    editingEnabled={editingEnabled}
                    ariaLabel="Edit hero pills"
                    title="Pill links"
                    addLabel="+ Add pill"
                    links={heroV4PillsToNavLinks(servicePills)}
                    onChange={(links) =>
                      update({ servicePills: navLinksToHeroV4Pills(links, servicePills) })
                    }
                  >
                    {visibleServicePills.length > 0 ? (
                      <nav aria-label="Services">
                        <ul className="hero-v4-service-pills flex flex-wrap gap-2">
                          {visibleServicePills.map((pill) => (
                            <li key={`${pill.label}-${pill.href}`}>
                              <PreviewAwareLink
                                href={pill.href}
                                title={pill.title}
                                className="hero-v4-service-pill inline-flex rounded-full border border-border bg-surface/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-accent-blue/40 hover:bg-hover-overlay sm:text-sm"
                              >
                                {pill.label}
                              </PreviewAwareLink>
                            </li>
                          ))}
                        </ul>
                      </nav>
                    ) : (
                      <p className="text-sm text-muted/70">Add pill</p>
                    )}
                  </EditableLinksBlock>
                ) : null}

                {showPrimaryCta ? (
                  <div className="hero-v4-cta-row flex flex-wrap items-center gap-4">
                    {editingEnabled ? (
                      <div className="relative inline-flex pr-8">
                        <a
                          href={primaryCtaHref}
                          aria-label={`${primaryCtaLabel} — contact ${siteConfig.name}`}
                          onClick={handlePrimaryCtaClick}
                        >
                          <Button
                            size="lg"
                            className={cn(
                              "hero-v4-cta-btn",
                              ctaButtonSettings && "preview-button--custom",
                            )}
                            style={ctaButtonStyle}
                            data-button-size={sharedButtonSize}
                          >
                            {primaryCtaLabel}
                          </Button>
                        </a>
                        <button
                          type="button"
                          onClick={() => setCtaEditorOpen((open) => !open)}
                          className={devEditButtonClassName}
                          aria-label="Edit hero button"
                          aria-expanded={ctaEditorOpen}
                        >
                          <Pencil size={devEditIconSize} strokeWidth={2} />
                        </button>
                        {ctaEditorOpen ? (
                          <NavBarLinkEditor
                            link={{
                              id: "hero-v4-cta",
                              label: primaryCtaLabel,
                              href: primaryCtaHref,
                            }}
                            linkIndex={0}
                            onSave={(link: NavBarLink) => {
                              update({
                                primaryCtaLabel: link.label,
                                primaryCtaHref: link.href,
                              });
                              setCtaEditorOpen(false);
                            }}
                            onDelete={() => setCtaEditorOpen(false)}
                            onClose={() => setCtaEditorOpen(false)}
                          />
                        ) : null}
                      </div>
                    ) : (
                      <a
                        href={primaryCtaHref}
                        aria-label={`${primaryCtaLabel} — contact ${siteConfig.name}`}
                        onClick={handlePrimaryCtaClick}
                      >
                        <Button
                          size="lg"
                          className={cn(
                            "hero-v4-cta-btn",
                            ctaButtonSettings && "preview-button--custom",
                          )}
                          style={ctaButtonStyle}
                          data-button-size={sharedButtonSize}
                        >
                          {primaryCtaLabel}
                        </Button>
                      </a>
                    )}
                    {phoneLink}
                  </div>
                ) : (
                  phoneLink
                )}
              </div>
            ) : null}

            {resolvedShowContactInfo ? (
              <HeroV4ContactInfo
                items={resolvedContactInfoItems}
                iconColor={contactInfoIconColor}
                iconBackground={contactInfoIconBackground}
                iconRadiusPx={contactInfoIconRadiusPx}
                className="mt-8"
              />
            ) : null}
          </div>

          {galleryLayout ? (
            <HeroV4Gallery
              slides={gallerySlides}
              intervalMs={galleryIntervalMs}
              transition={galleryTransition}
              heightPx={galleryHeightPx}
              background={galleryBackground}
              radiusPx={galleryRadiusPx}
              borderWidthPx={galleryBorderWidthPx}
              borderColor={galleryBorderColor}
              className="hero-v4-gallery-slot"
            />
          ) : null}

          {showForm ? (
            <HeroV4Form
              title={formTitle}
              subtext={formSubtext}
              trustNotes={formTrustNotes}
              settings={formSettings}
              className="lg:sticky lg:top-28"
            />
          ) : null}
        </div>
      </Container>
    </section>
  );
}
