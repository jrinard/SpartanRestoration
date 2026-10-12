"use client";

/** Contact form with reCAPTCHA Enterprise on submit. @see docs/recaptcha.md */
import { Fragment, useState, type FormEvent } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { useContactV1Preview } from "@/components/dev/ContactV1PreviewContext";
import { TextImageTextEditor } from "@/components/dev/TextImageTextEditor";
import { useRecaptcha } from "@/components/forms/RecaptchaProvider";
import { recaptchaAction } from "@/lib/recaptcha-config";
import {
  defaultContactFormFields,
  type ContactFormField,
} from "@/lib/contact-form-fields";
import {
  buildSmsOptInLeadMetadata,
  defaultContactButtonSettings,
  getContactSubmitButtonStyle,
  getEffectiveContactFormFields,
  getEffectiveContactSmsOptInSettings,
  getEffectiveLeadToEmail,
  hasCustomContactSubmitButton,
  isContactRecaptchaRequired,
  validateContactSmsOptIn,
  type ContactPreviewSettings,
} from "@/lib/contact-preview";
import { devEditButtonClassName, devEditIconSize } from "@/lib/dev-overlay-controls";
import { defaultContactSmsOptInLabel } from "@/lib/contact-sms-opt-in";
import {
  appendSmsOptInLeadFields,
  submitLead,
  type LeadFieldSubmission,
  type LeadPayload,
} from "@/lib/leads";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type ContactFormProps = {
  className?: string;
  settings?: ContactPreviewSettings;
  initialValues?: Record<string, string>;
};

function buildLegacyPayload(
  data: FormData,
  settings?: ContactPreviewSettings,
): LeadPayload {
  const smsSettings = getEffectiveContactSmsOptInSettings(settings);
  const smsMetadata = buildSmsOptInLeadMetadata(data, smsSettings);

  return {
    name: data.get("name") as string,
    businessName: data.get("businessName") as string,
    email: data.get("email") as string,
    phone: (data.get("phone") as string) || undefined,
    message: data.get("message") as string,
    ...smsMetadata,
  };
}

function buildDynamicPayload(
  data: FormData,
  fields: readonly ContactFormField[],
  settings?: ContactPreviewSettings,
): LeadFieldSubmission[] {
  const smsSettings = getEffectiveContactSmsOptInSettings(settings);
  const smsMetadata = buildSmsOptInLeadMetadata(data, smsSettings);
  const baseFields = fields.map((field) => ({
    name: field.name,
    label: field.label,
    value: String(data.get(field.name) ?? ""),
  }));

  return appendSmsOptInLeadFields(baseFields, smsMetadata);
}

function usesLegacyPayload(fields: readonly ContactFormField[]): boolean {
  if (fields.length !== defaultContactFormFields.length) return false;

  return fields.every((field, index) => {
    const legacy = defaultContactFormFields[index];
    return (
      field.name === legacy.name &&
      field.type === legacy.type &&
      field.required === legacy.required
    );
  });
}

function ContactSmsOptInLabel({ label }: { label: string }) {
  if (label !== defaultContactSmsOptInLabel) {
    return <span>{label}</span>;
  }

  return (
    <span>
      I agree to receive text messages regarding my inquiry, website audit, consultation, requested
      services, or project updates. Message frequency varies. Message and data rates may apply. Reply
      STOP to unsubscribe or HELP for assistance. Consent is not required to purchase services. By
      checking this box, I agree to the{" "}
      <Link href="/privacy" className="underline underline-offset-2">
        Privacy Policy
      </Link>{" "}
      and{" "}
      <Link href="/terms" className="underline underline-offset-2">
        Terms &amp; Conditions
      </Link>
      .
    </span>
  );
}

function renderSmsOptInCheckbox(
  smsOptInSettings: ReturnType<typeof getEffectiveContactSmsOptInSettings>,
) {
  return (
    <label className="contact-form-sms-opt-in flex items-start gap-3 text-xs leading-relaxed">
      <input
        type="checkbox"
        name="smsOptIn"
        value="yes"
        defaultChecked={smsOptInSettings.defaultChecked}
        className="contact-form-sms-opt-in-checkbox mt-0.5 shrink-0"
      />
      <ContactSmsOptInLabel label={smsOptInSettings.label} />
    </label>
  );
}

function renderField(
  field: ContactFormField,
  useCardFieldStyles: boolean,
  initialValues?: Record<string, string>,
) {
  const fieldClassName = useCardFieldStyles ? "contact-card-field" : undefined;
  const defaultValue = initialValues?.[field.name];

  const commonProps = {
    label: field.label,
    name: field.name,
    required: field.required,
    placeholder: field.placeholder || undefined,
    className: fieldClassName,
    defaultValue,
  };

  if (field.type === "textarea") {
    return <Textarea key={field.id} {...commonProps} />;
  }

  return (
    <Input
      key={field.id}
      {...commonProps}
      type={field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
    />
  );
}

export function ContactForm({ className, settings, initialValues }: ContactFormProps) {
  const { enabled: recaptchaEnabled, executeRecaptcha } = useRecaptcha();
  const preview = useContactV1Preview();
  const editingEnabled = preview?.contentEditingEnabled ?? false;
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [submitEditorOpen, setSubmitEditorOpen] = useState(false);

  const fields = settings ? getEffectiveContactFormFields(settings) : defaultContactFormFields;
  const smsOptInSettings = getEffectiveContactSmsOptInSettings(settings);
  const submitText = settings?.submitText ?? defaultContactButtonSettings.submitText;
  const useCustomSubmitButton = Boolean(settings && hasCustomContactSubmitButton(settings));
  const submitButtonStyle = useCustomSubmitButton && settings
    ? getContactSubmitButtonStyle(settings)
    : undefined;
  const useLegacySubmit = !settings || usesLegacyPayload(fields);
  const useCardFieldStyles = className?.includes("contact-card-form") ?? false;
  const effectiveSettings = settings ?? preview?.settings;
  const recaptchaRequired = isContactRecaptchaRequired(effectiveSettings);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);

    const smsValidationError = validateContactSmsOptIn(data, smsOptInSettings);
    if (smsValidationError) {
      setStatus("error");
      setMessage(smsValidationError);
      return;
    }

    let recaptchaToken: string | null = null;
    if (recaptchaEnabled && recaptchaRequired) {
      recaptchaToken = await executeRecaptcha(recaptchaAction);
      if (!recaptchaToken) {
        setStatus("error");
        setMessage("reCAPTCHA could not load. Please refresh and try again.");
        return;
      }
    }

    try {
      const payload = useLegacySubmit
        ? buildLegacyPayload(data, settings)
        : { fields: buildDynamicPayload(data, fields, settings) };

      const result = await submitLead(payload, {
        recaptchaToken,
        leadToEmail: getEffectiveLeadToEmail(settings),
      });

      if (result.success) {
        setStatus("success");
        setMessage(result.message);
        form.reset();
      } else {
        setStatus("error");
        setMessage(result.message);
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="grid gap-5">
        {fields.map((field) => (
          <Fragment key={field.id}>
            {renderField(field, useCardFieldStyles, initialValues)}
            {field.name === "phone" && smsOptInSettings.enabled
              ? renderSmsOptInCheckbox(smsOptInSettings)
              : null}
          </Fragment>
        ))}
      </div>

      <div className="mt-6">
        <div className={cn(editingEnabled && "relative inline-flex max-w-full pr-8")}>
          <button
            type="submit"
            disabled={status === "loading"}
            className={cn(
              "contact-form-submit inline-flex w-full items-center justify-center px-6 py-2.5 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue/50 disabled:pointer-events-none disabled:opacity-50 sm:w-auto",
              !settings && "radial-hover-shine bg-accent-blue text-white shadow-lg shadow-accent-blue/20",
            )}
            style={submitButtonStyle}
          >
            {status === "loading" ? "Submitting..." : submitText}
          </button>
          {editingEnabled && preview ? (
            <>
              <button
                type="button"
                onClick={() => setSubmitEditorOpen((open) => !open)}
                className={devEditButtonClassName}
                aria-label="Edit submit text"
                aria-expanded={submitEditorOpen}
              >
                <Pencil size={devEditIconSize} strokeWidth={2} />
              </button>
              {submitEditorOpen ? (
                <div className="absolute top-full left-0 z-50 mt-2">
                  <TextImageTextEditor
                    value={submitText}
                    dialogTitle="Submit text"
                    dialogAriaLabel="Edit submit text"
                    inputAriaLabel="Submit button text"
                    onChange={(value) => preview.setContentSubmitText(value)}
                    onClose={() => setSubmitEditorOpen(false)}
                  />
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      {recaptchaEnabled && recaptchaRequired && (
        <p className="contact-form-recaptcha mt-3 text-[0.65rem] leading-relaxed text-muted">
          This site is protected by reCAPTCHA and the Google{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Privacy Policy
          </a>{" "}
          and{" "}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Terms of Service
          </a>{" "}
          apply.
        </p>
      )}

      {status === "success" && (
        <p className="mt-4 text-sm text-accent-green-light">{message}</p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-red-400">{message}</p>
      )}
    </form>
  );
}
