"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  publishHomepageConfigFromStorage,
  revertHomepageToConstruction,
  stageHomepageConfigFromStorage,
} from "@/lib/homepage-export-client";
import { HomepageVersionHistoryDialog } from "@/components/dev/HomepageVersionHistoryDialog";

const buttonClassName =
  "rounded border px-3 py-2 font-mono text-xs tracking-wide uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const stageClassName = `${buttonClassName} border-amber-400/50 bg-amber-400/10 text-amber-200 hover:border-amber-300 hover:bg-amber-400/20 hover:text-amber-100`;

const publishClassName = `${buttonClassName} border-accent-purple/60 bg-accent-purple/10 text-accent-purple hover:border-accent-purple hover:bg-accent-purple/20`;

const revertClassName = `${buttonClassName} border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10 hover:text-white`;

export function HomepageLaunchButtons() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function run(action: "stage" | "publish" | "revert") {
    setStatus("loading");
    setMessage(null);

    try {
      if (action === "stage") {
        await stageHomepageConfigFromStorage();
        setMessage("Saved to /preview. Commit and deploy for clients.");
      } else if (action === "publish") {
        await publishHomepageConfigFromStorage();
        setMessage("Published to /. Commit and deploy to go live.");
      } else {
        await revertHomepageToConstruction();
        setMessage("Back to under construction on /.");
      }

      router.refresh();
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Update failed.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <HomepageVersionHistoryDialog />
      <button
        type="button"
        onClick={() => run("revert")}
        disabled={status === "loading"}
        className={revertClassName}
      >
        {status === "loading" ? "Saving…" : "Back to construction"}
      </button>
      <button
        type="button"
        onClick={() => run("stage")}
        disabled={status === "loading"}
        className={stageClassName}
      >
        {status === "loading" ? "Saving…" : "Save to /preview"}
      </button>
      <button
        type="button"
        onClick={() => run("publish")}
        disabled={status === "loading"}
        className={publishClassName}
      >
        {status === "loading" ? "Publishing…" : "Publish to /"}
      </button>
      {message ? (
        <span
          className={`font-mono text-xs ${status === "error" ? "text-red-300" : "text-white/60"}`}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}
