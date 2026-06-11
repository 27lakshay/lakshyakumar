"use client";

import dynamic from "next/dynamic";

import { resume } from "@/content/resume";

const LightBar = dynamic(() => import("@/components/light-bar/LightBar"), {
  ssr: false,
});

const sectionLabelClass =
  "font-mono text-xs uppercase tracking-[0.2em] text-section-accent";

const skillsTicker = resume.skills.join(", ");

export function PortfolioSkills() {
  return (
    <div className="space-y-5">
      <p className={sectionLabelClass}>Skills</p>
      <div className="relative right-1/2 left-1/2 -mr-[50vw] -ml-[50vw] w-screen max-w-none">
        <LightBar messages={[skillsTicker]} className="light-bar--full-bleed" />
      </div>
    </div>
  );
}
