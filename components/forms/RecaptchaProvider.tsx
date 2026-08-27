"use client";

/**
 * Loads reCAPTCHA Enterprise in the browser and exposes executeRecaptcha().
 *
 * @see docs/recaptcha.md — read this before changing client integration (agents: start here).
 */
import Script from "next/script";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isRecaptchaEnabled,
  recaptchaAction,
  recaptchaSiteKey,
} from "@/lib/recaptcha-config";

type RecaptchaContextValue = {
  enabled: boolean;
  ready: boolean;
  executeRecaptcha: (action?: string) => Promise<string | null>;
};

const RecaptchaContext = createContext<RecaptchaContextValue>({
  enabled: false,
  ready: false,
  executeRecaptcha: async () => null,
});

export function useRecaptcha() {
  return useContext(RecaptchaContext);
}

const RECAPTCHA_LOAD_TIMEOUT_MS = 10_000;

function waitForRecaptchaEnterprise(): Promise<boolean> {
  return new Promise((resolve) => {
    const deadline = Date.now() + RECAPTCHA_LOAD_TIMEOUT_MS;

    const tryReady = () => {
      if (window.grecaptcha?.enterprise) {
        window.grecaptcha.enterprise.ready(() => resolve(true));
        return;
      }

      if (Date.now() >= deadline) {
        resolve(false);
        return;
      }

      window.setTimeout(tryReady, 100);
    };

    tryReady();
  });
}

export function RecaptchaProvider({ children }: { children: ReactNode }) {
  const enabled = isRecaptchaEnabled();
  const [ready, setReady] = useState(false);

  const handleScriptLoad = useCallback(async () => {
    const loaded = await waitForRecaptchaEnterprise();
    setReady(loaded);
  }, []);

  const executeRecaptcha = useCallback(
    async (action = recaptchaAction) => {
      if (!enabled) return null;

      const loaded = ready || (await waitForRecaptchaEnterprise());
      if (!loaded || !window.grecaptcha?.enterprise) return null;

      try {
        return await window.grecaptcha.enterprise.execute(recaptchaSiteKey, { action });
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("[reCAPTCHA] execute failed:", error);
        }
        return null;
      }
    },
    [enabled, ready],
  );

  const value = useMemo(
    () => ({ enabled, ready, executeRecaptcha }),
    [enabled, ready, executeRecaptcha],
  );

  return (
    <RecaptchaContext.Provider value={value}>
      {enabled && (
        <Script
          src={`https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}`}
          strategy="afterInteractive"
          onLoad={handleScriptLoad}
          onError={() => {
            if (process.env.NODE_ENV === "development") {
              console.error("[reCAPTCHA] Failed to load enterprise.js — check domain list includes localhost");
            }
            setReady(false);
          }}
        />
      )}
      {children}
    </RecaptchaContext.Provider>
  );
}
