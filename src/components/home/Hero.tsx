"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import CopyEmail from "@/components/home/CopyEmail";
import {
  formatLastUpdated,
  mailtoHref,
  resume,
} from "@/content/resume";
import { prefersReducedMotion } from "@/lib/motion-preference";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero-line]", {
        y: 80,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
      })
        .from(
          "[data-hero-metric]",
          { opacity: 0, y: 20, duration: 0.6, stagger: 0.08 },
          "-=0.5",
        )
        .from(
          "[data-hero-cta]",
          { opacity: 0, y: 16, duration: 0.5, stagger: 0.06 },
          "-=0.3",
        );
    },
    { scope: rootRef },
  );

  const { identity, metrics, lastUpdated } = resume;

  return (
    <header
      ref={rootRef}
      className="relative flex min-h-[70vh] flex-col justify-end pb-16 pt-24"
    >
      <div className="relative space-y-10">
        <div className="space-y-0">
          {identity.headline.map((line) => (
            <h1
              key={line}
              data-hero-line
              className="font-mono text-[clamp(3rem,12vw,7rem)] leading-[0.9] tracking-tight"
            >
              {line}
            </h1>
          ))}
        </div>

        <p
          data-hero-line
          className="max-w-md font-sans text-lg text-muted-foreground"
        >
          {identity.tagline}
        </p>

        <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 font-mono text-sm text-muted-foreground">
          {metrics.map((metric, i) => (
            <span key={metric.label} className="inline-flex items-baseline gap-1">
              {i > 0 && (
                <span className="mr-4 text-border" aria-hidden>
                  /
                </span>
              )}
              <span data-hero-metric className="text-foreground tabular-nums">
                {metric.value}
                {metric.suffix}
              </span>
              <span data-hero-metric>{metric.label}</span>
            </span>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a
            data-hero-cta
            href={mailtoHref}
            className="group relative overflow-hidden rounded-full bg-foreground px-6 py-3 font-mono text-sm text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10">Email me</span>
          </a>
          <a
            data-hero-cta
            href="/resume.pdf"
            download
            className="rounded-full border border-border px-6 py-3 font-mono text-sm transition-colors hover:border-foreground/30 hover:bg-white/[0.03]"
          >
            Résumé · {formatLastUpdated(lastUpdated)}
          </a>
          <div data-hero-cta>
            <CopyEmail email={identity.email} />
          </div>
        </div>
      </div>
    </header>
  );
}
