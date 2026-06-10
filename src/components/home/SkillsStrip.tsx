"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

import { resume } from "@/content/resume";
import { prefersReducedMotion } from "@/lib/motion-preference";

gsap.registerPlugin(useGSAP);

export default function SkillsStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !trackRef.current) return;

      const track = trackRef.current;
      const width = track.scrollWidth / 2;

      gsap.to(track, {
        x: -width,
        duration: 30,
        ease: "none",
        repeat: -1,
      });
    },
    { scope: rootRef },
  );

  const items = [...resume.skills, ...resume.skills];

  return (
    <section ref={rootRef} className="overflow-hidden border-y border-border py-6">
      <div ref={trackRef} className="flex w-max gap-8 whitespace-nowrap px-4">
        {items.map((skill, i) => (
          <span
            key={`${skill}-${i}`}
            className="font-mono text-sm text-muted-foreground"
          >
            {skill}
            <span className="ml-8 text-border" aria-hidden>
              ◆
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
