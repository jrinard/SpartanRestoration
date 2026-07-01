"use client";

/** Contact form with reCAPTCHA Enterprise on submit. @see docs/recaptcha.md */
import { useState, type FormEvent } from "react";
import { useRecaptcha } from "@/components/forms/RecaptchaProvider";
import { recaptchaAction } from "@/lib/recaptcha-config";
import { submitLead } from "@/lib/leads";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

type ContactFormProps = {
  className?: string;
};

export function ContactForm({ className }: ContactFormProps) {
  const { enabled: recaptchaEnabled, executeRecaptcha } = useRecaptcha();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);

    let recaptchaToken: string | null = null;
    if (recaptchaEnabled) {
      recaptchaToken = await executeRecaptcha(recaptchaAction);
      if (!recaptchaToken) {
        setStatus("error");
        setMessage("reCAPTCHA could not load. Please refresh and try again.");
        return;
      }
    }

    try {
      const result = await submitLead(
        {
          name: data.get("name") as string,
          businessName: data.get("businessName") as string,
          email: data.get("email") as string,
          phone: (data.get("phone") as string) || undefined,
          message: data.get("message") as string,
        },
        { recaptchaToken },
      );

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
        <Input label="Name" name="name" required placeholder="Your name" />
        <Input
          label="Business Name"
          name="businessName"
          required
          placeholder="Your business name"
        />
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
        <Input label="Phone" name="phone" type="tel" placeholder="(optional)" />
        <Textarea
          label="Tell us where your business is today and where you'd like it to go."
          name="message"
          required
        />
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
          {status === "loading" ? "Submitting..." : "Submit"}
        </Button>
      </div>

      {recaptchaEnabled && (
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
