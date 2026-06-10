import type { Metadata } from "next";

export const siteConfig = {
  name: "Lakshya Kumar",
  title: "Lakshya Kumar — Software Engineer",
  description:
    "Senior frontend engineer. 1.5M+ Chrome extension installs, founding frontend at Merlin AI, currently at Deel. Open to senior frontend roles.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lakshya.work",
};

export const baseMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};
