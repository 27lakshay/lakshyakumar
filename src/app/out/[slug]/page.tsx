"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import Main from "@/components/Main";
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

  return (
    <Main className="gap-4 pb-16">
      <p className="font-mono text-sm text-muted-foreground">
        {destination ? "Redirecting…" : "Link not found."}
      </p>
      {destination ? (
        <p className="max-w-md font-sans text-xs text-muted-foreground/80">
          Analytics ain&apos;t cheap in this economy — you&apos;re being counted
          on the way out.
        </p>
      ) : null}
    </Main>
  );
}
