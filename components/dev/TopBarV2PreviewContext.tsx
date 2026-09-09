"use client";

import { createContext, useContext, type ReactNode } from "react";
import {
  defaultTopBarV2PreviewSettings,
  type TopBarV2PreviewSettings,
} from "@/lib/top-bar-v2-preview";
import { useInstancePreviewSettings } from "@/lib/instance-preview-bind";
import {
  loadTopBarV2PreviewSettings,
  normalizeTopBarV2PreviewSettings,
  saveTopBarV2PreviewSettings,
} from "@/lib/top-bar-v2-preview-storage";

type TopBarV2PreviewContextValue = {
  settings: TopBarV2PreviewSettings;
  setSettings: (settings: TopBarV2PreviewSettings) => void;
  contentEditingEnabled: boolean;
};

const TopBarV2PreviewContext = createContext<TopBarV2PreviewContextValue | null>(null);

type TopBarV2PreviewProviderProps = {
  children: ReactNode;
  instanceId?: string;
  initialSettings?: TopBarV2PreviewSettings;
  enableContentEditing?: boolean;
};

export function TopBarV2PreviewProvider({
  children,
  instanceId,
  initialSettings,
  enableContentEditing = false,
}: TopBarV2PreviewProviderProps) {
  const { settings, setSettings } = useInstancePreviewSettings({
    instanceId,
    field: "topBarV2",
    initialSettings,
    defaultSettings: defaultTopBarV2PreviewSettings,
    loadGlobal: loadTopBarV2PreviewSettings,
    saveGlobal: saveTopBarV2PreviewSettings,
    normalize: normalizeTopBarV2PreviewSettings,
    globalOnly: true,
  });

  return (
    <TopBarV2PreviewContext.Provider
      value={{ settings, setSettings, contentEditingEnabled: enableContentEditing }}
    >
      {children}
    </TopBarV2PreviewContext.Provider>
  );
}

export function useTopBarV2Preview() {
  return useContext(TopBarV2PreviewContext);
}
