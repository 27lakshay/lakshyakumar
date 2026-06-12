import type { ReactNode } from "react";

import Link from "@/components/Link";
import { PortfolioSkills } from "@/components/home/PortfolioSkillsBar";
import PortfolioLinks from "@/components/home/PortfolioLinks";
import { resume } from "@/content/resume";
import { outboundHref } from "@/lib/outbound";

const sectionLabelClass =
  "font-mono text-xs uppercase tracking-[0.2em] text-section-accent";

function SectionLabel({ children }: { children: ReactNode }) {
  return <p className={sectionLabelClass}>{children}</p>;
}

export function PortfolioHero() {
  const { identity } = resume;

  return (
    <div className="space-y-5">
      <h1 className="font-mono text-4xl leading-[0.95] text-foreground md:text-6xl">
        {identity.headline.join(" ")}
      </h1>
      <p className="font-sans text-base text-muted-foreground md:text-lg">
        {identity.tagline}
      </p>
      <p className="font-sans text-sm text-muted-foreground">
        {identity.availability} {identity.email}.
      </p>
      <PortfolioLinks />
    </div>
  );
}

export function PortfolioCompanies() {
  const { companies } = resume;

  return (
    <div className="space-y-5">
      <SectionLabel>Previously worked with</SectionLabel>
      <ul className="space-y-4">
        {companies.map((company) => (
          <li key={company.name}>
            <Link
              href={outboundHref(company.slug)}
              className="font-mono text-xl text-foreground transition-colors hover:opacity-80 md:text-2xl"
            >
              {company.name}
            </Link>
            <p className="font-sans text-sm text-muted-foreground">
              {company.about}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PortfolioContact() {
  const { identity } = resume;

  return (
    <div className="min-h-96 space-y-5 py-12 sm:py-16 md:py-20">
      <SectionLabel>Contact</SectionLabel>
      <p className="font-mono text-2xl text-foreground md:text-3xl">
        Let&apos;s talk.
      </p>
      <p className="font-sans text-base text-foreground">{identity.email}</p>
      <PortfolioLinks />
    </div>
  );
}

export default function PortfolioDetails() {
  return (
    <>
      <PortfolioHero />
      <PortfolioCompanies />
      <PortfolioSkills />
      <PortfolioContact />
    </>
  );
}

export { PortfolioSkills } from "@/components/home/PortfolioSkillsBar";
