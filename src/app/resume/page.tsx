"use client";

import { useEffect } from "react";

export default function ResumePage() {
  useEffect(() => {
    window.location.replace("/resume.pdf");
  }, []);

  return (
    <p className="px-6 py-24 font-mono text-sm text-muted-foreground">
      Opening résumé…
    </p>
  );
}
