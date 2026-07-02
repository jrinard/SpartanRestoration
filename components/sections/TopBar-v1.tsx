"use client";

import type { CSSProperties } from "react";
import { useTopBarPreview } from "@/components/dev/TopBarPreviewContext";
import {
  defaultTopBarPreviewSettings,
  getTopBarLayoutWidthClassName,
} from "@/lib/top-bar-preview";
import { cn } from "@/lib/utils";

/** Split announcement bar — hours on the left, call CTA on the right. */
export function TopBarV1() {
  const preview = useTopBarPreview();
  const settings = preview?.settings ?? defaultTopBarPreviewSettings;
  const rightWidthPercent = 100 - settings.leftWidthPercent;

  const barStyle = {
    "--top-bar-height": `${settings.heightPx}px`,
    "--top-bar-left-width": `${settings.leftWidthPercent}%`,
    "--top-bar-right-width": `${rightWidthPercent}%`,
    "--top-bar-text-size": `${settings.textSizePx}px`,
  } as CSSProperties;

  return (
    <section
      className="top-bar"
      style={{ ...barStyle, backgroundColor: settings.outerBackgroundColor }}
      aria-label="Site announcement bar"
    >
      <div className={cn(getTopBarLayoutWidthClassName(settings.layoutWidth))}>
        <div className="top-bar-split">
          <div
            className="top-bar-segment top-bar-segment--left"
            style={{
              backgroundColor: settings.leftBackgroundColor,
              color: settings.leftLabelColor,
            }}
          >
            <p className="top-bar-text">
              {settings.leftLabel}{" "}
              <span className="top-bar-accent" style={{ color: settings.leftAccentColor }}>
                {settings.leftAccent}
              </span>
            </p>
          </div>
          <div
            className="top-bar-segment top-bar-segment--right"
            style={{
              backgroundColor: settings.rightBackgroundColor,
              color: settings.rightTextColor,
            }}
          >
            <a href={settings.phoneHref} className="top-bar-call">
              {settings.rightText}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
