/** grecaptcha.enterprise types for ContactForm. @see docs/recaptcha.md */
export {};

declare global {
  type GrecaptchaExecuteOptions = {
    action: string;
  };

  type GrecaptchaEnterprise = {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: GrecaptchaExecuteOptions) => Promise<string>;
  };

  interface Window {
    grecaptcha?: {
      enterprise: GrecaptchaEnterprise;
    };
  }
}
