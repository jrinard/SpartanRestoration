export type PreviewGradientMode = "linear" | "center-fade";

export type PreviewGradientDirection =
  | "none"
  | "to bottom"
  | "to top"
  | "to right"
  | "to left"
  | "to bottom right"
  | "to bottom left"
  | "to top right"
  | "to top left";

export const previewGradientDirections: {
  value: PreviewGradientDirection;
  label: string;
}[] = [
  { value: "none", label: "None" },
  { value: "to bottom", label: "↓ Top to bottom" },
  { value: "to top", label: "↑ Bottom to top" },
  { value: "to right", label: "→ Left to right" },
  { value: "to left", label: "← Right to left" },
  { value: "to bottom right", label: "↘ Diagonal BR" },
  { value: "to bottom left", label: "↙ Diagonal BL" },
  { value: "to top right", label: "↗ Diagonal TR" },
  { value: "to top left", label: "↖ Diagonal TL" },
];

export function getPreviewGradientBackground(
  from: string,
  to: string,
  direction: PreviewGradientDirection,
): string {
  if (direction === "none") {
    return from;
  }

  return `linear-gradient(${direction}, ${from}, ${to})`;
}

export function getSpacerStripeBackground(
  from: string,
  to: string,
  direction: PreviewGradientDirection,
  mode: PreviewGradientMode,
): string {
  if (mode === "center-fade") {
    const axis = direction === "none" ? "to right" : direction;
    return `linear-gradient(${axis}, transparent 0%, ${from} 32%, ${to} 68%, transparent 100%)`;
  }

  return getPreviewGradientBackground(from, to, direction);
}
