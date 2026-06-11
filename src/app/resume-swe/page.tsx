"use client";

import { useEffect } from "react";

import Main from "@/components/Main";

export default function ResumeSwePage() {
  useEffect(() => {
    window.location.replace("/resume-swe.pdf");
  }, []);

  return (
    <Main className="gap-4 pb-16">
      <p className="font-mono text-sm text-muted-foreground">Opening résumé…</p>
      <p className="max-w-md font-sans text-xs text-muted-foreground/80">
        Analytics ain&apos;t cheap in this economy — you&apos;re being counted on
        the way out.
      </p>
    </Main>
  );
}
