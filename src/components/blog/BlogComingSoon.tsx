"use client";

import { useEffect, useState } from "react";

import { prefersReducedMotion } from "@/lib/motion-preference";

const BOOT_LINES = [
  "> initializing blog...",
  "> loading drafts... 16 found",
  "> status: coming back soon",
] as const;

const LINE_DELAY_MS = 420;

const WARM_COPY =
  "I'm rebuilding this space for longer-form notes on TypeScript, React, and web performance. Coming back soon.";

export default function BlogComingSoon() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisibleLines(BOOT_LINES.length);
      setShowCursor(false);
      return;
    }

    if (visibleLines >= BOOT_LINES.length) {
      setShowCursor(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setVisibleLines((count) => count + 1);
    }, LINE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [visibleLines]);

  useEffect(() => {
    if (prefersReducedMotion() || !showCursor) return;

    const interval = window.setInterval(() => {
      setShowCursor((on) => !on);
    }, 530);

    return () => window.clearInterval(interval);
  }, [showCursor, visibleLines]);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-mono text-4xl leading-[0.95] text-foreground md:text-6xl">
        Blog
      </h1>

      <div
        className="rounded-lg border border-border bg-muted/30 px-4 py-4 font-mono text-sm leading-relaxed text-muted-foreground md:px-5 md:py-5"
        aria-label="Blog status terminal"
      >
        {BOOT_LINES.slice(0, visibleLines).map((line) => (
          <p key={line} className="text-foreground">
            {line}
          </p>
        ))}
        {visibleLines < BOOT_LINES.length && (
          <p className="text-section-accent">
            <span aria-hidden>{showCursor ? "▌" : " "}</span>
          </p>
        )}
      </div>

      <p className="max-w-xl font-sans text-base text-muted-foreground md:text-lg">
        {WARM_COPY}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[20rem] border-collapse font-mono text-sm">
          <thead>
            <tr className="border-b border-border text-left text-label uppercase tracking-label text-section-accent">
              <th className="pb-3 pr-6 font-normal">title</th>
              <th className="pb-3 pr-6 font-normal">date</th>
              <th className="pb-3 font-normal">status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border text-muted-foreground">
              <td className="py-3 pr-6 italic text-foreground/70">
                untitled draft
              </td>
              <td className="py-3 pr-6">—</td>
              <td className="py-3 text-section-accent">coming back soon</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
