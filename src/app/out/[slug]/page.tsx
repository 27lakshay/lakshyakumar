"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { isOutboundSlug, outboundDestinations } from "@/lib/outbound";

export default function OutboundPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const destination = isOutboundSlug(slug)
    ? outboundDestinations[slug]
    : null;

  useEffect(() => {
    if (destination) {
      window.location.replace(destination);
    }
  }, [destination]);

  if (!destination) {
    return (
      <p className="px-6 py-24 font-mono text-sm text-muted-foreground">
        Link not found.
      </p>
    );
  }

  return (
    <p className="px-6 py-24 font-mono text-sm text-muted-foreground">
      Redirecting…
    </p>
  );
}
