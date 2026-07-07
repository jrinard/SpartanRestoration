export type ButtonPreviewSize = "small" | "medium" | "large" | "xlarge";

export function isButtonPreviewSize(value: unknown): value is ButtonPreviewSize {
  return value === "small" || value === "medium" || value === "large" || value === "xlarge";
}

export type ButtonPreviewSettings = {
  navBackground: string;
  navTextColor: string;
  navTextHoverColor: string;
  navHoverBackground: string;
  navButtonSize: ButtonPreviewSize;
  /** Nav / CTA button corner radius (px). */
  navButtonRadiusPx: number;
};

export const defaultButtonBorderRadiusPx = 4;

export const buttonBorderRadiusOptions = [0, 4, 8, 10, 20] as const;

export function normalizeButtonBorderRadiusPx(value: number): number {
  if (buttonBorderRadiusOptions.includes(value as (typeof buttonBorderRadiusOptions)[number])) {
    return value;
  }

  return buttonBorderRadiusOptions.reduce((closest, option) =>
    Math.abs(option - value) < Math.abs(closest - value) ? option : closest,
  );
}

export type ParsedButtonBackgroundColor = {
  r: number;
  g: number;
  b: number;
  a: number;
};

export const defaultButtonPreviewSettings: ButtonPreviewSettings = {
  navBackground: "#4d82b8",
  navTextColor: "#ffffff",
  navTextHoverColor: "#85a33f",
  navHoverBackground: "transparent",
  navButtonSize: "medium",
  navButtonRadiusPx: defaultButtonBorderRadiusPx,
};

/** Hero CTA defaults — independent from header nav buttons. */
export const defaultHeroButtonPreviewSettings: ButtonPreviewSettings = {
  navBackground: "#4d82b8",
  navTextColor: "#ffffff",
  navTextHoverColor: "#85a33f",
  navHoverBackground: "transparent",
  navButtonSize: "large",
  navButtonRadiusPx: defaultButtonBorderRadiusPx,
};

/** Header nav buttons default to transparent fill on the strip. */
export const defaultHeaderButtonPreviewSettings: ButtonPreviewSettings = {
  navBackground: "transparent",
  navTextColor: "#ffffff",
  navTextHoverColor: "#85a33f",
  navHoverBackground: "transparent",
  navButtonSize: "medium",
  navButtonRadiusPx: defaultButtonBorderRadiusPx,
};

export const buttonPreviewSizes: { value: ButtonPreviewSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xlarge", label: "Extra Large" },
];

function channelToHex(value: number): string {
  return Math.max(0, Math.min(255, value)).toString(16).padStart(2, "0");
}

function expandHex(hex: string): string | null {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    return normalized
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (normalized.length === 6) return normalized;
  if (normalized.length === 8) return normalized.slice(0, 6);
  return null;
}

export function parseButtonBackgroundColor(value: string): ParsedButtonBackgroundColor {
  if (value === "transparent") {
    return { r: 77, g: 130, b: 184, a: 0 };
  }

  const rgbaMatch = value.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i,
  );
  if (rgbaMatch) {
    return {
      r: Number(rgbaMatch[1]),
      g: Number(rgbaMatch[2]),
      b: Number(rgbaMatch[3]),
      a: rgbaMatch[4] !== undefined ? Number(rgbaMatch[4]) : 1,
    };
  }

  const hex = expandHex(value);
  if (hex) {
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
      a: 1,
    };
  }

  return { r: 77, g: 130, b: 184, a: 1 };
}

export function formatButtonBackgroundColor(color: ParsedButtonBackgroundColor): string {
  const { r, g, b, a } = color;

  if (a <= 0) return "transparent";
  if (a >= 1) return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;

  const alpha = Math.round(a * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function colorInputHexFromBackground(value: string): string {
  const { r, g, b } = parseButtonBackgroundColor(value);
  return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
}

export function alphaPercentFromBackground(value: string): number {
  return Math.round(parseButtonBackgroundColor(value).a * 100);
}

export function setBackgroundColorRgb(value: string, hex: string): string {
  const rgb = parseButtonBackgroundColor(hex);
  const current = parseButtonBackgroundColor(value);
  return formatButtonBackgroundColor({ ...rgb, a: current.a });
}

export function setBackgroundColorAlpha(value: string, alphaPercent: number): string {
  const current = parseButtonBackgroundColor(value);
  return formatButtonBackgroundColor({ ...current, a: alphaPercent / 100 });
}

export function getButtonPreviewStyleRecord(
  settings: ButtonPreviewSettings,
): Record<string, string> {
  return {
    "--header-v3-nav-bg": settings.navBackground,
    "--header-v3-nav-color": settings.navTextColor,
    "--header-v3-nav-hover-color": settings.navTextHoverColor,
    "--header-v3-nav-hover-bg": settings.navHoverBackground,
    "--header-v3-nav-radius": `${settings.navButtonRadiusPx}px`,
  };
}

export function mergeButtonPreviewSettings<T extends ButtonPreviewSettings>(
  settings: T,
  button: Partial<ButtonPreviewSettings>,
): T {
  return { ...settings, ...button };
}

export function pickButtonPreviewSettings(
  settings: ButtonPreviewSettings,
): ButtonPreviewSettings {
  return {
    navBackground: settings.navBackground,
    navTextColor: settings.navTextColor,
    navTextHoverColor: settings.navTextHoverColor,
    navHoverBackground: settings.navHoverBackground,
    navButtonSize: settings.navButtonSize,
    navButtonRadiusPx: settings.navButtonRadiusPx,
  };
}
