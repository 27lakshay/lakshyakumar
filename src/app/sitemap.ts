import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: siteConfig.url, lastModified },
    { url: `${siteConfig.url}/blog`, lastModified },
    { url: `${siteConfig.url}/wormhole`, lastModified },
    { url: `${siteConfig.url}/tree`, lastModified },
    { url: `${siteConfig.url}/illuminated-tree`, lastModified },
  ];
}
