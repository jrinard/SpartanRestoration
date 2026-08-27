/**
 * Server-side reCAPTCHA verification (siteverify + Enterprise assessments).
 *
 * @see docs/recaptcha.md — read this before changing verification (agents: start here).
 */
import { recaptchaAction, recaptchaSiteKey } from "@/lib/recaptcha-config";

const MIN_SCORE = 0.5;
const SITE_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

type RecaptchaAssessmentResponse = {
  tokenProperties?: {
    valid?: boolean;
    action?: string;
    invalidReason?: string;
  };
  riskAnalysis?: {
    score?: number;
  };
  error?: {
    message?: string;
    code?: number;
  };
};

type SiteVerifyResponse = {
  success?: boolean;
  score?: number;
  action?: string;
  "error-codes"?: string[];
};

function isGoogleCloudApiKey(key: string): boolean {
  return key.startsWith("AIza");
}

function isRecaptchaSecretKey(key: string): boolean {
  return key.startsWith("6L");
}

export function isRecaptchaVerificationConfigured(): boolean {
  if (!recaptchaSiteKey) return false;

  const credential = process.env.RECAPTCHA_API_KEY_SECRET;
  if (!credential) return false;

  if (isGoogleCloudApiKey(credential)) {
    return Boolean(process.env.RECAPTCHA_PROJECT_ID);
  }

  return isRecaptchaSecretKey(credential);
}

function logVerificationFailure(method: string, details: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.error(`[reCAPTCHA] ${method} verification failed:`, details);
  }
}

async function verifyViaEnterpriseAssessment(
  token: string,
  expectedAction: string,
): Promise<boolean> {
  const projectId = process.env.RECAPTCHA_PROJECT_ID;
  const apiKey = process.env.RECAPTCHA_API_KEY_SECRET;

  if (!projectId || !apiKey) return false;

  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: {
        token,
        siteKey: recaptchaSiteKey,
        expectedAction,
      },
    }),
  });

  const data = (await response.json()) as RecaptchaAssessmentResponse;

  if (!response.ok) {
    logVerificationFailure("enterprise", data.error ?? data);
    return false;
  }

  if (!data.tokenProperties?.valid) {
    logVerificationFailure("enterprise", {
      invalidReason: data.tokenProperties?.invalidReason,
    });
    return false;
  }

  if (data.tokenProperties.action !== expectedAction) {
    logVerificationFailure("enterprise", {
      expectedAction,
      receivedAction: data.tokenProperties.action,
    });
    return false;
  }

  const score = data.riskAnalysis?.score;
  if (typeof score === "number" && score < MIN_SCORE) {
    logVerificationFailure("enterprise", { score, minScore: MIN_SCORE });
    return false;
  }

  return true;
}

async function verifyViaSiteverify(
  token: string,
  expectedAction: string,
): Promise<boolean> {
  const secret = process.env.RECAPTCHA_API_KEY_SECRET;
  if (!secret) return false;

  const response = await fetch(SITE_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret,
      response: token,
    }),
  });

  const data = (await response.json()) as SiteVerifyResponse;

  if (!response.ok || !data.success) {
    logVerificationFailure("siteverify", data["error-codes"] ?? data);
    return false;
  }

  if (data.action && data.action !== expectedAction) {
    logVerificationFailure("siteverify", {
      expectedAction,
      receivedAction: data.action,
    });
    return false;
  }

  if (typeof data.score === "number" && data.score < MIN_SCORE) {
    logVerificationFailure("siteverify", { score: data.score, minScore: MIN_SCORE });
    return false;
  }

  return true;
}

export async function verifyRecaptchaToken(
  token: string,
  expectedAction = recaptchaAction,
): Promise<boolean> {
  const credential = process.env.RECAPTCHA_API_KEY_SECRET;

  if (!credential || !recaptchaSiteKey) return true;
  if (!token) return false;

  if (isGoogleCloudApiKey(credential)) {
    return verifyViaEnterpriseAssessment(token, expectedAction);
  }

  if (isRecaptchaSecretKey(credential)) {
    return verifyViaSiteverify(token, expectedAction);
  }

  logVerificationFailure("config", "Unrecognized RECAPTCHA_API_KEY_SECRET format");
  return false;
}
