export type Company = {
  name: string;
  href: string;
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
    tagline: "TypeScript · React · Node.js · Next.js · Web performance at scale",
    location: "Bengaluru, India",
    email: "lakshyakumar.developer@gmail.com",
    links: [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/lakshyakumar27/",
      },
      {
        label: "GitHub",
        href: "https://github.com/27lakshay",
      },
      {
        label: "X (Twitter)",
        href: "https://x.com/luxwashere",
      },
      {
        label: "Resume",
        href: "/resume",
      },
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
      href: "https://www.deel.com/",
      about:
        "Global payroll and HR platform — hire, pay, and manage teams across 150+ countries.",
    },
    {
      name: "Merlin AI",
      href: "https://www.getmerlin.in/",
      about:
        "AI assistant for the web — browser extension and productivity tools used by millions daily.",
    },
    {
      name: "Groww",
      href: "https://groww.in/",
      about:
        "India's investment platform for stocks, mutual funds, and financial products.",
    },
    {
      name: "ScoopWhoop",
      href: "https://www.scoopwhoop.com/",
      about:
        "Digital media company — news, video, and culture content for young India.",
    },
  ] satisfies Company[],
  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Browser Extensions",
    "Web Performance",
    "TanStack Query",
    "Tailwind",
    "Vite",
    "Monorepos",
    "LLMs",
  ],
} as const;

export const mailtoHref = `mailto:${resume.identity.email}?subject=${encodeURIComponent("Software Engineer — Lakshya Kumar")}&body=${encodeURIComponent("Hi Lakshya,\n\n")}`;

export function formatLastUpdated(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}
