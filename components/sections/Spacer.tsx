import type { CSSProperties, ReactNode } from "react";
import type { PreviewGradientDirection, PreviewGradientMode } from "@/lib/preview-gradient";
import { getSpacerStripeBackground } from "@/lib/preview-gradient";
import { getDefaultSpacerStripeStyle } from "@/lib/spacer-defaults";
import {
  getResponsiveSiteLayoutWidthClassName,
  resolveLayoutWidthMobile,
  type SiteLayoutWidth,
} from "@/lib/site-layout";
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
  layoutWidthMobile?: SiteLayoutWidth;
  outerBackgroundColor?: string;
};

function getSpacerSectionStyle({
  layoutWidth = "full",
  layoutWidthMobile,
  outerBackgroundColor = defaultSpacerOuterBackgroundColor,
}: SpacerLayoutOptions): CSSProperties | undefined {
  const mobile = resolveLayoutWidthMobile(layoutWidth, layoutWidthMobile);

  if (mobile === layoutWidth) {
    if (layoutWidth === "contained") {
      return { backgroundColor: outerBackgroundColor };
    }
    return undefined;
  }

  if (mobile === "full" && layoutWidth === "contained") {
    return {
      backgroundColor: "transparent",
      ["--spacer-outer-bg" as string]: outerBackgroundColor,
    } as CSSProperties;
  }

  if (mobile === "contained") {
    return { backgroundColor: outerBackgroundColor };
  }

  return undefined;
}

function getSpacerSectionClassName(
  layoutWidth: SiteLayoutWidth,
  layoutWidthMobile?: SiteLayoutWidth,
): string | undefined {
  const mobile = resolveLayoutWidthMobile(layoutWidth, layoutWidthMobile);
  if (mobile === "full" && layoutWidth === "contained") {
    return "lg:!bg-[var(--spacer-outer-bg)]";
  }
  return undefined;
}

type SpacerLayoutShellProps = {
  layoutWidth: SiteLayoutWidth;
  layoutWidthMobile?: SiteLayoutWidth;
  children: ReactNode;
  className?: string;
};

/** Wraps spacer content in the site contained width or full bleed. */
export function SpacerLayoutShell({
  layoutWidth,
  layoutWidthMobile,
  children,
  className,
}: SpacerLayoutShellProps) {
  return (
    <div
      className={cn(
        getResponsiveSiteLayoutWidthClassName(layoutWidth, layoutWidthMobile),
        className,
      )}
    >
      {children}
    </div>
  );
}

type SpacerStripeProps = SpacerLayoutOptions & {
  style?: SpacerStripeStyle;
};

/** Full-bleed accent stripe with soft fade at the edges. */
export function SpacerStripe({
  style = defaultSpacerStripeStyle,
  layoutWidth = "full",
  layoutWidthMobile,
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
        getSpacerSectionClassName(layoutWidth, layoutWidthMobile),
      )}
      style={{
        ...getSpacerSectionStyle({ layoutWidth, layoutWidthMobile, outerBackgroundColor }),
        ...(overlap
          ? {
              marginTop: -(halfHeight + bleedPx),
              marginBottom: -(halfHeight + bleedPx),
            }
          : {}),
      }}
      aria-hidden="true"
    >
      <SpacerLayoutShell layoutWidth={layoutWidth} layoutWidthMobile={layoutWidthMobile}>
        {stripeBand}
      </SpacerLayoutShell>
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
  layoutWidthMobile,
  outerBackgroundColor = defaultSpacerOuterBackgroundColor,
}: SpacerGradientProps) {
  return (
    <section
      className={cn("py-6", getSpacerSectionClassName(layoutWidth, layoutWidthMobile))}
      style={getSpacerSectionStyle({ layoutWidth, layoutWidthMobile, outerBackgroundColor })}
      aria-hidden="true"
    >
      <SpacerLayoutShell layoutWidth={layoutWidth} layoutWidthMobile={layoutWidthMobile}>
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
  layoutWidthMobile,
  outerBackgroundColor = defaultSpacerOuterBackgroundColor,
}: SpacerLineProps) {
  return (
    <section
      className={cn("py-1", getSpacerSectionClassName(layoutWidth, layoutWidthMobile))}
      style={getSpacerSectionStyle({ layoutWidth, layoutWidthMobile, outerBackgroundColor })}
      aria-hidden="true"
    >
      <SpacerLayoutShell layoutWidth={layoutWidth} layoutWidthMobile={layoutWidthMobile}>
        <hr className="border-0 border-t border-border" />
      </SpacerLayoutShell>
    </section>
  );
}

type SpacerFadeProps = SpacerLayoutOptions;

/** Soft vertical fade — subtle breathing room between sections. */
export function SpacerFade({
  layoutWidth = "full",
  layoutWidthMobile,
  outerBackgroundColor = defaultSpacerOuterBackgroundColor,
}: SpacerFadeProps) {
  return (
    <section
      className={getSpacerSectionClassName(layoutWidth, layoutWidthMobile)}
      style={getSpacerSectionStyle({ layoutWidth, layoutWidthMobile, outerBackgroundColor })}
      aria-hidden="true"
    >
      <SpacerLayoutShell layoutWidth={layoutWidth} layoutWidthMobile={layoutWidthMobile}>
        <div className="spacer-fade-band h-14 w-full sm:h-16" />
      </SpacerLayoutShell>
    </section>
  );
}
