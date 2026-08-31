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
  normalizePageBackgroundColor,
  type ColorThemeId,
} from "@/lib/color-themes";
import {
  creativeStorageKeys,
  defaultFontThemeId,
  getFontTheme,
  type FontThemeId,
} from "@/lib/creative-themes";
import { orgStorageGet, orgStorageRemove, orgStorageSet } from "@/lib/org/browser-storage";

type CreativeContextValue = {
  fontThemeId: FontThemeId;
  setFontThemeId: (id: FontThemeId) => void;
  colorThemeId: ColorThemeId;
  setColorThemeId: (id: ColorThemeId) => void;
  pageBackgroundColor: string | undefined;
  setPageBackgroundColor: (color: string | null) => void;
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
  initialPageBackgroundColor?: string;
  /** When false, theme is fixed (live homepage). Default true for playground. */
  persistTheme?: boolean;
};

export function CreativeProvider({
  children,
  initialColorThemeId = defaultColorThemeId,
  initialFontThemeId = defaultFontThemeId,
  initialPageBackgroundColor,
  persistTheme = true,
}: CreativeProviderProps) {
  const [fontThemeId, setFontThemeIdState] = useState<FontThemeId>(initialFontThemeId);
  const [colorThemeId, setColorThemeIdState] = useState<ColorThemeId>(initialColorThemeId);
  const [pageBackgroundColor, setPageBackgroundColorState] = useState<string | undefined>(
    () => normalizePageBackgroundColor(initialPageBackgroundColor),
  );

  useEffect(() => {
    if (!persistTheme) return;

    const storedFont = orgStorageGet(creativeStorageKeys.fontTheme);
    if (storedFont) {
      setFontThemeIdState(getFontTheme(storedFont).id);
    }

    const storedColor = orgStorageGet(creativeStorageKeys.colorTheme);
    if (storedColor) {
      const theme = getColorTheme(storedColor);
      setColorThemeIdState(theme.id);
      if (storedColor === "washing") {
        orgStorageSet(creativeStorageKeys.colorTheme, theme.id);
      }
    }

    const storedPageBackground = orgStorageGet(creativeStorageKeys.pageBackground);
    setPageBackgroundColorState(normalizePageBackgroundColor(storedPageBackground ?? undefined));
  }, [persistTheme]);

  useEffect(() => {
    if (!pageBackgroundColor) return;
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = pageBackgroundColor;
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, [pageBackgroundColor]);

  function setFontThemeId(id: FontThemeId) {
    setFontThemeIdState(id);
    if (persistTheme) {
      orgStorageSet(creativeStorageKeys.fontTheme, id);
    }
  }

  function setColorThemeId(id: ColorThemeId) {
    setColorThemeIdState(id);
    if (persistTheme) {
      orgStorageSet(creativeStorageKeys.colorTheme, id);
    }
  }

  function setPageBackgroundColor(color: string | null) {
    const next = normalizePageBackgroundColor(color);
    setPageBackgroundColorState(next);
    if (!persistTheme) return;
    if (next) {
      orgStorageSet(creativeStorageKeys.pageBackground, next);
    } else {
      orgStorageRemove(creativeStorageKeys.pageBackground);
    }
  }

  const fontTheme = getFontTheme(fontThemeId);
  const style = {
    "--font-sans": fontTheme.sans,
    "--font-serif": fontTheme.serif,
    ...(pageBackgroundColor ? { "--page-background": pageBackgroundColor } : {}),
  } as CSSProperties;

  return (
    <CreativeContext.Provider
      value={{
        fontThemeId,
        setFontThemeId,
        colorThemeId,
        setColorThemeId,
        pageBackgroundColor,
        setPageBackgroundColor,
      }}
    >
      <div
        className="creative-preview min-h-screen"
        data-color-theme={colorThemeId}
        data-page-background={pageBackgroundColor}
        style={style}
      >
        {children}
      </div>
    </CreativeContext.Provider>
  );
}
