"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Pencil, X } from "lucide-react";
import { ServiceLabelEditor } from "@/components/dev/ServiceLabelEditor";
import { useCreativeThemeOptional } from "@/components/dev/CreativeProvider";
import { usePortfolioV2Preview } from "@/components/dev/PortfolioV2PreviewContext";
import { defaultFontThemeId, getFontTheme } from "@/lib/creative-themes";
import {
  defaultPortfolioV2PreviewSettings,
  defaultPortfolioV2SampleImage,
  defaultPortfolioV2SectionDescription,
  defaultPortfolioV2SectionHeading,
  getPortfolioV2CssVariables,
  getPortfolioV2LayoutWidthClassName,
  portfolioV2UsesAngledList,
  portfolioV2UsesAngledSlices,
  splitPortfolioV2TabsForListColumns,
  type PortfolioSectionTheme,
  type PortfolioV2Tab,
} from "@/lib/portfolio-v2-preview";
import { devEditButtonClassName, devEditIconSize } from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

function PortfolioV2Modal({
  tab,
  theme,
  onClose,
}: {
  tab: PortfolioV2Tab;
  theme: PortfolioSectionTheme;
  onClose: () => void;
}) {
  const images = tab.modalImages.map((image) => ({
    ...image,
    imageSrc: image.imageSrc.trim() || defaultPortfolioV2SampleImage,
  }));
  const creative = useCreativeThemeOptional();
  const fontTheme = getFontTheme(creative?.fontThemeId ?? defaultFontThemeId);
  const fontStyle = {
    "--font-sans": fontTheme.sans,
    "--font-serif": fontTheme.serif,
  } as CSSProperties;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const dialog = (
    <div
      className="portfolio-v2-modal fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
      style={fontStyle}
      role="presentation"
    >
      <button
        type="button"
        className="portfolio-v2-modal-backdrop absolute inset-0"
        aria-label="Close portfolio gallery"
        onClick={onClose}
      />
      <div
        className="portfolio-v2-modal-panel relative z-[121] w-full max-w-4xl rounded-xl p-5 shadow-2xl sm:p-6"
        data-portfolio-theme={theme}
        role="dialog"
        aria-modal="true"
        aria-label={`${tab.label} gallery`}
      >
        <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
          <h2 className="portfolio-v2-modal-title text-xl font-semibold tracking-wide uppercase sm:text-2xl">
            {tab.label}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="portfolio-v2-modal-close rounded-full p-1.5 transition-colors"
            aria-label="Close gallery"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {images.length > 0 ? (
          <div className="portfolio-v2-modal-body">
            <ul className="portfolio-v2-modal-grid m-0 list-none p-0">
              {images.map((image) => (
                <li key={image.id} className="portfolio-v2-modal-grid-item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.imageSrc}
                    alt={image.imageAlt || `${tab.label} photo`}
                    className="portfolio-v2-modal-image block h-auto w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="portfolio-v2-modal-empty text-sm">No gallery images yet.</p>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(dialog, document.body  );
}

function PortfolioV2Intro({
  heading,
  description,
  editingEnabled,
  onHeadingChange,
  onDescriptionChange,
}: {
  heading: string;
  description: string;
  editingEnabled: boolean;
  onHeadingChange?: (heading: string) => void;
  onDescriptionChange?: (description: string) => void;
}) {
  const [headingEditorOpen, setHeadingEditorOpen] = useState(false);
  const [descriptionEditorOpen, setDescriptionEditorOpen] = useState(false);

  return (
    <div
      className={cn(
        "portfolio-v2-intro",
        editingEnabled && "portfolio-v2-intro--editable",
      )}
    >
      <header className="portfolio-v2-intro-heading-wrap relative">
        <h2 id="portfolio-v2-heading" className="portfolio-v2-heading">
          {heading}
        </h2>
        {editingEnabled && onHeadingChange && (
          <>
            <button
              type="button"
              onClick={() => setHeadingEditorOpen((open) => !open)}
              className={cn(devEditButtonClassName, "-right-8 top-0")}
              aria-label="Edit portfolio title"
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
                dialogAriaLabel="Edit portfolio title"
                inputAriaLabel="Portfolio title"
              />
            )}
          </>
        )}
      </header>

      <div className="portfolio-v2-intro-description-wrap relative">
        <p id="portfolio-v2-description" className="portfolio-v2-description">
          {description}
        </p>
        {editingEnabled && onDescriptionChange && (
          <>
            <button
              type="button"
              onClick={() => setDescriptionEditorOpen((open) => !open)}
              className={cn(devEditButtonClassName, "-right-8 top-0")}
              aria-label="Edit portfolio intro"
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
                dialogAriaLabel="Edit portfolio intro"
                inputAriaLabel="Portfolio intro text"
                multiline
                rows={6}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function PortfolioV2Slice({
  tab,
  onOpen,
}: {
  tab: PortfolioV2Tab;
  onOpen: () => void;
}) {
  const backgroundSrc = tab.backgroundImageSrc.trim() || defaultPortfolioV2SampleImage;
  const backgroundStyle: CSSProperties = {
    backgroundImage: `url("${backgroundSrc}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <button
      type="button"
      className="portfolio-v2-slice"
      onClick={onOpen}
      aria-label={`Open ${tab.label} gallery`}
    >
      <span className="portfolio-v2-slice-body" style={backgroundStyle}>
        <span
          className="portfolio-v2-slice-overlay"
          style={{
            backgroundColor: tab.backgroundOverlayColor,
            opacity: tab.backgroundOverlayOpacity,
          }}
          aria-hidden
        />
        <span className="portfolio-v2-slice-hover-tint" aria-hidden />
      </span>
      <span className="portfolio-v2-slice-label" style={{ color: tab.labelColor }}>
        {tab.label}
      </span>
    </button>
  );
}

function PortfolioV2ListTab({
  tab,
  onOpen,
}: {
  tab: PortfolioV2Tab;
  onOpen: () => void;
}) {
  const backgroundSrc = tab.backgroundImageSrc.trim() || defaultPortfolioV2SampleImage;
  const backgroundStyle: CSSProperties = {
    backgroundImage: `url("${backgroundSrc}")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <button
      type="button"
      className="portfolio-v2-list-tab"
      onClick={onOpen}
      aria-label={`Open ${tab.label} gallery`}
    >
      <span className="portfolio-v2-list-tab-body" style={backgroundStyle}>
        <span
          className="portfolio-v2-list-tab-overlay"
          style={{
            backgroundColor: tab.backgroundOverlayColor,
            opacity: tab.backgroundOverlayOpacity,
          }}
          aria-hidden
        />
        <span className="portfolio-v2-list-tab-hover-tint" aria-hidden />
      </span>
      <span className="portfolio-v2-list-tab-label" style={{ color: tab.labelColor }}>
        {tab.label}
      </span>
    </button>
  );
}

function PortfolioV2ListColumns({
  tabs,
  onOpenTab,
}: {
  tabs: PortfolioV2Tab[];
  onOpenTab: (tabId: string) => void;
}) {
  const { firstColumn, secondColumn } = useMemo(
    () => splitPortfolioV2TabsForListColumns(tabs),
    [tabs],
  );

  const renderColumn = (columnTabs: PortfolioV2Tab[]) => (
    <ul className="portfolio-v2-list">
      {columnTabs.map((tab) => (
        <li key={tab.id} className="portfolio-v2-list-item">
          <PortfolioV2ListTab tab={tab} onOpen={() => onOpenTab(tab.id)} />
        </li>
      ))}
    </ul>
  );

  return (
    <div className="portfolio-v2-list-columns">
      {renderColumn(firstColumn)}
      {secondColumn.length > 0 ? renderColumn(secondColumn) : null}
    </div>
  );
}

/** Vertical portfolio slices — click a tab to open a modal image grid. */
export function PortfolioV2({ className }: { className?: string }) {
  const preview = usePortfolioV2Preview();
  const settings = preview?.settings ?? defaultPortfolioV2PreviewSettings;
  const theme = settings.theme;
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const contentEditingEnabled = preview?.contentEditingEnabled ?? false;
  const sectionHeading =
    preview?.getSectionHeading(defaultPortfolioV2SectionHeading) ??
    settings.sectionHeading ??
    defaultPortfolioV2SectionHeading;
  const sectionDescription =
    preview?.getSectionDescription(defaultPortfolioV2SectionDescription) ??
    settings.sectionDescription ??
    defaultPortfolioV2SectionDescription;

  const tabs = settings.tabs;
  const usesHorizontalList = settings.horizontalLayout;
  const usesFixedSectionHeight = settings.sectionHeightPx > 0 && !usesHorizontalList;
  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? null,
    [activeTabId, tabs],
  );

  const sectionStyle: CSSProperties = {
    ...getPortfolioV2CssVariables(settings),
    ...(usesFixedSectionHeight
      ? undefined
      : {
          paddingTop: settings.sectionPaddingTopPx,
          paddingBottom: settings.sectionPaddingBottomPx,
        }),
  };

  const innerStyle: CSSProperties | undefined = usesFixedSectionHeight
    ? {
        boxSizing: "border-box",
        height: settings.sectionHeightPx,
        minHeight: settings.sectionHeightPx,
        maxHeight: settings.sectionHeightPx,
        paddingTop: settings.sectionPaddingTopPx,
        paddingBottom: settings.sectionPaddingBottomPx,
      }
    : undefined;

  return (
    <section
      id="portfolio"
      className={cn(
        "portfolio-v2 scroll-mt-24",
        usesFixedSectionHeight && "portfolio-v2--fixed-height",
        usesHorizontalList && "portfolio-v2--horizontal-list",
        portfolioV2UsesAngledSlices(settings) && "portfolio-v2--angled-labels",
        portfolioV2UsesAngledList(settings) && "portfolio-v2--angled-list",
        className,
      )}
      style={sectionStyle}
      data-portfolio-theme={theme}
      aria-label={sectionHeading}
    >
      <div className={getPortfolioV2LayoutWidthClassName(settings.layoutWidth)}>
        <div
          className={cn(
            "portfolio-v2-inner",
            settings.layoutWidth === "contained" && "mx-auto px-4 lg:px-8",
            usesFixedSectionHeight && "portfolio-v2-inner--fixed-height",
          )}
          style={innerStyle}
        >
          <PortfolioV2Intro
            heading={sectionHeading}
            description={sectionDescription}
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
          />
          {usesHorizontalList ? (
            <PortfolioV2ListColumns tabs={tabs} onOpenTab={setActiveTabId} />
          ) : (
            <div className="portfolio-v2-track">
              {tabs.map((tab) => (
                <PortfolioV2Slice key={tab.id} tab={tab} onOpen={() => setActiveTabId(tab.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {activeTab && (
        <PortfolioV2Modal tab={activeTab} theme={theme} onClose={() => setActiveTabId(null)} />
      )}
    </section>
  );
}
