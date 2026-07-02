import { Container } from "@/components/ui/Container";
import type { PreviewGradientDirection, PreviewGradientMode } from "@/lib/preview-gradient";
import { getSpacerStripeBackground } from "@/lib/preview-gradient";
import { getDefaultSpacerStripeStyle } from "@/lib/spacer-defaults";
import { cn } from "@/lib/utils";

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

type SpacerStripeProps = {
  style?: SpacerStripeStyle;
};

/** Full-bleed accent stripe with soft fade at the edges. */
export function SpacerStripe({ style = defaultSpacerStripeStyle }: SpacerStripeProps) {
  const overlap = style.overlap === true;
  const halfHeight = style.heightPx / 2;
  const bleedPx = overlap ? 1 : 0;

  return (
    <section
      className={cn(
        "spacer-stripe bg-transparent p-0 leading-none",
        overlap && "spacer-overlap relative z-10",
      )}
      style={
        overlap
          ? {
              marginTop: -(halfHeight + bleedPx),
              marginBottom: -(halfHeight + bleedPx),
            }
          : undefined
      }
      aria-hidden="true"
    >
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

type SpacerGradientProps = {
  style?: SpacerGradientStyle;
};

export function SpacerGradient({ style = defaultSpacerGradientStyle }: SpacerGradientProps) {
  return (
    <section className="py-6" aria-hidden="true">
      <div
        className="spacer-gradient-h-band w-full"
        style={{ height: `${style.heightPx}px` }}
      />
    </section>
  );
}

/** Contained hairline rule. */
export function SpacerLine() {
  return (
    <section className="py-1" aria-hidden="true">
      <Container>
        <hr className="border-0 border-t border-border" />
      </Container>
    </section>
  );
}

/** Soft vertical fade — subtle breathing room between sections. */
export function SpacerFade() {
  return <section className="spacer-fade-band h-14 sm:h-16" aria-hidden="true" />;
}
