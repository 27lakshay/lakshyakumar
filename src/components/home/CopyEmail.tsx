"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { trackEvent } from "@/lib/analytics";

type CopyEmailProps = {
  email: string;
  className?: string;
};

export default function CopyEmail({ email, className }: CopyEmailProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      trackEvent("Email Copy", { location: "footer" });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-full border border-border px-5 py-3 font-mono text-sm transition-colors hover:border-foreground/30 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      }
      aria-live="polite"
    >
      {copied ? (
        <>
          <Check className="size-4 text-signal-green" aria-hidden />
          Copied
        </>
      ) : (
        <>
          <Copy className="size-4" aria-hidden />
          Copy email
        </>
      )}
    </button>
  );
}
