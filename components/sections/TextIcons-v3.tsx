"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Pencil, Shuffle } from "lucide-react";
import { useTextIconsV3Preview } from "@/components/dev/TextIconsV3PreviewContext";
import { LucideIconPicker } from "@/components/dev/LucideIconPicker";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import { IconFrame } from "@/components/icons/IconFrame";
import { getTextIconsV3ItemGrid } from "@/lib/text-icons-v3-items";
import {
  defaultTextIconsV3PreviewSettings,
  getTextIconsV3InnerBackgroundStyle,
  getTextIconsV3CssVariables,
  getTextIconsV3SectionId,
  getTextIconsV3ShellClassName,
  resolveTextIconsV3Items,
  type TextIconsV3Item,
} from "@/lib/text-icons-v3-preview";
import { defaultSiteIconName, resolveSiteIconName, type SiteIconName } from "@/lib/site-icons";
import { devEditButtonClassName, devEditIconSize } from "@/lib/dev-overlay-controls";
import { resolveLayoutWidthMobile, siteContainedPaddingClass } from "@/lib/site-layout";
import { cn } from "@/lib/utils";

export type { TextIconsV3Item };

type TextIconsV3Props = {
  heading: string;
  subheading: string;
  items: readonly TextIconsV3Item[];
  className?: string;
};

const innerContentPaddingClass = siteContainedPaddingClass;

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
    <div className={cn("relative max-w-full", editingEnabled && "pr-8", className)}>
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

function TextIconsV3Icon({
  itemId,
  itemTitle,
  fallbackIcon,
  iconEditingEnabled,
  onIconChange,
}: {
  itemId: string;
  itemTitle: string;
  fallbackIcon: SiteIconName;
  iconEditingEnabled: boolean;
  onIconChange?: (iconName: SiteIconName) => void;
}) {
  const preview = useTextIconsV3Preview();
  const settings = preview?.settings ?? defaultTextIconsV3PreviewSettings;
  const iconName = preview?.getItemIcon(itemId, fallbackIcon) ?? fallbackIcon;
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  return (
    <div className="relative shrink-0">
      <IconFrame
        iconName={iconName}
        shape={settings.iconFrameShape}
        size={settings.iconFrameSize}
        iconColor={settings.iconColor}
        borderColor={settings.iconBorderColor}
        backgroundColor={settings.iconBackgroundColor}
        context="text-icons-v3"
        className="text-icons-v3-icon"
      />
      {iconEditingEnabled && onIconChange && (
        <>
          <button
            type="button"
            onClick={() => setIconPickerOpen((open) => !open)}
            className={devEditButtonClassName}
            aria-label={`Change icon for ${itemTitle}`}
            aria-expanded={iconPickerOpen}
          >
            <Shuffle size={devEditIconSize} strokeWidth={2} />
          </button>
          {iconPickerOpen && (
            <div className="absolute top-8 left-1/2 z-30 -translate-x-1/2">
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
  );
}

/** Four-column icon + text grid — Spartan "Why Choose Us" content block. */
export function TextIconsV3({ heading, subheading, items, className }: TextIconsV3Props) {
  const preview = useTextIconsV3Preview();
  const settings = preview?.settings ?? defaultTextIconsV3PreviewSettings;
  const editingEnabled = preview?.contentEditingEnabled ?? false;

  const layoutWidth = settings.layoutWidth;
  const layoutWidthMobile = settings.layoutWidthMobile;
  const mobile = resolveLayoutWidthMobile(layoutWidth, layoutWidthMobile);
  const isDesktopContained = layoutWidth === "contained";
  const mobileFullDesktopContained = mobile === "full" && isDesktopContained;

  const displayHeading = preview?.getHeading(heading) ?? heading;
  const displaySubheading = preview?.getSubheading(subheading) ?? subheading;
  const displayItems = resolveTextIconsV3Items(settings, items);
  const itemGrid = getTextIconsV3ItemGrid(displayItems.length);
  const sectionId = getTextIconsV3SectionId(settings);

  const innerBackgroundStyle = getTextIconsV3InnerBackgroundStyle(settings);
  const textStyle = getTextIconsV3CssVariables(settings) as CSSProperties;

  const content = (
    <>
      <div className="mx-auto max-w-4xl text-center">
        <EditableTextBlock
          editingEnabled={editingEnabled}
          ariaLabel="Edit section title"
          editorTitle="Edit title"
          value={displayHeading}
          className="mx-auto inline-block max-w-full"
          onSave={preview ? (value) => preview.setHeading(value) : undefined}
        >
          {(displayHeading || editingEnabled) && (
            <h2 className="text-icons-v3-heading font-serif text-3xl font-semibold tracking-wide sm:text-4xl">
              {displayHeading}
            </h2>
          )}
        </EditableTextBlock>
        <EditableTextBlock
          editingEnabled={editingEnabled}
          ariaLabel="Edit section tagline"
          editorTitle="Edit tagline"
          value={displaySubheading}
          multiline
          rows={4}
          className="mx-auto mt-4 inline-block max-w-full"
          onSave={preview ? (value) => preview.setSubheading(value) : undefined}
        >
          {(displaySubheading || editingEnabled) && (
            <p className="text-icons-v3-subheading text-sm leading-relaxed sm:text-base">
              {displaySubheading}
            </p>
          )}
        </EditableTextBlock>
      </div>

      <div
        className={cn(
          "text-icons-v3-grid mt-12 grid gap-10 sm:grid-cols-2 lg:mt-16",
          !itemGrid.compact && "lg:gap-8",
        )}
        data-compact={itemGrid.compact ? "true" : undefined}
        style={
          {
            "--text-icons-v3-cols": String(itemGrid.columns),
            "--text-icons-v3-cols-lg": String(itemGrid.columnsLg),
          } as CSSProperties
        }
      >
        {displayItems.map((item) => {
          const fallbackIcon = resolveSiteIconName(item.icon, defaultSiteIconName);
          const displayTitle = preview?.getItemTitle(item.id, item.title) ?? item.title;
          const displayDescription =
            preview?.getItemDescription(item.id, item.description) ?? item.description;

          return (
            <article
              key={item.id}
              className="text-icons-v3-item flex flex-col items-center text-center"
            >
              <TextIconsV3Icon
                itemId={item.id}
                itemTitle={displayTitle}
                fallbackIcon={fallbackIcon}
                iconEditingEnabled={editingEnabled}
                onIconChange={
                  preview ? (nextIcon) => preview.setItemIcon(item.id, nextIcon) : undefined
                }
              />
              <EditableTextBlock
                editingEnabled={editingEnabled}
                ariaLabel={`Edit ${displayTitle} title`}
                editorTitle="Edit item title"
                value={displayTitle}
                className="mt-5 w-full max-w-full"
                onSave={preview ? (value) => preview.setItemTitle(item.id, value) : undefined}
              >
                {(displayTitle || editingEnabled) && (
                  <h3 className="text-lg font-semibold leading-snug text-white">{displayTitle}</h3>
                )}
              </EditableTextBlock>
              <EditableTextBlock
                editingEnabled={editingEnabled}
                ariaLabel={`Edit ${displayTitle} description`}
                editorTitle="Edit item description"
                value={displayDescription}
                multiline
                rows={4}
                className="mt-3 w-full max-w-full"
                onSave={
                  preview ? (value) => preview.setItemDescription(item.id, value) : undefined
                }
              >
                {(displayDescription || editingEnabled) && (
                  <p className="text-sm leading-relaxed text-white/70">{displayDescription}</p>
                )}
              </EditableTextBlock>
            </article>
          );
        })}
      </div>
    </>
  );

  const innerPanelClassName = cn("py-16 lg:py-20", innerContentPaddingClass);

  if (!isDesktopContained) {
    const sectionStyle: CSSProperties = {
      ...innerBackgroundStyle,
      ...textStyle,
    };

    return (
      <section
        id={sectionId}
        className={cn("text-icons-v3", className)}
        style={sectionStyle}
      >
        <div
          className={cn(
            getTextIconsV3ShellClassName(layoutWidth, layoutWidthMobile),
            innerPanelClassName,
          )}
        >
          {content}
        </div>
      </section>
    );
  }

  const sectionStyle: CSSProperties = mobileFullDesktopContained
    ? {
        ...innerBackgroundStyle,
        ...textStyle,
        ["--text-icons-v3-outer-bg" as string]: settings.outerBackgroundColor,
      }
    : {
        backgroundColor: settings.outerBackgroundColor,
        ...textStyle,
      };

  return (
    <section
      id={sectionId}
      className={cn(
        "text-icons-v3",
        mobileFullDesktopContained && "lg:!bg-[var(--text-icons-v3-outer-bg)]",
        className,
      )}
      style={sectionStyle}
    >
      <div className={getTextIconsV3ShellClassName(layoutWidth, layoutWidthMobile)}>
        <div className={innerPanelClassName} style={innerBackgroundStyle}>
          {content}
        </div>
      </div>
    </section>
  );
}
