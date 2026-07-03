"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Pencil, Shuffle } from "lucide-react";
import { siteConfig } from "@/config/site";
import { useServicesIconsV2Preview } from "@/components/dev/ServicesIconsV2PreviewContext";
import { LucideIconPicker } from "@/components/dev/LucideIconPicker";
import { ServiceCtaEditor } from "@/components/dev/ServiceCtaEditor";
import { ServiceLabelEditor } from "@/components/dev/ServiceLabelEditor";
import { SiteIcon } from "@/components/icons/SiteIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import {
  defaultServicesIconsV2PreviewSettings,
  getServicesIconsV2BackgroundStyle,
  type ServicesIconsV2PreviewSettings,
} from "@/lib/services-icons-v2-preview";
import { buildServicesIconsV2ItemListSchema } from "@/lib/seo-schema";
import { defaultSiteIconName, resolveSiteIconName, type SiteIconName } from "@/lib/site-icons";
import { getSiteLayoutWidthClassName } from "@/lib/site-layout";
import { cn } from "@/lib/utils";

export type ServicesIconsV2Service = {
  id: string;
  title: string;
  icon?: SiteIconName;
  /** Used for JSON-LD and screen-reader context — not shown on the card face. */
  description?: string;
};

export type ServicesIconsV2Cta = {
  label: string;
  href: string;
};

type ServicesIconsV2Props = {
  heading: string;
  seoDescription: string;
  services: ServicesIconsV2Service[];
  cta: ServicesIconsV2Cta;
  settings?: ServicesIconsV2PreviewSettings;
  className?: string;
};

const headingId = "services-icons-v2-heading";

function ServiceIconCircle({
  iconName,
  circleColor,
  iconColor,
  iconSizePx,
}: {
  iconName: SiteIconName;
  circleColor: string;
  iconColor: string;
  iconSizePx: number;
}) {
  const iconInnerSize = Math.round(iconSizePx * 0.48);

  return (
    <div
      className="services-icons-v2-icon-circle flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: `${iconSizePx}px`,
        height: `${iconSizePx}px`,
        backgroundColor: circleColor,
      }}
      aria-hidden="true"
    >
      <SiteIcon name={iconName} size={iconInnerSize} color={iconColor} strokeWidth={1.75} aria-hidden />
    </div>
  );
}

function ServiceCard({
  service,
  settings,
  iconName,
  label,
  description,
  iconEditingEnabled,
  onIconChange,
  onLabelChange,
}: {
  service: ServicesIconsV2Service;
  settings: ServicesIconsV2PreviewSettings;
  iconName: SiteIconName;
  label: string;
  description?: string;
  iconEditingEnabled: boolean;
  onIconChange?: (iconName: SiteIconName) => void;
  onLabelChange?: (label: string) => void;
}) {
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [labelEditorOpen, setLabelEditorOpen] = useState(false);

  const cardStyle: CSSProperties = {
    backgroundColor: settings.cardBackgroundColor,
    borderRadius: `${settings.cardBorderRadiusPx}px`,
    padding: `${settings.cardPaddingPx}px`,
    minHeight: `${settings.cardMinHeightPx}px`,
    color: settings.cardTextColor,
    fontSize: `${settings.cardFontSizePx}px`,
  };

  return (
    <article
      className="services-icons-v2-card relative flex w-full max-w-[480px] items-center gap-5"
      style={cardStyle}
      aria-labelledby={`service-${service.id}-title`}
    >
      {description && <span className="sr-only">{description}</span>}
      <div className="relative shrink-0">
        <ServiceIconCircle
          iconName={iconName}
          circleColor={settings.circleColor}
          iconColor={settings.iconColor}
          iconSizePx={settings.iconSizePx}
        />
        {iconEditingEnabled && onIconChange && (
          <>
            <button
              type="button"
              onClick={() => {
                setLabelEditorOpen(false);
                setIconPickerOpen((open) => !open);
              }}
              className="absolute -top-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-accent-purple/50 bg-background/95 text-accent-purple shadow-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10"
              aria-label={`Change icon for ${label}`}
              aria-expanded={iconPickerOpen}
            >
              <Shuffle size={12} strokeWidth={2} />
            </button>
            {iconPickerOpen && (
              <div className="absolute top-8 left-0 z-30">
                <LucideIconPicker
                  value={iconName}
                  onChange={onIconChange}
                  onClose={() => setIconPickerOpen(false)}
                />
              </div>
            )}
          </>
        )}
      </div>
      <div className="relative min-w-0 flex-1">
        <h3
          id={`service-${service.id}-title`}
          className="services-icons-v2-card-text text-left font-sans font-semibold italic leading-snug"
        >
          {label}
        </h3>
        {iconEditingEnabled && onLabelChange && (
          <>
            <button
              type="button"
              onClick={() => {
                setIconPickerOpen(false);
                setLabelEditorOpen((open) => !open);
              }}
              className="absolute -top-1 -right-1 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-accent-purple/50 bg-background/95 text-accent-purple shadow-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10"
              aria-label={`Edit label for ${label}`}
              aria-expanded={labelEditorOpen}
            >
              <Pencil size={12} strokeWidth={2} />
            </button>
            {labelEditorOpen && (
              <div className="absolute top-7 right-0 z-30">
                <ServiceLabelEditor
                  value={label}
                  onChange={onLabelChange}
                  onClose={() => setLabelEditorOpen(false)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </article>
  );
}

function CtaCard({
  cta,
  settings,
  editingEnabled,
  onCtaChange,
}: {
  cta: ServicesIconsV2Cta;
  settings: ServicesIconsV2PreviewSettings;
  editingEnabled: boolean;
  onCtaChange?: (label: string, href: string) => void;
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  const cardStyle: CSSProperties = {
    backgroundColor: settings.ctaBackgroundColor,
    borderRadius: `${settings.cardBorderRadiusPx}px`,
    padding: `${settings.cardPaddingPx}px`,
    minHeight: `${settings.cardMinHeightPx}px`,
    color: settings.ctaTextColor,
    fontSize: `${settings.cardFontSizePx}px`,
  };

  const callLabel = `Call ${siteConfig.name} at ${cta.label}`;
  const textStyle: CSSProperties = { color: settings.ctaTextColor };

  return (
    <article className="relative w-full max-w-[480px]">
      <a
        href={cta.href}
        className="services-icons-v2-cta-card flex w-full items-center justify-center no-underline transition-opacity hover:opacity-90"
        style={cardStyle}
        aria-label={callLabel}
      >
        <span
          className="text-center font-sans font-semibold italic leading-snug"
          style={textStyle}
        >
          {cta.label}
        </span>
      </a>
      {editingEnabled && onCtaChange && (
        <>
          <button
            type="button"
            onClick={() => setEditorOpen((open) => !open)}
            className="absolute top-2 right-2 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-accent-purple/50 bg-background/95 text-accent-purple shadow-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10"
            aria-label="Edit call-to-action phone number"
            aria-expanded={editorOpen}
          >
            <Pencil size={12} strokeWidth={2} />
          </button>
          {editorOpen && (
            <div className="absolute top-10 right-2 z-30">
              <ServiceCtaEditor
                value={cta.label}
                onChange={onCtaChange}
                onClose={() => setEditorOpen(false)}
              />
            </div>
          )}
        </>
      )}
    </article>
  );
}

function SectionHeading({
  heading,
  headingStyle,
  editingEnabled,
  onHeadingChange,
}: {
  heading: string;
  headingStyle: CSSProperties;
  editingEnabled: boolean;
  onHeadingChange?: (heading: string) => void;
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <header className="relative mb-4 inline-block max-w-full">
      <h2
        id={headingId}
        className="services-icons-v2-heading font-sans font-semibold italic leading-tight"
        style={headingStyle}
      >
        {heading}
      </h2>
      {editingEnabled && onHeadingChange && (
        <>
          <button
            type="button"
            onClick={() => setEditorOpen((open) => !open)}
            className="absolute -top-1 -right-8 z-20 flex h-6 w-6 items-center justify-center rounded-full border border-accent-purple/50 bg-background/95 text-accent-purple shadow-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10"
            aria-label="Edit section heading"
            aria-expanded={editorOpen}
          >
            <Pencil size={12} strokeWidth={2} />
          </button>
          {editorOpen && (
            <div className="absolute top-full left-0 z-30 mt-2">
              <ServiceLabelEditor
                value={heading}
                onChange={onHeadingChange}
                onClose={() => setEditorOpen(false)}
                dialogTitle="Edit title"
                dialogAriaLabel="Edit section heading"
                inputAriaLabel="Section heading"
              />
            </div>
          )}
        </>
      )}
    </header>
  );
}

/** Three-column service icon cards with CTA tile — Spartan restoration services grid. */
export function ServicesIconsV2({
  heading,
  seoDescription,
  services,
  cta: defaultCta,
  settings: settingsProp,
  className,
}: ServicesIconsV2Props) {
  const preview = useServicesIconsV2Preview();
  const settings = settingsProp ?? preview?.settings ?? defaultServicesIconsV2PreviewSettings;
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const cta = preview?.getCta(defaultCta) ?? defaultCta;
  const sectionHeading = preview?.getSectionHeading(heading) ?? heading;
  const isContained = settings.layoutWidth === "contained";
  const gradientBackground = getServicesIconsV2BackgroundStyle(settings);

  const resolvedServices = useMemo(
    () =>
      services.map((service) => {
        const label = preview?.getServiceLabel(service.id, service.title) ?? service.title;
        return {
          id: service.id,
          label,
          description: service.description,
          icon: service.icon,
        };
      }),
    [preview, services],
  );

  const structuredData = useMemo(
    () =>
      buildServicesIconsV2ItemListSchema(
        sectionHeading,
        seoDescription,
        resolvedServices.map((service) => ({
          name: service.label,
          description: service.description,
        })),
      ),
    [sectionHeading, resolvedServices, seoDescription],
  );

  const headingStyle: CSSProperties = {
    color: settings.headingColor,
    fontSize: `${settings.headingFontSizePx}px`,
  };

  const content = (
    <>
      <JsonLd data={structuredData} />
      <SectionHeading
        heading={sectionHeading}
        headingStyle={headingStyle}
        editingEnabled={editingEnabled}
        onHeadingChange={
          preview ? (nextHeading) => preview.setSectionHeading(nextHeading) : undefined
        }
      />
      <p className="sr-only">{seoDescription}</p>

      <ul
        className="grid list-none grid-cols-1 justify-items-stretch gap-6 p-0 md:grid-cols-2 lg:grid-cols-3"
        aria-label={`${sectionHeading} list`}
      >
        {services.map((service) => {
          const fallbackIcon = resolveSiteIconName(service.icon, defaultSiteIconName);
          const iconName = preview?.getServiceIcon(service.id, fallbackIcon) ?? fallbackIcon;
          const label = preview?.getServiceLabel(service.id, service.title) ?? service.title;

          return (
            <li key={service.id}>
              <ServiceCard
                service={service}
                settings={settings}
                iconName={iconName}
                label={label}
                description={service.description}
                iconEditingEnabled={editingEnabled}
                onIconChange={
                  preview
                    ? (nextIcon) => preview.setServiceIcon(service.id, nextIcon)
                    : undefined
                }
                onLabelChange={
                  preview
                    ? (nextLabel) => preview.setServiceLabel(service.id, nextLabel)
                    : undefined
                }
              />
            </li>
          );
        })}
        <li>
          <CtaCard
            cta={cta}
            settings={settings}
            editingEnabled={editingEnabled}
            onCtaChange={preview ? (label, href) => preview.setCta(label, href) : undefined}
          />
        </li>
      </ul>
    </>
  );

  if (isContained) {
    return (
      <section
        className={cn("services-icons-v2", className)}
        style={{ backgroundColor: settings.outerBackgroundColor }}
        aria-labelledby={headingId}
      >
        <div className={getSiteLayoutWidthClassName("contained")}>
          <div className="py-16 lg:py-20" style={{ background: gradientBackground }}>
            {content}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn("services-icons-v2 py-16 lg:py-20", className)}
      style={{ background: gradientBackground }}
      aria-labelledby={headingId}
    >
      <Container>{content}</Container>
    </section>
  );
}
