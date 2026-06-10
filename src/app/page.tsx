import Main from "@/components/Main";
import PortfolioDetails from "@/components/home/PortfolioDetails";
import LazyIlluminatedTree from "@/components/tree/LazyIlluminatedTree";
import { resume } from "@/content/resume";
import { outboundDestinations } from "@/lib/outbound";
import { siteConfig } from "@/lib/metadata";

export default function HomePage() {
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
    sameAs: [
      outboundDestinations.linkedin,
      outboundDestinations.github,
      outboundDestinations.x,
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Main className="gap-16">
        <PortfolioDetails />
      </Main>
      <footer className="relative z-10 h-72 w-full sm:h-80 md:h-96 lg:h-112">
        <LazyIlluminatedTree />
      </footer>
    </>
  );
}
