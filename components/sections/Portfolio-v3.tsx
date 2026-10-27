"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Images, Pencil } from "lucide-react";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { usePortfolioV3Preview } from "@/components/dev/PortfolioV3PreviewContext";
import { ServiceLabelEditor } from "@/components/dev/ServiceLabelEditor";
import { PortfolioGalleryModal } from "@/components/sections/PortfolioGalleryModal";
import { Button } from "@/components/ui/Button";
import {
  defaultPortfolioV3PreviewSettings,
  defaultPortfolioV3SectionDescription,
  defaultPortfolioV3SectionHeading,
  getPortfolioV3CssVariables,
  getPortfolioV3IntroButtonSettings,
  getPortfolioV3IntroButtonStyle,
  getPortfolioV3LayoutWidthClassName,
  getPortfolioV3SectionDescriptionColor,
  resolvePortfolioV3CardModalImages,
  resolvePortfolioV3CardModalTitle,
  resolvePortfolioV3PhoneHref,
  resolvePortfolioV3PhoneLabel,
  type PortfolioV3Card,
  type PortfolioV3PreviewSettings,
} from "@/lib/portfolio-v3-preview";
import { defaultPortfolioV2SampleImage } from "@/lib/portfolio-v2-preview";
import {
  portfolioV3HasGalleryTabs,
  resolvePortfolioV3WallCards,
} from "@/lib/portfolio-v3-gallery-tabs";
import {
  devEditButtonClassName,
  devEditIconSize,
  devLibraryIconSize,
  devLibraryLabelClassName,
  devLibraryPillClassName,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

function PortfolioV3Intro({
  heading,
  description,
  descriptionColor,
  settings,
  editingEnabled,
  onHeadingChange,
  onDescriptionChange,
  onPhoneLabelChange,
}: {
  heading: string;
  description: string;
  descriptionColor: string;
  settings: PortfolioV3PreviewSettings;
  editingEnabled: boolean;
  onHeadingChange?: (heading: string) => void;
  onDescriptionChange?: (description: string) => void;
  onPhoneLabelChange?: (label: string) => void;
}) {
  const [headingEditorOpen, setHeadingEditorOpen] = useState(false);
  const [descriptionEditorOpen, setDescriptionEditorOpen] = useState(false);
  const [phoneEditorOpen, setPhoneEditorOpen] = useState(false);
  const phoneLabel = resolvePortfolioV3PhoneLabel(settings);
  const phoneHref = resolvePortfolioV3PhoneHref(settings, phoneLabel);
  const showPhoneBar = settings.phoneBarVisible;
  const introButtonSettings = getPortfolioV3IntroButtonSettings(settings);
  const introButtonStyle = getPortfolioV3IntroButtonStyle(settings);

  return (
    <div
      className={cn(
        "portfolio-v3-intro",
        editingEnabled && "portfolio-v3-intro--editable",
      )}
    >
      <header className="portfolio-v3-intro-heading-wrap relative">
        <h2 id="portfolio-v3-heading" className="portfolio-v3-heading">
          {heading}
        </h2>
        {editingEnabled && onHeadingChange && (
          <>
            <button
              type="button"
              onClick={() => setHeadingEditorOpen((open) => !open)}
              className={cn(devEditButtonClassName, "-right-8 top-0")}
              aria-label="Edit gallery title"
              aria-expanded={headingEditorOpen}
            >
              <Pencil size={devEditIconSize} strokeWidth={2} />
            </button>
            {headingEditorOpen && (
              <ServiceLabelEditor
                value={heading}
                onChange={onHeadingChange}
                onClose={() => setHeadingEditorOpen(false)}
                presentation="modal"
                dialogTitle="Edit title"
                dialogAriaLabel="Edit gallery title"
                inputAriaLabel="Gallery title"
              />
            )}
          </>
        )}
      </header>

      <div className="portfolio-v3-intro-description-wrap relative">
        <p
          id="portfolio-v3-description"
          className="portfolio-v3-description"
          style={{ color: descriptionColor }}
        >
          {description}
        </p>
        {editingEnabled && onDescriptionChange && (
          <>
            <button
              type="button"
              onClick={() => setDescriptionEditorOpen((open) => !open)}
              className={cn(devEditButtonClassName, "-right-8 top-0")}
              aria-label="Edit gallery intro"
              aria-expanded={descriptionEditorOpen}
            >
              <Pencil size={devEditIconSize} strokeWidth={2} />
            </button>
            {descriptionEditorOpen && (
              <ServiceLabelEditor
                value={description}
                onChange={onDescriptionChange}
                onClose={() => setDescriptionEditorOpen(false)}
                presentation="modal"
                dialogTitle="Edit intro"
                dialogAriaLabel="Edit gallery intro"
                inputAriaLabel="Gallery intro text"
                multiline
                rows={6}
              />
            )}
          </>
        )}
      </div>

      {showPhoneBar && (
        <div className="portfolio-v3-intro-button-wrap relative mt-6">
          {phoneLabel || editingEnabled ? (
            phoneLabel ? (
              <a
                href={phoneHref}
                className="portfolio-v3-intro-button-link inline-flex max-w-full no-underline"
              >
                <Button
                  size="lg"
                  className="hero-v4-cta-btn preview-button--custom shadow-lg"
                  style={introButtonStyle}
                  data-button-size={introButtonSettings.navButtonSize}
                >
                  {phoneLabel}
                </Button>
              </a>
            ) : (
              <p className="m-0 text-sm text-muted/80">
                Add button label (pencil or Forge → Label)
              </p>
            )
          ) : null}
          {editingEnabled && onPhoneLabelChange && (
            <>
              <button
                type="button"
                onClick={() => setPhoneEditorOpen((open) => !open)}
                className={cn(devEditButtonClassName, "-right-8 top-2")}
                aria-label="Edit intro button label"
                aria-expanded={phoneEditorOpen}
              >
                <Pencil size={devEditIconSize} strokeWidth={2} />
              </button>
              {phoneEditorOpen && (
                <ServiceLabelEditor
                  value={phoneLabel}
                  onChange={onPhoneLabelChange}
                  onClose={() => setPhoneEditorOpen(false)}
                  presentation="modal"
                  dialogTitle="Edit button label"
                  dialogAriaLabel="Edit intro button label"
                  inputAriaLabel="Button label (include phone number if desired)"
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PortfolioV3CardButton({
  card,
  wallStyle,
  captionsVisible,
  editingEnabled,
  onOpen,
  onImageSelect,
  onAltChange,
  onCaptionChange,
  onTitleChange,
}: {
  card: PortfolioV3Card;
  wallStyle: "cube" | "masonry";
  captionsVisible: boolean;
  editingEnabled: boolean;
  onOpen: () => void;
  onImageSelect?: (src: string, alt: string) => void;
  onAltChange?: (alt: string) => void;
  onCaptionChange?: (caption: string) => void;
  onTitleChange?: (title: string) => void;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [altEditorOpen, setAltEditorOpen] = useState(false);
  const [captionEditorOpen, setCaptionEditorOpen] = useState(false);
  const [titleEditorOpen, setTitleEditorOpen] = useState(false);
  const src = card.imageSrc.trim() || defaultPortfolioV2SampleImage;
  const captionText = card.caption?.trim() ?? "";
  const showCaption = captionsVisible && (captionText || editingEnabled);

  return (
    <div className="portfolio-v3-card-wrap relative">
      <button
        type="button"
        className={cn(
          "portfolio-v3-card",
          wallStyle === "cube" && "portfolio-v3-card--cube",
        )}
        onClick={onOpen}
        aria-label={resolvePortfolioV3CardModalTitle(card)}
      >
        <Image
          src={src}
          alt={card.imageAlt || "Gallery photo"}
          width={800}
          height={wallStyle === "cube" ? 800 : 1000}
          className={cn(
            "portfolio-v3-card-image",
            wallStyle === "cube" && "portfolio-v3-card-image--cube",
          )}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </button>
      {editingEnabled && onImageSelect && (
        <>
          <div className="absolute top-2 right-2 z-30 flex flex-wrap items-center justify-end gap-1.5">
            {onTitleChange && (
              <button
                type="button"
                onClick={() => setTitleEditorOpen((open) => !open)}
                className={devLibraryPillClassName}
                aria-label="Edit image heading"
                aria-expanded={titleEditorOpen}
              >
                <span className={devLibraryLabelClassName}>Heading</span>
              </button>
            )}
            {onAltChange && (
              <button
                type="button"
                onClick={() => setAltEditorOpen((open) => !open)}
                className={devLibraryPillClassName}
                aria-label="Edit image alt text"
                aria-expanded={altEditorOpen}
              >
                <span className={devLibraryLabelClassName}>Alt</span>
              </button>
            )}
            {onCaptionChange && (
              <button
                type="button"
                onClick={() => setCaptionEditorOpen((open) => !open)}
                className={devLibraryPillClassName}
                aria-label="Edit image caption"
                aria-expanded={captionEditorOpen}
              >
                <span className={devLibraryLabelClassName}>Caption</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              className={devLibraryPillClassName}
              aria-label="Choose library image"
            >
              <Images size={devLibraryIconSize} strokeWidth={2} />
              <span className={devLibraryLabelClassName}>Image</span>
            </button>
          </div>
          {libraryOpen && (
            <div className="absolute top-full right-0 z-40 mt-2">
              <ImageLibraryPicker
                value={src}
                defaultAlt={card.imageAlt}
                promptAlt
                onSelect={(entry) => {
                  onImageSelect(entry.src, entry.alt);
                  setLibraryOpen(false);
                }}
                onClose={() => setLibraryOpen(false)}
              />
            </div>
          )}
          {titleEditorOpen && onTitleChange && (
            <ServiceLabelEditor
              value={card.title ?? ""}
              onChange={onTitleChange}
              onClose={() => setTitleEditorOpen(false)}
              presentation="inline"
              dialogTitle="Heading"
              dialogAriaLabel="Edit image heading"
              inputAriaLabel="Image heading (lightbox title)"
            />
          )}
          {altEditorOpen && onAltChange && (
            <ServiceLabelEditor
              value={card.imageAlt}
              onChange={onAltChange}
              onClose={() => setAltEditorOpen(false)}
              presentation="inline"
              dialogTitle="Alt text"
              dialogAriaLabel="Edit image alt text"
              inputAriaLabel="Image alt text"
            />
          )}
          {captionEditorOpen && onCaptionChange && (
            <ServiceLabelEditor
              value={card.caption ?? ""}
              onChange={onCaptionChange}
              onClose={() => setCaptionEditorOpen(false)}
              presentation="inline"
              dialogTitle="Caption"
              dialogAriaLabel="Edit image caption"
              inputAriaLabel="Image caption"
              multiline
              rows={3}
            />
          )}
        </>
      )}
      {showCaption && (
        <p className="portfolio-v3-card-caption">
          {captionText || (editingEnabled ? "Add caption (Caption pill)" : "")}
        </p>
      )}
    </div>
  );
}

/** Masonry / cube photo wall with optional intro column and modal lightbox. */
export function PortfolioV3({ className }: { className?: string }) {
  const preview = usePortfolioV3Preview();
  const settings = preview?.settings ?? defaultPortfolioV3PreviewSettings;
  const theme = settings.theme;
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [activeGalleryTabId, setActiveGalleryTabId] = useState<string | null>(null);
  const contentEditingEnabled = preview?.contentEditingEnabled ?? false;
  const hasGalleryTabs = portfolioV3HasGalleryTabs(settings);
  const galleryTabs = hasGalleryTabs ? settings.galleryTabs! : [];

  useEffect(() => {
    if (!hasGalleryTabs) {
      setActiveGalleryTabId(null);
      return;
    }
    setActiveGalleryTabId((current) => {
      if (current && galleryTabs.some((tab) => tab.id === current)) return current;
      return galleryTabs[0]?.id ?? null;
    });
  }, [galleryTabs, hasGalleryTabs]);

  const wallCards = useMemo(
    () => resolvePortfolioV3WallCards(settings, activeGalleryTabId),
    [activeGalleryTabId, settings],
  );

  const sectionHeading =
    preview?.getSectionHeading(defaultPortfolioV3SectionHeading) ??
    settings.sectionHeading ??
    defaultPortfolioV3SectionHeading;
  const sectionDescription =
    preview?.getSectionDescription(defaultPortfolioV3SectionDescription) ??
    settings.sectionDescription ??
    defaultPortfolioV3SectionDescription;
  const descriptionColor = getPortfolioV3SectionDescriptionColor(settings);

  const activeCard = useMemo(
    () => wallCards.find((card) => card.id === activeCardId) ?? null,
    [activeCardId, wallCards],
  );

  const showIntro =
    sectionHeading.trim().length > 0 ||
    sectionDescription.trim().length > 0 ||
    settings.phoneBarVisible;
  const useSplit =
    (sectionHeading.trim().length > 0 || sectionDescription.trim().length > 0) &&
    settings.copyOnLeft;

  const sectionStyle: CSSProperties = {
    ...getPortfolioV3CssVariables(settings),
    paddingTop: settings.sectionPaddingTopPx,
    paddingBottom: settings.sectionPaddingBottomPx,
  };

  return (
    <section
      id="portfolio"
      className={cn(
        "portfolio-v3 scroll-mt-24",
        settings.wallStyle === "cube" && "portfolio-v3--cube",
        settings.wallStyle === "masonry" && "portfolio-v3--masonry",
        useSplit && "portfolio-v3--split",
        className,
      )}
      style={sectionStyle}
      data-portfolio-theme={theme}
      aria-labelledby="portfolio-v3-heading"
    >
      <div className={getPortfolioV3LayoutWidthClassName(settings.layoutWidth)}>
        <div
          className={cn(
            "portfolio-v3-inner",
            settings.layoutWidth === "contained" && "mx-auto px-4 lg:px-8",
            useSplit && "portfolio-v3-inner--split",
          )}
        >
          {showIntro && (
            <PortfolioV3Intro
              heading={sectionHeading}
              description={sectionDescription}
              descriptionColor={descriptionColor}
              settings={settings}
              editingEnabled={contentEditingEnabled}
              onHeadingChange={
                contentEditingEnabled
                  ? (heading) => preview?.setSectionHeading(heading)
                  : undefined
              }
              onDescriptionChange={
                contentEditingEnabled
                  ? (description) => preview?.setSectionDescription(description)
                  : undefined
              }
              onPhoneLabelChange={
                contentEditingEnabled
                  ? (label) => preview?.setContentPhone(label)
                  : undefined
              }
            />
          )}

          <div className="portfolio-v3-wall">
            {hasGalleryTabs && (
              <div className="portfolio-v3-gallery-tabs" role="tablist" aria-label="Gallery categories">
                {galleryTabs.map((tab) => {
                  const selected = tab.id === activeGalleryTabId;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      id={`portfolio-v3-tab-${tab.id}`}
                      aria-selected={selected}
                      aria-controls={`portfolio-v3-tabpanel-${tab.id}`}
                      className={cn(
                        "portfolio-v3-gallery-tab",
                        selected && "portfolio-v3-gallery-tab--active",
                      )}
                      onClick={() => {
                        setActiveGalleryTabId(tab.id);
                        setActiveCardId(null);
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div
              id={
                activeGalleryTabId
                  ? `portfolio-v3-tabpanel-${activeGalleryTabId}`
                  : undefined
              }
              role={hasGalleryTabs ? "tabpanel" : undefined}
              aria-labelledby={
                activeGalleryTabId ? `portfolio-v3-tab-${activeGalleryTabId}` : undefined
              }
              className="portfolio-v3-grid"
              style={
                settings.wallStyle === "cube"
                  ? {
                      gridTemplateColumns: `repeat(${Math.max(1, Math.min(6, settings.columnCount))}, minmax(0, 1fr))`,
                    }
                  : {
                      columnCount: Math.max(1, Math.min(6, settings.columnCount)),
                    }
              }
            >
              {wallCards.map((card) => (
                <PortfolioV3CardButton
                  key={card.id}
                  card={card}
                  wallStyle={settings.wallStyle}
                  captionsVisible={settings.captionsVisible}
                  editingEnabled={contentEditingEnabled}
                  onOpen={() => setActiveCardId(card.id)}
                  onImageSelect={
                    contentEditingEnabled
                      ? (src, alt) =>
                          preview?.updateCard(
                            card.id,
                            { imageSrc: src, imageAlt: alt },
                            activeGalleryTabId ?? undefined,
                          )
                      : undefined
                  }
                  onAltChange={
                    contentEditingEnabled
                      ? (alt) =>
                          preview?.updateCard(
                            card.id,
                            { imageAlt: alt },
                            activeGalleryTabId ?? undefined,
                          )
                      : undefined
                  }
                  onCaptionChange={
                    contentEditingEnabled
                      ? (caption) =>
                          preview?.updateCard(
                            card.id,
                            { caption },
                            activeGalleryTabId ?? undefined,
                          )
                      : undefined
                  }
                  onTitleChange={
                    contentEditingEnabled
                      ? (title) =>
                          preview?.updateCard(
                            card.id,
                            { title },
                            activeGalleryTabId ?? undefined,
                          )
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {activeCard && (
        <PortfolioGalleryModal
          title={resolvePortfolioV3CardModalTitle(activeCard)}
          images={resolvePortfolioV3CardModalImages(activeCard)}
          caption={activeCard.caption}
          theme={theme}
          onClose={() => setActiveCardId(null)}
        />
      )}
    </section>
  );
}
