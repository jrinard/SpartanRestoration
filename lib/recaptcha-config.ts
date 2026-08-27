/**
 * reCAPTCHA config — all credentials come from env (clone-friendly: swap .env.local per site).
 *
 * @see docs/recaptcha.md — read this before changing reCAPTCHA setup (agents: start here).
 */
/** Public site key — safe for the browser. */
export const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

/** Must match the action passed to grecaptcha.enterprise.execute on the client. */
export const recaptchaAction = process.env.RECAPTCHA_ACTION ?? "contact_form";

export function isRecaptchaEnabled(): boolean {
  return recaptchaSiteKey.length > 0;
}
