"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { colorThemes, getThemeColors } from "@/lib/color-themes";
import { fontThemes } from "@/lib/creative-themes";
import { useCreativeTheme } from "@/components/dev/CreativeProvider";
import { HomepageLaunchButtons } from "@/components/dev/HomepageLaunchButtons";
import { PlaygroundPageSelector } from "@/components/dev/PlaygroundPageSelector";
import { PlaygroundSectionsMenu } from "@/components/dev/PlaygroundSectionsMenu";
import { useOptionalPlaygroundSections } from "@/components/dev/PlaygroundSectionsProvider";
import { getPlaygroundModalOnlySections } from "@/lib/playground-modal-sections";
import type { ColorThemeId } from "@/lib/color-themes";
import type { FontThemeId } from "@/lib/creative-themes";
import { cn } from "@/lib/utils";

const selectClassName =
  "rounded border border-white/10 bg-[#12121c] px-3 py-2.5 font-mono text-sm text-white focus:border-accent-purple/50 focus:outline-none";

const navLinkClassName =
  "font-mono text-sm tracking-wide uppercase transition-colors hover:text-white";

/**
 * Internal preview toolbar — not for customer-facing pages.
 */
export function CreativeBar() {
  const pathname = usePathname();
  const { fontThemeId, setFontThemeId, colorThemeId, setColorThemeId } = useCreativeTheme();
  const swatches = getThemeColors(colorThemeId);
  const isPlayground = pathname === "/playground";
  const playground = useOptionalPlaygroundSections();
  const hasContactModalSection =
    isPlayground &&
    playground?.ready &&
    getPlaygroundModalOnlySections(playground.sections).length > 0;

  return (
    <div className="sticky top-0 z-50 border-b-4 border-white/10 bg-black text-white">
      <div className="flex min-h-[8rem] w-full flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 py-8 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <span className="font-mono text-xs tracking-[0.2em] text-accent-purple uppercase">
            Control Panel
          </span>

          <label className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm tracking-wide text-white/50 uppercase">Theme</span>
            <select
              value={colorThemeId}
              onChange={(e) => setColorThemeId(e.target.value as ColorThemeId)}
              className={selectClassName}
            >
              {colorThemes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm tracking-wide text-white/50 uppercase">Font</span>
            <select
              value={fontThemeId}
              onChange={(e) => setFontThemeId(e.target.value as FontThemeId)}
              className={selectClassName}
            >
              {fontThemes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.label}
                </option>
              ))}
            </select>
          </label>

          {isPlayground && (
            <>
              <PlaygroundPageSelector />
              <PlaygroundSectionsMenu />
              {hasContactModalSection && playground && (
                <button
                  type="button"
                  onClick={() =>
                    playground.setContactFormEditorOpen(!playground.contactFormEditorOpen)
                  }
                  className={cn(
                    selectClassName,
                    "inline-flex cursor-pointer items-center gap-1.5 transition-colors",
                    playground.contactFormEditorOpen &&
                      "border-accent-purple/60 text-accent-purple",
                  )}
                  aria-pressed={playground.contactFormEditorOpen}
                >
                  {playground.contactFormEditorOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  Edit Contact Form
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  playground?.setAnalyticsEditorOpen(!playground.analyticsEditorOpen)
                }
                className={cn(
                  selectClassName,
                  "inline-flex cursor-pointer items-center gap-1.5 transition-colors",
                  playground?.analyticsEditorOpen && "border-accent-purple/60 text-accent-purple",
                )}
                aria-pressed={playground?.analyticsEditorOpen ?? false}
              >
                {playground?.analyticsEditorOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                Edit Analytics
              </button>
            </>
          )}
        </div>

        {isPlayground && (
          <nav className="flex flex-wrap items-center gap-5">
            <HomepageLaunchButtons />
            <Link href="/" className={cn(navLinkClassName, "text-white/70")}>
              Home
            </Link>
            <Link
              href="/preview"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(navLinkClassName, "text-white/70")}
            >
              Preview
            </Link>
            <Link
              href="/playground"
              aria-current="page"
              className={cn(navLinkClassName, "text-accent-purple")}
            >
              Playground
            </Link>
          </nav>
        )}
      </div>

      <div className="border-t border-white/10 px-6 py-3 lg:px-8">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {swatches.map((swatch) => (
            <div key={`${swatch.label}-${swatch.hex}`} className="flex items-center gap-2">
              <span
                className="h-5 w-5 shrink-0 rounded border border-white/20"
                style={{ backgroundColor: swatch.hex }}
                aria-hidden="true"
              />
              <span className="font-mono text-xs text-white/80">{swatch.hex}</span>
              <span className="font-mono text-xs text-white/40">{swatch.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
