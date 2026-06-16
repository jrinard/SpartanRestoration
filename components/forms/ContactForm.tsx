"use client";

import { useState, type FormEvent } from "react";
import { submitLead } from "@/lib/leads";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

type ContactFormProps = {
  className?: string;
};

export function ContactForm({ className }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const result = await submitLead({
        name: data.get("name") as string,
        email: data.get("email") as string,
        phone: (data.get("phone") as string) || undefined,
        message: data.get("message") as string,
      });

      if (result.success) {
        setStatus("success");
        setMessage(result.message);
        form.reset();
      } else {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
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
          label="Email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
        />
        <Input label="Phone" name="phone" type="tel" placeholder="(optional)" />
        <Textarea
          label="Message"
          name="message"
          required
          placeholder="How can we help?"
        />
      </div>

      <div className="mt-6">
        <Button type="submit" disabled={status === "loading"} className="w-full sm:w-auto">
          {status === "loading" ? "Sending..." : "Send Message"}
        </Button>
      </div>

      {status === "success" && (
        <p className="mt-4 text-sm text-accent-green-light">{message}</p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-red-400">{message}</p>
      )}
    </form>
  );
}
