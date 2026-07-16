"use client";

import { useState } from "react";
import type { CSSProperties } from "react";
import { Shuffle } from "lucide-react";
import { useTextIconsV3Preview } from "@/components/dev/TextIconsV3PreviewContext";
import { LucideIconPicker } from "@/components/dev/LucideIconPicker";
import { IconFrame } from "@/components/icons/IconFrame";
import { Container } from "@/components/ui/Container";
import {
  defaultTextIconsV3PreviewSettings,
  getTextIconsV3BackgroundStyle,
  getTextIconsV3CssVariables,
} from "@/lib/text-icons-v3-preview";
import { defaultSiteIconName, resolveSiteIconName, type SiteIconName } from "@/lib/site-icons";
import { devEditButtonClassName, devEditIconSize } from "@/lib/dev-overlay-controls";
import { getSiteLayoutWidthClassName } from "@/lib/site-layout";
import { cn } from "@/lib/utils";

export type TextIconsV3Item = {
  id: string;
  title: string;
  description: string;
  icon?: SiteIconName;
};

type TextIconsV3Props = {
  heading: string;
  subheading: string;
  items: readonly TextIconsV3Item[];
  className?: string;
};

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

/** Three-column icon + text grid — Spartan "Why Choose Us" content block. */
export function TextIconsV3({ heading, subheading, items, className }: TextIconsV3Props) {
  const preview = useTextIconsV3Preview();
  const settings = preview?.settings ?? defaultTextIconsV3PreviewSettings;
  const iconEditingEnabled = preview?.contentEditingEnabled ?? false;
  const isContained = settings.layoutWidth === "contained";

  const gradientBackground = getTextIconsV3BackgroundStyle(settings);
  const textStyle = getTextIconsV3CssVariables(settings) as CSSProperties;

  const content = (
    <>
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-icons-v3-heading font-serif text-3xl font-semibold tracking-wide sm:text-4xl">
          {heading}
        </h2>
        <p className="text-icons-v3-subheading mt-4 text-sm leading-relaxed sm:text-base">
          {subheading}
        </p>
      </div>

      <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
        {items.map((item) => {
          const fallbackIcon = resolveSiteIconName(item.icon, defaultSiteIconName);

          return (
            <article
              key={item.id}
              className="text-icons-v3-item flex flex-col items-center text-center"
            >
              <TextIconsV3Icon
                itemId={item.id}
                itemTitle={item.title}
                fallbackIcon={fallbackIcon}
                iconEditingEnabled={iconEditingEnabled}
                onIconChange={
                  preview ? (nextIcon) => preview.setItemIcon(item.id, nextIcon) : undefined
                }
              />
              <h3 className="mt-5 text-lg font-semibold leading-snug text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{item.description}</p>
            </article>
          );
        })}
      </div>
    </>
  );

  if (isContained) {
    const sectionStyle: CSSProperties = {
      backgroundColor: settings.outerBackgroundColor,
      ...textStyle,
    };

    const innerStyle: CSSProperties = {
      background: gradientBackground,
    };

    return (
      <section className={cn("text-icons-v3", className)} style={sectionStyle}>
        <div className={getSiteLayoutWidthClassName("contained")}>
          <div className="py-16 lg:py-20" style={innerStyle}>
            {content}
          </div>
        </div>
      </section>
    );
  }

  const sectionStyle: CSSProperties = {
    background: gradientBackground,
    ...textStyle,
  };

  return (
    <section className={cn("text-icons-v3 py-16 lg:py-20", className)} style={sectionStyle}>
      <Container>{content}</Container>
    </section>
  );
}
