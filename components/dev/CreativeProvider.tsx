"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  defaultColorThemeId,
  getColorTheme,
  type ColorThemeId,
} from "@/lib/color-themes";
import {
  creativeStorageKeys,
  defaultFontThemeId,
  getFontTheme,
  type FontThemeId,
} from "@/lib/creative-themes";

type CreativeContextValue = {
  fontThemeId: FontThemeId;
  setFontThemeId: (id: FontThemeId) => void;
  colorThemeId: ColorThemeId;
  setColorThemeId: (id: ColorThemeId) => void;
};

const CreativeContext = createContext<CreativeContextValue | null>(null);

export function useCreativeTheme() {
  const context = useContext(CreativeContext);
  if (!context) {
    throw new Error("useCreativeTheme must be used within CreativeProvider");
  }
  return context;
}

export function useCreativeThemeOptional() {
  return useContext(CreativeContext);
}

type CreativeProviderProps = {
  children: ReactNode;
  initialColorThemeId?: ColorThemeId;
  initialFontThemeId?: FontThemeId;
  /** When false, theme is fixed (live homepage). Default true for playground. */
  persistTheme?: boolean;
};

export function CreativeProvider({
  children,
  initialColorThemeId = defaultColorThemeId,
  initialFontThemeId = defaultFontThemeId,
  persistTheme = true,
}: CreativeProviderProps) {
  const [fontThemeId, setFontThemeIdState] = useState<FontThemeId>(initialFontThemeId);
  const [colorThemeId, setColorThemeIdState] = useState<ColorThemeId>(initialColorThemeId);

  useEffect(() => {
    if (!persistTheme) return;

    const storedFont = localStorage.getItem(creativeStorageKeys.fontTheme);
    if (storedFont) {
      setFontThemeIdState(getFontTheme(storedFont).id);
    }

    const storedColor = localStorage.getItem(creativeStorageKeys.colorTheme);
    if (storedColor) {
      const theme = getColorTheme(storedColor);
      setColorThemeIdState(theme.id);
      if (storedColor === "washing") {
        localStorage.setItem(creativeStorageKeys.colorTheme, theme.id);
      }
    }
  }, [persistTheme]);

  function setFontThemeId(id: FontThemeId) {
    setFontThemeIdState(id);
    if (persistTheme) {
      localStorage.setItem(creativeStorageKeys.fontTheme, id);
    }
  }

  function setColorThemeId(id: ColorThemeId) {
    setColorThemeIdState(id);
    if (persistTheme) {
      localStorage.setItem(creativeStorageKeys.colorTheme, id);
    }
  }

  const fontTheme = getFontTheme(fontThemeId);
  const style = {
    "--font-sans": fontTheme.sans,
    "--font-serif": fontTheme.serif,
  } as CSSProperties;

  return (
    <CreativeContext.Provider
      value={{ fontThemeId, setFontThemeId, colorThemeId, setColorThemeId }}
    >
      <div
        className="creative-preview min-h-screen"
        data-color-theme={colorThemeId}
        style={style}
      >
        {children}
      </div>
    </CreativeContext.Provider>
  );
}
