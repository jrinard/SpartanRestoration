"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  defaultTopBarPreviewSettings,
  type TopBarPreviewSettings,
} from "@/lib/top-bar-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadTopBarPreviewSettings,
  normalizeTopBarPreviewSettings,
  saveTopBarPreviewSettings,
} from "@/lib/top-bar-preview-storage";

type TopBarPreviewContextValue = {
  settings: TopBarPreviewSettings;
  setSettings: (settings: TopBarPreviewSettings) => void;
};

const TopBarPreviewContext = createContext<TopBarPreviewContextValue | null>(null);

type TopBarPreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: TopBarPreviewSettings;
};

export function TopBarPreviewProvider({
  children,
  instanceId,
  initialSettings,
}: TopBarPreviewProviderProps) {
  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "topBar",
    initialSettings,
    defaultSettings: defaultTopBarPreviewSettings,
    loadGlobal: loadTopBarPreviewSettings,
    saveGlobal: saveTopBarPreviewSettings,
    normalize: normalizeTopBarPreviewSettings,
  });

  return (
    <TopBarPreviewContext.Provider value={{ settings, setSettings }}>
      {children}
    </TopBarPreviewContext.Provider>
  );
}

export function useTopBarPreview() {
  return useContext(TopBarPreviewContext);
}
