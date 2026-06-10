"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

import Link from "@/components/Link";
import { resume } from "@/content/resume";
import { prefersReducedMotion } from "@/lib/motion-preference";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Companies() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.from("[data-company-row]", {
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top 80%",
        },
        x: -40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });

      const rows = gsap.utils.toArray<HTMLElement>("[data-company-row]");
      rows.forEach((row) => {
        const name = row.querySelector("[data-company-name]");
        if (!name) return;

        row.addEventListener("mouseenter", () => {
          gsap.to(name, { x: 8, duration: 0.3, ease: "power2.out" });
        });
        row.addEventListener("mouseleave", () => {
          gsap.to(name, { x: 0, duration: 0.3, ease: "power2.out" });
        });
      });
    },
    { scope: rootRef },
  );

  return (
    <section ref={rootRef} className="py-24">
      <p className="mb-12 font-mono text-label uppercase tracking-label text-muted-foreground">
        Companies
      </p>
      <ul className="divide-y divide-border">
        {resume.companies.map((company) => (
          <li key={company.name} data-company-row className="group py-8">
            <div className="grid gap-4 md:grid-cols-[1fr_1.2fr] md:items-start md:gap-12">
              <Link
                href={company.href}
                external
                data-company-name
                trackEvent="Outbound Link"
                trackProps={{ label: company.name, location: "companies" }}
                className="font-mono text-[clamp(1.5rem,4vw,2.5rem)] leading-none transition-colors hover:text-foreground/80"
              >
                {company.name}
              </Link>
              <p className="font-sans text-base leading-relaxed text-muted-foreground md:pt-1">
                {company.about}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-10 font-mono text-sm text-muted-foreground">
        Full work history and impact metrics in{" "}
        <Link
          href="/resume.pdf"
          download
          underline
          trackEvent="Resume Download"
          trackProps={{ location: "companies" }}
          className="text-foreground"
        >
          résumé.pdf
        </Link>
      </p>
    </section>
  );
}
