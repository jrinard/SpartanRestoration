export type IconFrameShape = "circle" | "card" | "sharp" | "none";

export type IconFrameSize = "small" | "medium" | "large" | "xlarge";

export type IconFrameContext = "text-icons-v3" | "header-v1";

export type IconFramePreviewSettings = {
  iconFrameShape: IconFrameShape;
  iconFrameSize: IconFrameSize;
  iconColor: string;
  iconBorderColor: string;
  iconBackgroundColor: string;
};

export const iconFrameShapeOptions: { value: IconFrameShape; label: string }[] = [
  { value: "circle", label: "Circle" },
  { value: "card", label: "Card" },
  { value: "sharp", label: "Sharp" },
  { value: "none", label: "None" },
];

export const iconFrameSizeOptions: { value: IconFrameSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "XL" },
];

export const defaultIconFrameShape: IconFrameShape = "card";
export const defaultIconFrameSize: IconFrameSize = "medium";

type IconFrameDimensions = {
  boxSizePx: number;
  iconSizeWithShapePx: number;
  iconSizeBarePx: number;
};

const iconFrameDimensions: Record<IconFrameContext, Record<IconFrameSize, IconFrameDimensions>> = {
  "text-icons-v3": {
    small: { boxSizePx: 40, iconSizeWithShapePx: 20, iconSizeBarePx: 32 },
    medium: { boxSizePx: 48, iconSizeWithShapePx: 24, iconSizeBarePx: 40 },
    large: { boxSizePx: 56, iconSizeWithShapePx: 28, iconSizeBarePx: 48 },
    xlarge: { boxSizePx: 64, iconSizeWithShapePx: 32, iconSizeBarePx: 56 },
  },
  "header-v1": {
    small: { boxSizePx: 28, iconSizeWithShapePx: 16, iconSizeBarePx: 22 },
    medium: { boxSizePx: 36, iconSizeWithShapePx: 20, iconSizeBarePx: 28 },
    large: { boxSizePx: 44, iconSizeWithShapePx: 24, iconSizeBarePx: 34 },
    xlarge: { boxSizePx: 52, iconSizeWithShapePx: 28, iconSizeBarePx: 40 },
  },
};

export function isIconFrameShape(value: unknown): value is IconFrameShape {
  return value === "circle" || value === "card" || value === "sharp" || value === "none";
}

export function isIconFrameSize(value: unknown): value is IconFrameSize {
  return (
    value === "small" ||
    value === "medium" ||
    value === "large" ||
    value === "xlarge"
  );
}

export function resolveIconFrameShape(value: unknown): IconFrameShape {
  return isIconFrameShape(value) ? value : defaultIconFrameShape;
}

export function resolveIconFrameSize(value: unknown): IconFrameSize {
  return isIconFrameSize(value) ? value : defaultIconFrameSize;
}

function getIconFrameDimensions(
  context: IconFrameContext,
  size: IconFrameSize,
): IconFrameDimensions {
  return iconFrameDimensions[context][size];
}

export function getIconFrameBorderRadiusPx(shape: IconFrameShape): number {
  switch (shape) {
    case "circle":
      return 9999;
    case "card":
      return 8;
    case "sharp":
    case "none":
      return 0;
  }
}

export function getIconFrameBoxSizePx(
  context: IconFrameContext,
  shape: IconFrameShape,
  size: IconFrameSize = defaultIconFrameSize,
): number {
  if (shape === "none") return 0;
  return getIconFrameDimensions(context, size).boxSizePx;
}

export function getIconFrameIconSizePx(
  context: IconFrameContext,
  shape: IconFrameShape,
  size: IconFrameSize = defaultIconFrameSize,
): number {
  const dimensions = getIconFrameDimensions(context, size);
  return shape === "none" ? dimensions.iconSizeBarePx : dimensions.iconSizeWithShapePx;
}
