import { outboundHref, type OutboundSlug } from "@/lib/outbound";

export type Company = {
  name: string;
  slug: OutboundSlug;
  about: string;
};

export type SkillGroup = {
  label: string;
  items: string[];
};

export type Metric = {
  value: number;
  suffix?: string;
  decimals?: number;
  label: string;
};

export const resume = {
  lastUpdated: "2026-02-04",
  identity: {
    name: "Lakshya Kumar",
    headline: ["Software", "Engineer"],
    availability:
      "Open to full-time roles & consulting work — drop an email at",
    tagline:
      "TypeScript · React · Node.js · Next.js · Web performance at scale",
    location: "Bengaluru, India",
    email: "lakshyakumar.developer@gmail.com",
    links: [
      { label: "LinkedIn", href: outboundHref("linkedin") },
      { label: "GitHub", href: outboundHref("github") },
      { label: "X (Twitter)", href: outboundHref("x") },
      { label: "Resume", href: "/resume" },
    ],
  },
  metrics: [
    { value: 1.5, suffix: "M+", decimals: 1, label: "extension installs" },
    { value: 4.8, suffix: "★", decimals: 1, label: "store rating" },
    { value: 3, suffix: "M+", decimals: 0, label: "monthly SEO visits" },
  ] satisfies Metric[],
  companies: [
    {
      name: "Deel",
      slug: "deel",
      about:
        "Global payroll and HR platform — hire, pay, and manage teams across 150+ countries.",
    },
    {
      name: "Merlin AI",
      slug: "merlin",
      about:
        "AI assistant for the web — browser extension and productivity tools used by millions daily.",
    },
    {
      name: "Groww",
      slug: "groww",
      about:
        "India's investment platform for stocks, mutual funds, and financial products.",
    },
    {
      name: "ScoopWhoop",
      slug: "scoopwhoop",
      about:
        "Digital media company — news, video, and culture content for young India.",
    },
  ] satisfies Company[],
  skills: [
    "TypeScript",
    "JavaScript",
    "React.js",
    "Next.js",
    "Node.js",
    "Browser Extensions",
    "Web Performance",
    "TanStack",
    "Zustand",
    "ShadCN",
    "Tailwind CSS",
    "Vite",
    "LLMs",
    "AI Agents",
    "Cursor",
    "Claude Code",
    "MCPs",
    "RAG",
  ],
} as const;

export const mailtoHref = `mailto:${resume.identity.email}?subject=${encodeURIComponent("Software Engineer — Lakshya Kumar")}&body=${encodeURIComponent("Hi Lakshya,\n\n")}`;

export function formatLastUpdated(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
