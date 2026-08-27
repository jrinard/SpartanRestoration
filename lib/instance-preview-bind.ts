"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SectionInstanceSettings } from "@/lib/section-instance-storage";
import {
  loadSectionInstanceField,
  saveSectionInstanceField,
} from "@/lib/section-instance-storage";

type UseInstancePreviewSettingsOptions<T, K extends keyof SectionInstanceSettings> = {
  instanceId?: string;
  field: K;
  initialSettings?: T;
  defaultSettings: T;
  loadGlobal: () => T;
  saveGlobal: (settings: T) => void;
  normalize?: (settings: T) => T;
  /** Transform after load (e.g. merge global nav links into instance settings). */
  afterLoad?: (settings: T) => T;
  /** When true, ignore per-slot instance storage — one shared setting everywhere (e.g. nav bar). */
  globalOnly?: boolean;
  /** When true, read/write global storage instead of per-instance (e.g. footer-v1 Global mode). */
  getGlobalOnly?: () => boolean;
  /** When true for the settings being saved, persist globally (handles toggle race). */
  settingsUseGlobal?: (settings: T) => boolean;
  /** Called after persisting to global storage (e.g. sync other page instances). */
  onGlobalSave?: (settings: T) => void;
};

function normalizeValue<T>(value: T, normalize?: (settings: T) => T): T {
  return normalize ? normalize(value) : value;
}

/** React hook for preview providers scoped to a playground section slot. */
export function useInstancePreviewSettings<T, K extends keyof SectionInstanceSettings>({
  instanceId,
  field,
  initialSettings,
  defaultSettings,
  loadGlobal,
  saveGlobal,
  normalize,
  afterLoad,
  globalOnly = false,
  getGlobalOnly,
  settingsUseGlobal,
  onGlobalSave,
}: UseInstancePreviewSettingsOptions<T, K>) {
  const lockedToPublished = initialSettings !== undefined;

  const getGlobalOnlyRef = useRef(getGlobalOnly);
  const settingsUseGlobalRef = useRef(settingsUseGlobal);
  const onGlobalSaveRef = useRef(onGlobalSave);
  const afterLoadRef = useRef(afterLoad);

  getGlobalOnlyRef.current = getGlobalOnly;
  settingsUseGlobalRef.current = settingsUseGlobal;
  onGlobalSaveRef.current = onGlobalSave;
  afterLoadRef.current = afterLoad;

  const readUsesGlobalStorage = useCallback(() => {
    return globalOnly || (getGlobalOnlyRef.current?.() ?? false);
  }, [globalOnly]);

  const reload = useCallback((): T => {
    const transform = afterLoadRef.current;
    if (lockedToPublished && initialSettings !== undefined) {
      const normalized = normalizeValue(initialSettings, normalize);
      return transform ? transform(normalized) : normalized;
    }
    if (readUsesGlobalStorage()) {
      const global = normalizeValue(loadGlobal(), normalize);
      return transform ? transform(global) : global;
    }
    if (instanceId) {
      const stored = loadSectionInstanceField(instanceId, field);
      if (stored) {
        const normalized = normalizeValue(stored as T, normalize);
        return transform ? transform(normalized) : normalized;
      }
    }
    const global = normalizeValue(loadGlobal(), normalize);
    return transform ? transform(global) : global;
  }, [
    field,
    initialSettings,
    instanceId,
    loadGlobal,
    lockedToPublished,
    normalize,
    readUsesGlobalStorage,
  ]);

  const [settings, setSettingsState] = useState<T>(() => reload());

  useEffect(() => {
    setSettingsState(reload());
  }, [instanceId, lockedToPublished, globalOnly, reload]);

  const setSettings = useCallback(
    (next: T) => {
      if (lockedToPublished) return;
      const normalized = normalizeValue(next, normalize);
      setSettingsState(normalized);
      const persistGlobally =
        globalOnly ||
        (settingsUseGlobalRef.current?.(normalized) ?? false) ||
        readUsesGlobalStorage();
      if (persistGlobally) {
        saveGlobal(normalized);
        onGlobalSaveRef.current?.(normalized);
        return;
      }
      if (instanceId) {
        saveSectionInstanceField(
          instanceId,
          field,
          normalized as NonNullable<SectionInstanceSettings[K]>,
        );
        onGlobalSaveRef.current?.(normalized);
        return;
      }
      saveGlobal(normalized);
      onGlobalSaveRef.current?.(normalized);
    },
    [
      field,
      globalOnly,
      instanceId,
      lockedToPublished,
      normalize,
      readUsesGlobalStorage,
      saveGlobal,
    ],
  );

  const refreshFromStorage = useCallback(() => {
    setSettingsState(reload());
  }, [reload]);

  return useMemo(
    () => ({
      settings,
      setSettings,
      lockedToPublished,
      reload,
      refreshFromStorage,
    }),
    [lockedToPublished, refreshFromStorage, reload, setSettings, settings],
  );
}

/** @deprecated Use useInstancePreviewSettings */
export function createInstancePreviewHandlers<T, K extends keyof SectionInstanceSettings>(
  options: UseInstancePreviewSettingsOptions<T, K>,
) {
  const lockedToPublished = options.initialSettings !== undefined;
  const { normalize, afterLoad } = options;

  const loadFromInstance = (id: string): T | undefined => {
    const stored = loadSectionInstanceField(id, options.field);
    if (!stored) return undefined;
    const normalized = normalizeValue(stored as T, normalize);
    return afterLoad ? afterLoad(normalized) : normalized;
  };

  const getInitialState = (): T => {
    if (options.initialSettings !== undefined) {
      const normalized = normalizeValue(options.initialSettings, normalize);
      return afterLoad ? afterLoad(normalized) : normalized;
    }
    if (options.instanceId) {
      return loadFromInstance(options.instanceId) ?? options.defaultSettings;
    }
    return options.defaultSettings;
  };

  const reload = (): T => {
    if (lockedToPublished && options.initialSettings !== undefined) {
      const normalized = normalizeValue(options.initialSettings, normalize);
      return afterLoad ? afterLoad(normalized) : normalized;
    }
    if (options.instanceId) {
      return loadFromInstance(options.instanceId) ?? normalizeValue(options.loadGlobal(), normalize);
    }
    return normalizeValue(options.loadGlobal(), normalize);
  };

  const persist = (next: T) => {
    if (lockedToPublished) return;
    const normalized = normalizeValue(next, normalize);
    if (options.instanceId) {
      saveSectionInstanceField(
        options.instanceId,
        options.field,
        normalized as NonNullable<SectionInstanceSettings[K]>,
      );
      return;
    }
    options.saveGlobal(normalized);
  };

  return { lockedToPublished, getInitialState, reload, persist };
}
