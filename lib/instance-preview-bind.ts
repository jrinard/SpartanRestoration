"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
}: UseInstancePreviewSettingsOptions<T, K>) {
  const lockedToPublished = initialSettings !== undefined;
  const useInstanceStorage = Boolean(instanceId) && !globalOnly;

  const loadFromInstance = useCallback(
    (id: string): T | undefined => {
      if (globalOnly) return undefined;
      const stored = loadSectionInstanceField(id, field);
      if (!stored) return undefined;
      const normalized = normalizeValue(stored as T, normalize);
      return afterLoad ? afterLoad(normalized) : normalized;
    },
    [afterLoad, field, globalOnly, normalize],
  );

  const reload = useCallback((): T => {
    if (lockedToPublished && initialSettings !== undefined) {
      const normalized = normalizeValue(initialSettings, normalize);
      return afterLoad ? afterLoad(normalized) : normalized;
    }
    if (useInstanceStorage && instanceId) {
      const fromInstance = loadFromInstance(instanceId);
      if (fromInstance) return fromInstance;
    }
    const global = normalizeValue(loadGlobal(), normalize);
    return afterLoad ? afterLoad(global) : global;
  }, [
    afterLoad,
    initialSettings,
    instanceId,
    loadFromInstance,
    loadGlobal,
    lockedToPublished,
    normalize,
    useInstanceStorage,
  ]);

  const [settings, setSettingsState] = useState<T>(() => {
    if (initialSettings !== undefined) {
      const normalized = normalizeValue(initialSettings, normalize);
      return afterLoad ? afterLoad(normalized) : normalized;
    }
    if (globalOnly) {
      const global = normalizeValue(loadGlobal(), normalize);
      return afterLoad ? afterLoad(global) : global;
    }
    if (instanceId) {
      const fromInstance = loadSectionInstanceField(instanceId, field);
      if (fromInstance) {
        const normalized = normalizeValue(fromInstance as T, normalize);
        return afterLoad ? afterLoad(normalized) : normalized;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    setSettingsState(reload());
  }, [reload]);

  const setSettings = useCallback(
    (next: T) => {
      if (lockedToPublished) return;
      const normalized = normalizeValue(next, normalize);
      setSettingsState(normalized);
      if (useInstanceStorage && instanceId) {
        saveSectionInstanceField(
          instanceId,
          field,
          normalized as NonNullable<SectionInstanceSettings[K]>,
        );
        return;
      }
      saveGlobal(normalized);
    },
    [field, instanceId, lockedToPublished, normalize, saveGlobal, useInstanceStorage],
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
