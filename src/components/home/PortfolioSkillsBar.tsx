"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { resume } from "@/content/resume";

const LightBar = dynamic(() => import("@/components/light-bar/LightBar"), {
  ssr: false,
});

const sectionLabelClass =
  "font-mono text-xs uppercase tracking-[0.2em] text-section-accent";

const skillsTicker = resume.skills.join(" * ");

function SkillsLightBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className={cn(
        "h-full transition-opacity duration-700 ease-in motion-reduce:opacity-100 motion-reduce:transition-none",
        visible ? "opacity-100" : "opacity-0",
      )}
    >
      <LightBar messages={[skillsTicker]} className="light-bar--full-bleed" />
    </div>
  );
}

export function PortfolioSkills() {
  return (
    <div className="space-y-5">
      <p className={sectionLabelClass}>Skills</p>
      <div className="relative right-1/2 left-1/2 mr-[-50vw] ml-[-50vw] h-24 w-screen max-w-none">
        <SkillsLightBar />
      </div>
    </div>
  );
}
