"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { HomepageConfig } from "@/lib/homepage-config";
import {
  getHomepageConfigHistoryActionLabel,
  type HomepageConfigHistoryEntry,
} from "@/lib/homepage-config-history";
import { applyHomepageConfigToStorage } from "@/lib/homepage-import-client";
import { cn } from "@/lib/utils";

const buttonClassName =
  "rounded border px-3 py-2 font-mono text-xs tracking-wide uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const historyButtonClassName = `${buttonClassName} border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10 hover:text-white`;

function formatHistoryDate(savedAt: string): string {
  const date = new Date(savedAt);
  if (Number.isNaN(date.getTime())) return savedAt;

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function HomepageVersionHistoryDialog() {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<HomepageConfigHistoryEntry[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadEntries = useCallback(async () => {
    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/homepage-config/history");
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as { entries?: HomepageConfigHistoryEntry[] };
      setEntries(Array.isArray(data.entries) ? data.entries : []);
      setStatus("idle");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Failed to load version history.");
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    void loadEntries();
  }, [loadEntries, open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleLoad(entry: HomepageConfigHistoryEntry) {
    const confirmed = window.confirm(
      `Load "${getHomepageConfigHistoryActionLabel(entry.action)}" from ${formatHistoryDate(entry.savedAt)} into the playground? Current unsaved playground changes will be replaced.`,
    );
    if (!confirmed) return;

    setBusyId(entry.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/homepage-config/history/${entry.id}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as { config?: HomepageConfig };
      if (!data.config) {
        throw new Error("History snapshot is missing config data.");
      }

      applyHomepageConfigToStorage(data.config);
      setOpen(false);
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load version.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(entry: HomepageConfigHistoryEntry) {
    const confirmed = window.confirm(
      `Delete "${getHomepageConfigHistoryActionLabel(entry.action)}" from ${formatHistoryDate(entry.savedAt)}?`,
    );
    if (!confirmed) return;

    setBusyId(entry.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/homepage-config/history/${entry.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setEntries((current) => current.filter((candidate) => candidate.id !== entry.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to delete version.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={historyButtonClassName}
      >
        Version history
      </button>

      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close version history"
            onClick={() => setOpen(false)}
          />

          <div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="homepage-version-history-title"
            className="relative z-10 flex max-h-[min(80vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-white/15 bg-[#12121c] text-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2
                  id="homepage-version-history-title"
                  className="font-mono text-sm tracking-[0.2em] text-accent-purple uppercase"
                >
                  Version history
                </h2>
                <p className="mt-1 text-xs text-white/50">
                  Newest first. Load a version into the playground or delete it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-white/15 p-2 text-white/70 transition-colors hover:border-white/30 hover:text-white"
                aria-label="Close version history"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {status === "loading" && entries.length === 0 ? (
                <p className="font-mono text-xs text-white/50">Loading versions…</p>
              ) : null}

              {status === "error" && entries.length === 0 ? (
                <p className="font-mono text-xs text-red-300">{message}</p>
              ) : null}

              {entries.length === 0 && status === "idle" ? (
                <p className="font-mono text-xs text-white/50">
                  No saved versions yet. Use Save to /preview or Publish to / to create one.
                </p>
              ) : null}

              <ul className="space-y-3">
                {entries.map((entry) => {
                  const isBusy = busyId === entry.id;

                  return (
                    <li
                      key={entry.id}
                      className="flex items-start gap-3 rounded border border-white/10 bg-black/30 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-sm text-white">
                          {getHomepageConfigHistoryActionLabel(entry.action)}
                        </p>
                        <p className="mt-1 font-mono text-xs text-white/50">
                          {formatHistoryDate(entry.savedAt)}
                        </p>
                        <p className="mt-1 font-mono text-xs text-white/35">
                          {entry.sectionCount} sections · {entry.colorThemeId} theme
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleLoad(entry)}
                          className={cn(
                            buttonClassName,
                            "border-accent-purple/50 bg-accent-purple/10 text-accent-purple hover:border-accent-purple hover:bg-accent-purple/20",
                          )}
                        >
                          {isBusy ? "Loading…" : "Load"}
                        </button>
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => void handleDelete(entry)}
                          className={cn(
                            buttonClassName,
                            "border-white/15 px-2 py-2 text-white/50 hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-200",
                          )}
                          aria-label={`Delete version from ${formatHistoryDate(entry.savedAt)}`}
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {message && entries.length > 0 ? (
              <div className="border-t border-white/10 px-5 py-3">
                <p className="font-mono text-xs text-red-300">{message}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
