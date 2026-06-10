export const outboundDestinations = {
  linkedin: "https://www.linkedin.com/in/lakshyakumar27/",
  github: "https://github.com/27lakshay",
  x: "https://x.com/luxwashere",
  deel: "https://www.deel.com/",
  merlin: "https://www.getmerlin.in/",
  groww: "https://groww.in/",
  scoopwhoop: "https://www.scoopwhoop.com/",
} as const;

export type OutboundSlug = keyof typeof outboundDestinations;

export function outboundHref(slug: OutboundSlug) {
  return `/out/${slug}`;
}

export function isOutboundSlug(slug: string): slug is OutboundSlug {
  return slug in outboundDestinations;
}
