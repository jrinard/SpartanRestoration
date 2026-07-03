"use client";

import { useEffect, useState } from "react";
import { usePlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import { cn } from "@/lib/utils";

const inputClassName =
  "min-w-[10rem] rounded border border-white/10 bg-[#12121c] px-3 py-2 font-mono text-sm text-white placeholder:text-white/35 focus:border-accent-purple/50 focus:outline-none";

const buttonClassName =
  "rounded border border-accent-purple/50 bg-accent-purple/10 px-3 py-2 font-mono text-xs tracking-wide text-accent-purple uppercase transition-colors hover:border-accent-purple hover:bg-accent-purple/20 disabled:cursor-not-allowed disabled:opacity-40";

const renameButtonClassName =
  "rounded border border-accent-purple bg-accent-purple/25 px-3 py-2 font-mono text-xs font-semibold tracking-wide text-white uppercase transition-colors hover:border-white hover:bg-accent-purple/40 disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-white/5 disabled:text-white/35";

const deleteButtonClassName =
  "rounded border border-red-500/40 bg-red-500/10 px-3 py-2 font-mono text-xs tracking-wide text-red-400 uppercase transition-colors hover:border-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40";

const selectClassName =
  "rounded border border-white/10 bg-[#12121c] px-3 py-2.5 font-mono text-sm text-white focus:border-accent-purple/50 focus:outline-none";

export function PlaygroundPageSelector() {
  const {
    pages,
    activePage,
    activePageId,
    setActivePageId,
    createPage,
    deletePage,
    renamePage,
    ready,
  } = usePlaygroundSections();
  const [newPageName, setNewPageName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const canDeleteActivePage = ready && activePage && !activePage.isHome;
  const canRenameActivePage = ready && activePage;
  const renameUnchanged = renameValue.trim() === activePage?.name;

  useEffect(() => {
    setRenameValue(activePage?.name ?? "");
    setConfirmDelete(false);
  }, [activePage?.id, activePage?.name]);

  const handleCreatePage = () => {
    const trimmed = newPageName.trim();
    if (!trimmed) return;

    createPage(trimmed);
    setNewPageName("");
    setConfirmDelete(false);
  };

  const handleRenamePage = () => {
    const trimmed = renameValue.trim();
    if (!trimmed || !canRenameActivePage || renameUnchanged) return;

    renamePage(activePageId, trimmed);
  };

  const handleDeletePage = () => {
    if (!canDeleteActivePage) return;
    deletePage(activePageId);
    setConfirmDelete(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm tracking-wide text-white/50 uppercase">Page</span>
        <select
          value={activePageId}
          onChange={(event) => {
            setActivePageId(event.target.value);
            setConfirmDelete(false);
          }}
          className={selectClassName}
          aria-label="Active playground page"
          disabled={!ready}
        >
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.name}
            </option>
          ))}
        </select>
      </label>

      {canRenameActivePage && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleRenamePage();
              }
            }}
            placeholder="Page name"
            className={inputClassName}
            aria-label="Rename page"
            disabled={!ready}
          />
          <button
            type="button"
            onClick={handleRenamePage}
            className={cn(renameButtonClassName)}
            disabled={!ready || renameUnchanged || renameValue.trim().length === 0}
          >
            Rename
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={newPageName}
          onChange={(event) => setNewPageName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleCreatePage();
            }
          }}
          placeholder="New page name"
          className={inputClassName}
          aria-label="New page name"
        />
        <button type="button" onClick={handleCreatePage} className={cn(buttonClassName)}>
          Add page
        </button>
      </div>

      {canDeleteActivePage &&
        (confirmDelete ? (
          <div
            className="flex flex-wrap items-center gap-2 rounded border border-red-500/30 bg-red-500/5 px-3 py-2"
            role="alertdialog"
            aria-labelledby="delete-page-prompt"
          >
            <p id="delete-page-prompt" className="font-mono text-xs text-white/80">
              Delete &ldquo;{activePage.name}&rdquo;? This cannot be undone.
            </p>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className={cn(buttonClassName, "text-white/70")}
            >
              Cancel
            </button>
            <button type="button" onClick={handleDeletePage} className={deleteButtonClassName}>
              Yes, delete
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className={deleteButtonClassName}
            aria-label={`Delete page ${activePage.name}`}
          >
            Delete page
          </button>
        ))}

      {activePage && !activePage.isHome && !confirmDelete && (
        <span className="font-mono text-xs text-white/40">/{activePage.slug}</span>
      )}
    </div>
  );
}
