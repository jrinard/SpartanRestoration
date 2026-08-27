"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Images, Pencil } from "lucide-react";
import { ImageLibraryPicker } from "@/components/dev/ImageLibraryPicker";
import { ServiceLabelEditor } from "@/components/dev/ServiceLabelEditor";
import {
  defaultServiceAreaV1PreviewSettings,
  getServiceAreaV1CardStyle,
  getServiceAreaV1LayoutWidthClassName,
  getServiceAreaV1SectionStyle,
  getServiceAreaV1SizeOption,
  getServiceAreaV1PinStyle,
  resolveServiceAreaV1GraphSrc,
  type ServiceAreaV1Location,
  type ServiceAreaV1PreviewSettings,
} from "@/lib/service-area-preview";
import {
  devEditButtonClassName,
  devEditIconSize,
  devLibraryIconSize,
  devLibraryLabelClassName,
  devLibraryPillClassName,
} from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

const headingId = "service-area-v1-heading";

type ServiceAreaV1Props = {
  heading: string;
  locations: ServiceAreaV1Location[];
  settings?: ServiceAreaV1PreviewSettings;
  contentEditingEnabled?: boolean;
  getSectionHeading?: (fallback: string) => string;
  setSectionHeading?: (heading: string) => void;
  getLocationLabel?: (locationId: string, fallback: string) => string;
  setLocationLabel?: (locationId: string, label: string) => void;
  getGraphImageSrc?: () => string | null;
  setGraphImage?: (src: string) => void;
  clearGraphImage?: () => void;
  className?: string;
};

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
    <header className="relative inline-block max-w-full">
      <h2
        id={headingId}
        className="service-area-v1-heading text-4xl font-bold leading-tight sm:text-5xl lg:text-[3.25rem]"
        style={headingStyle}
      >
        {heading}
      </h2>
      {editingEnabled && onHeadingChange && (
        <>
          <button
            type="button"
            onClick={() => setEditorOpen((open) => !open)}
            className={cn(devEditButtonClassName, "-right-8")}
            aria-label="Edit section heading"
            aria-expanded={editorOpen}
          >
            <Pencil size={devEditIconSize} strokeWidth={2} />
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

function ServiceAreaGraph({
  src,
  editingEnabled,
  onSelectImage,
  onClearImage,
}: {
  src: string | null;
  editingEnabled: boolean;
  onSelectImage?: (src: string) => void;
  onClearImage?: () => void;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);

  if (!src && !editingEnabled) {
    return null;
  }

  return (
    <div className="relative inline-flex max-w-full">
      {src ? (
        <Image
          src={src}
          alt=""
          width={120}
          height={140}
          aria-hidden="true"
          className="service-area-v1-graph h-24 w-auto object-contain sm:h-28 lg:h-32"
        />
      ) : (
        <div
          className="flex h-24 w-24 items-center justify-center rounded border border-dashed border-white/35 font-mono text-[10px] tracking-wide text-white/50 uppercase sm:h-28 sm:w-28 lg:h-32 lg:w-32"
          aria-hidden="true"
        >
          No image
        </div>
      )}
      {editingEnabled && onSelectImage && (
        <>
          <div className="absolute -top-2 right-0 z-20 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setLibraryOpen((open) => !open)}
              className={devLibraryPillClassName}
              aria-label="Choose graph image from library"
              aria-expanded={libraryOpen}
            >
              <Images size={devLibraryIconSize} strokeWidth={2} />
              <span className={devLibraryLabelClassName}>Library</span>
            </button>
            {src && onClearImage && (
              <button
                type="button"
                onClick={onClearImage}
                className="rounded border border-accent-purple/40 bg-background/95 px-2 py-1 font-mono text-[10px] tracking-wide text-accent-purple uppercase shadow-sm transition-colors hover:border-accent-purple hover:bg-accent-purple/10"
                aria-label="Clear graph image"
              >
                Clear
              </button>
            )}
          </div>
          {libraryOpen && (
            <div className="absolute top-full left-0 z-40 mt-2">
              <ImageLibraryPicker
                value={src ?? undefined}
                onSelect={(entry) => onSelectImage(entry.src)}
                onClose={() => setLibraryOpen(false)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function LocationPin({ iconSizePx, iconColor }: { iconSizePx: number; iconColor: string }) {
  return (
    <span
      aria-hidden="true"
      className="service-area-v1-pin inline-block shrink-0"
      style={getServiceAreaV1PinStyle(iconSizePx, iconColor)}
    />
  );
}

function LocationCell({
  locationId,
  label,
  iconSizePx,
  iconColor,
  locationFontSizePx,
  textColor,
  editingEnabled,
  onLabelChange,
}: {
  locationId: string;
  label: string;
  iconSizePx: number;
  iconColor: string;
  locationFontSizePx: number;
  textColor: string;
  editingEnabled: boolean;
  onLabelChange?: (label: string) => void;
}) {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <div className="relative flex flex-col items-center gap-3 text-center">
      <LocationPin iconSizePx={iconSizePx} iconColor={iconColor} />
      <p
        className="service-area-v1-location font-medium leading-snug"
        style={{ color: textColor, fontSize: `${locationFontSizePx}px` }}
      >
        {label}
      </p>
      {editingEnabled && onLabelChange && (
        <>
          <button
            type="button"
            onClick={() => setEditorOpen((open) => !open)}
            className={cn(devEditButtonClassName, "top-0 right-0")}
            aria-label={`Edit ${label} label`}
            aria-expanded={editorOpen}
          >
            <Pencil size={devEditIconSize} strokeWidth={2} />
          </button>
          {editorOpen && (
            <div className="absolute top-full left-1/2 z-30 mt-2 -translate-x-1/2">
              <ServiceLabelEditor
                value={label}
                onChange={onLabelChange}
                onClose={() => setEditorOpen(false)}
                dialogTitle="Edit location"
                dialogAriaLabel={`Edit ${label} label`}
                inputAriaLabel={`${locationId} location label`}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Service area map pins — headline left, 2×3 location grid right. */
export function ServiceAreaV1({
  heading: defaultHeading,
  locations,
  settings: settingsProp,
  contentEditingEnabled = false,
  getSectionHeading,
  setSectionHeading,
  getLocationLabel,
  setLocationLabel,
  getGraphImageSrc,
  setGraphImage,
  clearGraphImage,
  className,
}: ServiceAreaV1Props) {
  const settings = settingsProp ?? defaultServiceAreaV1PreviewSettings;
  const sizeOption = getServiceAreaV1SizeOption(settings.size);
  const heading = getSectionHeading ? getSectionHeading(defaultHeading) : defaultHeading;
  const graphImageSrc = getGraphImageSrc
    ? getGraphImageSrc()
    : resolveServiceAreaV1GraphSrc(settings);
  const graphEditingEnabled =
    contentEditingEnabled && Boolean(setGraphImage && clearGraphImage);
  const editingEnabled = contentEditingEnabled && Boolean(setSectionHeading && setLocationLabel);
  const isContained = settings.layoutWidth === "contained";

  const headingStyle: CSSProperties = {
    color: settings.headingColor,
    fontFamily: "var(--font-poppins)",
  };

  const inner = (
    <div
      className={cn(
        "service-area-v1-inner items-center py-14 sm:py-16 lg:py-20",
        isContained
          ? "grid gap-10 px-8 sm:px-10 lg:grid-cols-2 lg:gap-12 lg:px-12"
          : "mx-auto grid w-full max-w-[1600px] grid-cols-1 gap-10 px-8 sm:px-10 lg:grid-cols-2 lg:items-center lg:gap-x-16 lg:px-12 xl:px-16",
      )}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-6",
          isContained ? "lg:items-start" : "lg:shrink-0 lg:items-start",
        )}
      >
        <ServiceAreaGraph
          src={graphImageSrc}
          editingEnabled={graphEditingEnabled}
          onSelectImage={setGraphImage}
          onClearImage={clearGraphImage}
        />
        <SectionHeading
          heading={heading}
          headingStyle={headingStyle}
          editingEnabled={editingEnabled}
          onHeadingChange={setSectionHeading}
        />
      </div>

      <ul
        className={cn(
          "service-area-v1-grid grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12",
          !isContained && "lg:ml-5 lg:mr-[10%] lg:justify-self-start",
        )}
        aria-label="Service locations"
      >
        {locations.map((location) => {
          const label = getLocationLabel
            ? getLocationLabel(location.id, location.label)
            : location.label;

          return (
            <li key={location.id}>
              <LocationCell
                locationId={location.id}
                label={label}
                iconSizePx={sizeOption.iconSizePx}
                iconColor={settings.iconColor}
                locationFontSizePx={sizeOption.locationFontSizePx}
                textColor={settings.locationTextColor}
                editingEnabled={editingEnabled}
                onLabelChange={
                  setLocationLabel
                    ? (nextLabel) => setLocationLabel(location.id, nextLabel)
                    : undefined
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <section
      id="service-area"
      className={cn("service-area-v1 w-full", isContained && "py-12 lg:py-16", className)}
      style={getServiceAreaV1SectionStyle(settings, isContained)}
      aria-labelledby={headingId}
    >
      <div className={getServiceAreaV1LayoutWidthClassName(settings.layoutWidth)}>
        {isContained ? (
          <div className="service-area-v1-card" style={getServiceAreaV1CardStyle(settings)}>
            {inner}
          </div>
        ) : (
          <div className="service-area-v1-inner-wrap w-full">{inner}</div>
        )}
      </div>
    </section>
  );
}
