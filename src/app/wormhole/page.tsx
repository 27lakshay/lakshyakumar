import type { Metadata } from "next";

import ContentTunnel from "@/components/home/ContentTunnel";
import {
  PortfolioCompanies,
  PortfolioContact,
  PortfolioHero,
  PortfolioSkills,
} from "@/components/home/PortfolioDetails";
import { resume } from "@/content/resume";
import { siteConfig } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Wormhole",
  description:
    "Scroll-driven portfolio experiment — GSAP tunnel animation with a WebGL grid background.",
};

export default function WormholePage() {
  const { identity } = resume;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: identity.name,
    jobTitle: "Software Engineer",
    email: identity.email,
    url: siteConfig.url,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Bengaluru",
      addressCountry: "IN",
    },
    sameAs: identity.links.map((link) => link.href),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContentTunnel>
        <PortfolioHero />
        <PortfolioCompanies />
        <PortfolioSkills />
        <PortfolioContact />
      </ContentTunnel>
    </>
  );
}
