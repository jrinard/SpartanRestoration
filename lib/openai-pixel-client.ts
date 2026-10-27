import {
  OPENAI_PIXEL_CTA_ATTR,
  OPENAI_PIXEL_CUSTOM_CTA_EVENT,
  OPENAI_PIXEL_SDK_URL,
} from "@/lib/openai-pixel-preview";

function logPixelLoaded(): void {
  console.log(fakeMode ? "=== Pixel FAKE ===" : "=== Pixel Loaded ===");
}

function logPixelEvent(eventName: string): void {
  console.log(`=== pixel ${eventName} ===`);
}

type OaiqFn = {
  (...args: unknown[]): void;
  q?: unknown[];
};

declare global {
  interface Window {
    oaiq?: OaiqFn;
  }
}

let bootstrapStarted = false;
let initializedPixelId: string | null = null;
let fakeMode = false;
let fakePixelId: string | null = null;

/** Localhost dev: log events only, no SDK or network. */
export function setOpenAiPixelFakeMode(active: boolean, pixelId?: string | null): void {
  fakeMode = active;
  fakePixelId = active && pixelId?.trim() ? pixelId.trim() : null;
}

export function isOpenAiPixelFakeMode(): boolean {
  return fakeMode;
}

function getOaiq(): OaiqFn | null {
  if (typeof window === "undefined") return null;
  return window.oaiq ?? null;
}

function bootstrapQueue(): OaiqFn {
  if (typeof window === "undefined") {
    throw new Error("OpenAI Pixel requires a browser environment.");
  }
  if (window.oaiq) return window.oaiq;

  const q = function (...args: unknown[]) {
    (q.q as unknown[]).push(args);
  } as OaiqFn;
  q.q = [];
  window.oaiq = q;
  return q;
}

function loadSdkScript(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  const existing = document.querySelector(`script[src="${OPENAI_PIXEL_SDK_URL}"]`);
  if (existing) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const js = document.createElement("script");
    js.async = true;
    js.src = OPENAI_PIXEL_SDK_URL;
    js.onload = () => resolve();
    js.onerror = () => reject(new Error("Failed to load OpenAI Measurement Pixel SDK."));
    const first = document.getElementsByTagName("script")[0];
    if (first?.parentNode) {
      first.parentNode.insertBefore(js, first);
    } else {
      document.head.appendChild(js);
    }
  });
}

/** Load SDK once and init with pixel ID. Consent defaults to true (no opt-in gate). */
export async function ensureOpenAiPixelInitialized(pixelId: string): Promise<boolean> {
  const id = pixelId.trim();
  if (!id) return false;
  if (fakeMode && fakePixelId === id) return true;

  if (initializedPixelId === id && getOaiq()) return true;

  bootstrapQueue();
  if (!bootstrapStarted) {
    bootstrapStarted = true;
    await loadSdkScript();
  }

  const oaiq = getOaiq();
  if (!oaiq) return false;

  if (initializedPixelId !== id) {
    oaiq("init", { pixelId: id });
    initializedPixelId = id;
  }

  return true;
}

export function measureOpenAiPageViewed(pathname: string): void {
  if (fakeMode && fakePixelId) {
    logPixelLoaded();
    logPixelEvent("page_viewed");
    return;
  }

  const oaiq = getOaiq();
  if (!oaiq || !initializedPixelId) return;

  logPixelLoaded();
  const path = pathname.trim() || "/";
  oaiq("measure", "page_viewed", {
    type: "contents",
    contents: [
      {
        id: path,
        name: path,
        content_type: "page",
      },
    ],
  });
  logPixelEvent("page_viewed");
}

export function measureOpenAiLeadCreated(): void {
  if (fakeMode && fakePixelId) {
    logPixelEvent("lead_created");
    return;
  }

  const oaiq = getOaiq();
  if (!oaiq || !initializedPixelId) return;
  oaiq("measure", "lead_created", { type: "customer_action" });
  logPixelEvent("lead_created");
}

export function measureOpenAiCtaClicked(): void {
  if (fakeMode && fakePixelId) {
    logPixelEvent(OPENAI_PIXEL_CUSTOM_CTA_EVENT);
    return;
  }

  const oaiq = getOaiq();
  if (!oaiq || !initializedPixelId) return;
  oaiq(
    "measure",
    "custom",
    { type: "custom" },
    { custom_event_name: OPENAI_PIXEL_CUSTOM_CTA_EVENT },
  );
  logPixelEvent(OPENAI_PIXEL_CUSTOM_CTA_EVENT);
}

export function isTelHref(href: string | null | undefined): boolean {
  if (!href) return false;
  return href.trim().toLowerCase().startsWith("tel:");
}

export function isOpenAiPixelCtaClickTarget(element: Element): boolean {
  const marked = element.closest(`[${OPENAI_PIXEL_CTA_ATTR}]`);
  if (marked) return true;

  const anchor = element.closest("a[href]");
  if (anchor instanceof HTMLAnchorElement && isTelHref(anchor.getAttribute("href"))) {
    return true;
  }

  return false;
}
