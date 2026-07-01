"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type {
  ServicesV1Background,
  ServicesV1GradientDirection,
} from "@/components/sections/Services-v1";
import { previewGradientDirections } from "@/lib/preview-gradient";
import {
  defaultServicesV1LayoutWidth,
  servicesV1LayoutWidths,
  type ServicesV1LayoutWidth,
} from "@/lib/services-v1-preview";
import {
  loadServicesV1LayoutWidth,
  saveServicesV1LayoutWidth,
} from "@/lib/services-v1-preview-storage";

type ServicesV1LayoutContextValue = {
  layoutWidth: ServicesV1LayoutWidth;
  setLayoutWidth: (layoutWidth: ServicesV1LayoutWidth) => void;
  background: ServicesV1Background;
  setBackground: (background: ServicesV1Background) => void;
};

const defaultBackground: ServicesV1Background = {
  from: "#06060e",
  to: "#12121c",
  direction: "to bottom",
};

const gradientDirections = previewGradientDirections;

const ServicesV1LayoutContext = createContext<ServicesV1LayoutContextValue | null>(null);

export function ServicesV1LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutWidth, setLayoutWidthState] = useState<ServicesV1LayoutWidth>(
    defaultServicesV1LayoutWidth,
  );
  const [background, setBackground] = useState<ServicesV1Background>(defaultBackground);

  useEffect(() => {
    setLayoutWidthState(loadServicesV1LayoutWidth());
  }, []);

  const setLayoutWidth = useCallback((next: ServicesV1LayoutWidth) => {
    setLayoutWidthState(next);
    saveServicesV1LayoutWidth(next);
  }, []);

  return (
    <ServicesV1LayoutContext.Provider
      value={{ layoutWidth, setLayoutWidth, background, setBackground }}
    >
      {children}
    </ServicesV1LayoutContext.Provider>
  );
}

export function useServicesV1Layout() {
  return useContext(ServicesV1LayoutContext);
}

const selectClassName =
  "section-switcher-select rounded border border-accent-purple/40 bg-background/90 px-2 py-1 font-mono text-sm text-accent-purple backdrop-blur-sm focus:border-accent-purple focus:outline-none";

const colorInputClassName =
  "h-8 w-8 cursor-pointer rounded border border-accent-purple/40 bg-background/90 p-0.5";

export function ServicesV1LayoutSelect() {
  const context = useServicesV1Layout();
  if (!context) return null;

  return (
    <label className="flex items-center gap-2">
      <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">Width</span>
      <select
        value={context.layoutWidth}
        onChange={(event) =>
          context.setLayoutWidth(event.target.value as ServicesV1LayoutWidth)
        }
        className={selectClassName}
        aria-label="Services layout width"
      >
        {servicesV1LayoutWidths.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ServicesV1BackgroundSelects() {
  const context = useServicesV1Layout();
  if (!context) return null;

  return (
    <>
      <label className="flex items-center gap-1.5">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 1</span>
        <input
          type="color"
          value={context.background.from}
          onChange={(event) =>
            context.setBackground({ ...context.background, from: event.target.value })
          }
          className={colorInputClassName}
          aria-label="Services v1 background gradient start color"
        />
      </label>
      <label className="flex items-center gap-1.5">
        <span className="font-mono text-xs tracking-wide text-accent-purple uppercase">BG 2</span>
        <input
          type="color"
          value={context.background.to}
          onChange={(event) =>
            context.setBackground({ ...context.background, to: event.target.value })
          }
          className={colorInputClassName}
          aria-label="Services v1 background gradient end color"
        />
      </label>
      <select
        value={context.background.direction}
        onChange={(event) =>
          context.setBackground({
            ...context.background,
            direction: event.target.value as ServicesV1GradientDirection,
          })
        }
        className={selectClassName}
        aria-label="Services v1 background gradient direction"
      >
        {gradientDirections.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </>
  );
}
