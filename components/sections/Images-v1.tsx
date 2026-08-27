"use client";

import { useId, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Images } from "lucide-react";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { useImagesV1Preview } from "@/components/dev/ImagesV1PreviewContext";
import { JsonLd } from "@/components/seo/JsonLd";
import { Container } from "@/components/ui/Container";
import {
  defaultImagesV1PreviewSettings,
  getImagesV1CardBorderStyle,
  getImagesV1CssVariables,
  getImagesV1EffectiveCardHeightPx,
  getImagesV1InnerBackgroundStyle,
  type ImagesV1Card,
  type ImagesV1CardWidthMode,
} from "@/lib/images-v1-preview";
import {
  getImagesV1CardLinkTitle,
  getImagesV1CardSeoName,
  resolveImagesV1CardLink,
} from "@/lib/images-v1-cards";
import {
  devLibraryIconSize,
  devLibraryLabelClassName,
  devLibraryPillClassName,
} from "@/lib/dev-overlay-controls";
import { getSiteLayoutWidthClassName } from "@/lib/site-layout";
import { buildImagesV1ItemListSchema } from "@/lib/seo-schema";
import { cn } from "@/lib/utils";

export type ImagesV1Props = {
  heading: string;
  seoDescription: string;
  cards: readonly ImagesV1Card[];
  className?: string;
};

function ImagesV1CardImage({
  card,
  isUniformWidth,
  linkEnabled,
}: {
  card: ImagesV1Card;
  isUniformWidth: boolean;
  linkEnabled: boolean;
}) {
  const link = linkEnabled ? resolveImagesV1CardLink(card) : null;
  const imageClassName = cn(
    "block w-auto object-contain",
    isUniformWidth ? "max-h-full max-w-full" : "h-full max-h-full",
    link && "transition-opacity hover:opacity-85",
  );
  const imageProps = {
    src: card.imageSrc,
    alt: card.imageAlt,
    loading: "lazy" as const,
    decoding: "async" as const,
    className: imageClassName,
  };

  if (link) {
    const linkTitle = getImagesV1CardLinkTitle(card, link.target);
    return (
      <a
        href={link.href}
        target={link.target}
        rel={link.rel}
        title={linkTitle}
        className="inline-flex h-full items-center justify-center no-underline"
        {...(card.imageAlt.trim()
          ? undefined
          : { "aria-label": linkTitle })}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img {...imageProps} />
      </a>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...imageProps} />
  );
}

function ImagesV1CardBlock({
  card,
  editingEnabled,
  borderStyle,
  cardWidthMode,
  cardUniformWidthPx,
  cardHeightPx,
  linkEnabled,
  onImageSelect,
}: {
  card: ImagesV1Card;
  editingEnabled: boolean;
  borderStyle?: CSSProperties;
  cardWidthMode: ImagesV1CardWidthMode;
  cardUniformWidthPx: number;
  cardHeightPx: number;
  linkEnabled: boolean;
  onImageSelect?: (src: string, alt: string) => void;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const hasImage = Boolean(card.imageSrc.trim());
  const isUniformWidth = cardWidthMode === "uniform";
  const link = linkEnabled ? resolveImagesV1CardLink(card) : null;
  const seoName = getImagesV1CardSeoName(card);

  const cardStyle: CSSProperties = {
    ...borderStyle,
    ...(isUniformWidth ? { width: cardUniformWidthPx, flexBasis: cardUniformWidthPx } : undefined),
  };

  return (
    <li
      className={cn(
        "images-v1-card shrink-0",
        isUniformWidth ? "images-v1-card--uniform" : "images-v1-card--natural",
      )}
      style={cardStyle}
    >
      <figure
        className="relative m-0 flex items-center justify-center"
        style={{ height: cardHeightPx }}
      >
        {hasImage ? (
          <>
            <ImagesV1CardImage
              card={card}
              isUniformWidth={isUniformWidth}
              linkEnabled={linkEnabled}
            />
            {!link && (
              <figcaption className="sr-only">{seoName}</figcaption>
            )}
          </>
        ) : (
          <div className="flex h-full min-w-[12rem] items-center justify-center bg-neutral-100 px-8 text-sm text-neutral-400">
            No image
          </div>
        )}
        {editingEnabled && onImageSelect && (
          <>
            <button
              type="button"
              onClick={() => setLibraryOpen((open) => !open)}
              className={cn(devLibraryPillClassName, "absolute top-2 right-2 z-10")}
              aria-label="Choose image from library"
              aria-expanded={libraryOpen}
            >
              <Images size={devLibraryIconSize} strokeWidth={2} />
              <span className={devLibraryLabelClassName}>Library</span>
            </button>
            {libraryOpen && (
              <ImageLibraryPicker
                value={card.imageSrc}
                onSelect={(entry) => {
                  onImageSelect(entry.src, entry.alt);
                  setLibraryOpen(false);
                }}
                onClose={() => setLibraryOpen(false)}
              />
            )}
          </>
        )}
      </figure>
    </li>
  );
}

/** Horizontal image gallery row — white background by default, optional gradient or library image. */
export function ImagesV1({ heading, seoDescription, cards, className }: ImagesV1Props) {
  const preview = useImagesV1Preview();
  const settings = preview?.settings ?? defaultImagesV1PreviewSettings;
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const sectionHeadingId = useId();

  const defaultCards = useMemo(() => [...cards], [cards]);
  const resolvedCards = preview?.getCards(defaultCards) ?? defaultCards;
  const sectionHeading = preview?.getSectionHeading(heading) ?? heading;
  const sectionSeoDescription =
    preview?.getSectionSeoDescription(seoDescription) ?? seoDescription;

  const schemaItems = useMemo(
    () =>
      resolvedCards
        .filter((card) => card.imageSrc.trim())
        .map((card) => ({
          name: getImagesV1CardSeoName(card),
          imageSrc: card.imageSrc,
          linkHref: card.linkHref,
        })),
    [resolvedCards],
  );

  const structuredData = useMemo(
    () =>
      buildImagesV1ItemListSchema(
        sectionHeading,
        sectionSeoDescription,
        schemaItems,
      ),
    [schemaItems, sectionHeading, sectionSeoDescription],
  );

  const cardBorderStyle = getImagesV1CardBorderStyle(settings);
  const usesFixedSectionHeight = settings.sectionHeightPx > 0;
  const cardHeightPx = getImagesV1EffectiveCardHeightPx(settings);

  const innerStyle: CSSProperties = {
    ...getImagesV1InnerBackgroundStyle(settings),
    ...getImagesV1CssVariables(settings),
    boxSizing: "border-box",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: settings.sectionPaddingTopPx,
    paddingBottom: settings.sectionPaddingBottomPx,
    ...(usesFixedSectionHeight
      ? {
          height: settings.sectionHeightPx,
          minHeight: settings.sectionHeightPx,
          maxHeight: settings.sectionHeightPx,
        }
      : undefined),
  };

  const outerStyle: CSSProperties | undefined =
    settings.layoutWidth === "contained"
      ? { backgroundColor: settings.outerBackgroundColor }
      : undefined;

  const track = (
    <ul
      className="images-v1-track m-0 flex w-full max-w-full list-none flex-nowrap items-center justify-center overflow-x-auto overflow-y-visible p-0 px-4"
      aria-label={`${sectionHeading} list`}
    >
      {resolvedCards.map((card) => (
        <ImagesV1CardBlock
          key={card.id}
          card={card}
          editingEnabled={editingEnabled}
          borderStyle={cardBorderStyle}
          cardWidthMode={settings.cardWidthMode}
          cardUniformWidthPx={settings.cardUniformWidthPx}
          cardHeightPx={cardHeightPx}
          linkEnabled={!editingEnabled}
          onImageSelect={
            preview
              ? (src, alt) => preview.updateCard(card.id, { imageSrc: src, imageAlt: alt })
              : undefined
          }
        />
      ))}
    </ul>
  );

  return (
    <section
      className={cn("images-v1", className)}
      style={outerStyle}
      aria-labelledby={sectionHeadingId}
    >
      {schemaItems.length > 0 && <JsonLd data={structuredData} />}
      <h2 id={sectionHeadingId} className="sr-only">
        {sectionHeading}
      </h2>
      {sectionSeoDescription && (
        <p className="sr-only">{sectionSeoDescription}</p>
      )}
      {settings.topBorderEnabled && settings.topBorderHeightPx > 0 && (
        <div
          className="w-full shrink-0"
          style={{
            height: settings.topBorderHeightPx,
            backgroundColor: settings.topBorderColor,
          }}
          aria-hidden
        />
      )}
      <div
        className={cn(
          "images-v1-inner flex w-full items-center justify-center",
          usesFixedSectionHeight && "images-v1-inner--fixed-height",
          getSiteLayoutWidthClassName(settings.layoutWidth),
        )}
        style={innerStyle}
      >
        {settings.layoutWidth === "contained" ? (
          <Container className="flex w-full items-center justify-center">{track}</Container>
        ) : (
          track
        )}
      </div>
      {settings.bottomBorderEnabled && settings.bottomBorderHeightPx > 0 && (
        <div
          className="w-full shrink-0"
          style={{
            height: settings.bottomBorderHeightPx,
            backgroundColor: settings.bottomBorderColor,
          }}
          aria-hidden
        />
      )}
    </section>
  );
}
