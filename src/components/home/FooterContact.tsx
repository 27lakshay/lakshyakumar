"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import CopyEmail from "@/components/home/CopyEmail";
import Link from "@/components/Link";
import { formatLastUpdated, mailtoHref, resume } from "@/content/resume";
import { prefersReducedMotion } from "@/lib/motion-preference";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function FooterContact() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !rootRef.current) return;

      gsap.from(rootRef.current, {
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 90%",
        },
        opacity: 0,
        y: 24,
        duration: 0.7,
        ease: "power3.out",
      });
    },
    { scope: rootRef },
  );

  const { identity, lastUpdated } = resume;

  return (
    <footer ref={rootRef} className="py-24">
      <p className="mb-6 font-mono text-[clamp(2rem,6vw,3.5rem)] leading-tight">
        Let&apos;s talk.
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <Link
          href={mailtoHref}
          underline
          trackEvent="Email Click"
          trackProps={{ location: "footer" }}
          className="font-mono text-lg text-foreground"
        >
          {identity.email}
        </Link>
        {identity.links.map((link) => {
          const isResume = link.href === "/resume.pdf";

          return (
            <Link
              key={link.label}
              href={link.href}
              external={!isResume}
              underline
              trackEvent={isResume ? "Resume Download" : "Outbound Link"}
              trackProps={
                isResume
                  ? { location: "footer" }
                  : { label: link.label, location: "footer" }
              }
              className="font-mono text-muted-foreground"
            >
              {link.label}
            </Link>
          );
        })}
        <CopyEmail email={identity.email} />
      </div>
      <p className="mt-8 font-mono text-xs text-muted-foreground">
        Updated {formatLastUpdated(lastUpdated)}
      </p>
    </footer>
  );
}
