import type { CSSProperties, ReactNode } from "react";
import type { PreviewGradientDirection, PreviewGradientMode } from "@/lib/preview-gradient";
import { getSpacerStripeBackground } from "@/lib/preview-gradient";
import { getDefaultSpacerStripeStyle } from "@/lib/spacer-defaults";
import { getSiteLayoutWidthClassName, type SiteLayoutWidth } from "@/lib/site-layout";
import { cn } from "@/lib/utils";

export const defaultSpacerOuterBackgroundColor = "#ffffff";

export type SpacerStripeStyle = {
  from: string;
  to: string;
  direction: PreviewGradientDirection;
  mode: PreviewGradientMode;
  heightPx: number;
  /** Pulls half the band height into adjacent sections above and below. */
  overlap?: boolean;
};

export const defaultSpacerStripeStyle: SpacerStripeStyle =
  getDefaultSpacerStripeStyle("dark");

type SpacerLayoutOptions = {
  layoutWidth?: SiteLayoutWidth;
  outerBackgroundColor?: string;
};

function getSpacerSectionStyle({
  layoutWidth = "full",
  outerBackgroundColor = defaultSpacerOuterBackgroundColor,
}: SpacerLayoutOptions): CSSProperties | undefined {
  if (layoutWidth === "contained") {
    return { backgroundColor: outerBackgroundColor };
  }

  return undefined;
}

type SpacerLayoutShellProps = {
  layoutWidth: SiteLayoutWidth;
  children: ReactNode;
  className?: string;
};

/** Wraps spacer content in the site contained width or full bleed. */
export function SpacerLayoutShell({
  layoutWidth,
  children,
  className,
}: SpacerLayoutShellProps) {
  if (layoutWidth === "contained") {
    return (
      <div className={cn(getSiteLayoutWidthClassName("contained"), className)}>{children}</div>
    );
  }

  return <div className={cn("w-full", className)}>{children}</div>;
}

type SpacerStripeProps = SpacerLayoutOptions & {
  style?: SpacerStripeStyle;
};

/** Full-bleed accent stripe with soft fade at the edges. */
export function SpacerStripe({
  style = defaultSpacerStripeStyle,
  layoutWidth = "full",
  outerBackgroundColor = defaultSpacerOuterBackgroundColor,
}: SpacerStripeProps) {
  const overlap = style.overlap === true;
  const halfHeight = style.heightPx / 2;
  const bleedPx = overlap ? 1 : 0;

  const stripeBand = (
    <div
      className="block w-full"
      style={{
        height: `${style.heightPx + bleedPx * 2}px`,
        background: getSpacerStripeBackground(
          style.from,
          style.to,
          style.direction,
          style.mode,
          overlap,
        ),
      }}
    />
  );

  return (
    <section
      className={cn(
        "spacer-stripe bg-transparent p-0 leading-none",
        overlap && "spacer-overlap relative z-10",
      )}
      style={{
        ...getSpacerSectionStyle({ layoutWidth, outerBackgroundColor }),
        ...(overlap
          ? {
              marginTop: -(halfHeight + bleedPx),
              marginBottom: -(halfHeight + bleedPx),
            }
          : {}),
      }}
      aria-hidden="true"
    >
      <SpacerLayoutShell layoutWidth={layoutWidth}>{stripeBand}</SpacerLayoutShell>
    </section>
  );
}

/** Horizontal gradient band — left to right. */
export type SpacerGradientStyle = {
  heightPx: number;
};

export const defaultSpacerGradientStyle: SpacerGradientStyle = {
  heightPx: 40,
};

type SpacerGradientProps = SpacerLayoutOptions & {
  style?: SpacerGradientStyle;
};

export function SpacerGradient({
  style = defaultSpacerGradientStyle,
  layoutWidth = "full",
  outerBackgroundColor = defaultSpacerOuterBackgroundColor,
}: SpacerGradientProps) {
  return (
    <section
      className="py-6"
      style={getSpacerSectionStyle({ layoutWidth, outerBackgroundColor })}
      aria-hidden="true"
    >
      <SpacerLayoutShell layoutWidth={layoutWidth}>
        <div
          className="spacer-gradient-h-band w-full"
          style={{ height: `${style.heightPx}px` }}
        />
      </SpacerLayoutShell>
    </section>
  );
}

type SpacerLineProps = SpacerLayoutOptions;

/** Hairline rule. */
export function SpacerLine({
  layoutWidth = "contained",
  outerBackgroundColor = defaultSpacerOuterBackgroundColor,
}: SpacerLineProps) {
  return (
    <section
      className="py-1"
      style={getSpacerSectionStyle({ layoutWidth, outerBackgroundColor })}
      aria-hidden="true"
    >
      <SpacerLayoutShell layoutWidth={layoutWidth}>
        <hr className="border-0 border-t border-border" />
      </SpacerLayoutShell>
    </section>
  );
}

type SpacerFadeProps = SpacerLayoutOptions;

/** Soft vertical fade — subtle breathing room between sections. */
export function SpacerFade({
  layoutWidth = "full",
  outerBackgroundColor = defaultSpacerOuterBackgroundColor,
}: SpacerFadeProps) {
  return (
    <section
      style={getSpacerSectionStyle({ layoutWidth, outerBackgroundColor })}
      aria-hidden="true"
    >
      <SpacerLayoutShell layoutWidth={layoutWidth}>
        <div className="spacer-fade-band h-14 w-full sm:h-16" />
      </SpacerLayoutShell>
    </section>
  );
}
