"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { SiteIcon } from "@/components/icons/SiteIcon";
import { useHeroV4Preview } from "@/components/dev/HeroV4PreviewContext";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import {
  defaultHeroV4ContactInfoItems,
  getHeroV4ContactInfoStyle,
  normalizeHeroV4PreviewSettings,
  resolveHeroV4ContactInfoHref,
  type HeroV4ContactInfoItem,
  type HeroV4PreviewSettings,
} from "@/lib/hero-v4-preview";
import { devEditButtonClassName, devEditIconSize } from "@/lib/dev-overlay-controls";
import { cn } from "@/lib/utils";

function EditableLine({
  editingEnabled,
  ariaLabel,
  editorTitle,
  value,
  multiline,
  onSave,
  children,
}: {
  editingEnabled: boolean;
  ariaLabel: string;
  editorTitle: string;
  value: string;
  multiline?: boolean;
  onSave?: (value: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (!editingEnabled || !onSave) {
    return <>{children}</>;
  }

  return (
    <div className="relative max-w-full pr-8">
      {children}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={devEditButtonClassName}
        aria-label={ariaLabel}
        aria-expanded={open}
      >
        <Pencil size={devEditIconSize} strokeWidth={2} />
      </button>
      {open ? (
        <div className="absolute top-full right-0 z-30 mt-2">
          <TextImageTextEditor
            value={value}
            multiline={multiline}
            rows={multiline ? 3 : 1}
            dialogTitle={editorTitle}
            dialogAriaLabel={editorTitle}
            inputAriaLabel={ariaLabel}
            onChange={onSave}
            onClose={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}

type HeroV4ContactInfoProps = {
  items?: HeroV4ContactInfoItem[];
  iconColor?: string;
  iconBackground?: string;
  iconRadiusPx?: number;
  labelColor?: string;
  valueColor?: string;
  linkHoverColor?: string;
  className?: string;
};

export function HeroV4ContactInfo({
  items = defaultHeroV4ContactInfoItems,
  iconColor,
  iconBackground,
  iconRadiusPx,
  labelColor,
  valueColor,
  linkHoverColor,
  className,
}: HeroV4ContactInfoProps) {
  const preview = useHeroV4Preview();
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const resolvedLabelColor = preview?.settings.contactInfoLabelColor ?? labelColor;
  const resolvedValueColor = preview?.settings.contactInfoValueColor ?? valueColor;
  const resolvedLinkHoverColor = preview?.settings.contactInfoLinkHoverColor ?? linkHoverColor;
  const iconStyle = getHeroV4ContactInfoStyle({
    contactInfoIconColor: preview?.settings.contactInfoIconColor ?? iconColor,
    contactInfoIconBackground: preview?.settings.contactInfoIconBackground ?? iconBackground,
    contactInfoIconRadiusPx: preview?.settings.contactInfoIconRadiusPx ?? iconRadiusPx,
    contactInfoLabelColor: resolvedLabelColor,
    contactInfoValueColor: resolvedValueColor,
    contactInfoLinkHoverColor: resolvedLinkHoverColor,
  }) as CSSProperties;
  const visibleItems = items.filter((item) => item.label.trim() || item.value.trim());

  const update = (patch: Partial<HeroV4PreviewSettings>) => {
    if (!preview) return;
    preview.setSettings(normalizeHeroV4PreviewSettings({ ...preview.settings, ...patch }));
  };

  const updateItem = (index: number, patch: Partial<HeroV4ContactInfoItem>) => {
    if (!preview) return;
    const nextItems = [...(preview.settings.contactInfoItems ?? items)];
    nextItems[index] = { ...nextItems[index]!, ...patch };
    update({ contactInfoItems: nextItems });
  };

  if (visibleItems.length === 0 && !editingEnabled) {
    return null;
  }

  const rows = visibleItems.length > 0 ? visibleItems : items;

  return (
    <div
      className={cn("hero-v4-contact-info", className)}
      style={iconStyle}
      aria-label="Contact information"
    >
      <ul className="hero-v4-contact-info-list">
        {rows.map((item, index) => {
          const href = resolveHeroV4ContactInfoHref(item);
          const valueNode = href ? (
            <a href={href} className="hero-v4-contact-info-value-link transition-colors">
              {item.value}
            </a>
          ) : (
            <span>{item.value}</span>
          );

          return (
            <li key={`${item.label}-${index}`} className="hero-v4-contact-info-item">
              <span className="hero-v4-contact-info-icon" aria-hidden="true">
                <SiteIcon name={item.icon} size={22} strokeWidth={1.85} />
              </span>
              <div className="hero-v4-contact-info-copy min-w-0">
                <EditableLine
                  editingEnabled={editingEnabled}
                  ariaLabel={`Edit contact info label ${index + 1}`}
                  editorTitle={`Contact info label ${index + 1}`}
                  value={item.label}
                  onSave={(value) => updateItem(index, { label: value })}
                >
                  <p
                    className="hero-v4-contact-info-label"
                    style={resolvedLabelColor ? { color: resolvedLabelColor } : undefined}
                  >
                    {item.label}
                  </p>
                </EditableLine>
                <EditableLine
                  editingEnabled={editingEnabled}
                  ariaLabel={`Edit contact info value ${index + 1}`}
                  editorTitle={`Contact info value ${index + 1}`}
                  value={item.value}
                  multiline
                  onSave={(value) => updateItem(index, { value, href: undefined })}
                >
                  <p
                    className="hero-v4-contact-info-value"
                    style={resolvedValueColor ? { color: resolvedValueColor } : undefined}
                  >
                    {valueNode}
                  </p>
                </EditableLine>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
