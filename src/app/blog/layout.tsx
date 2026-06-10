import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Long-form notes on TypeScript, React, and web performance — coming back soon.",
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
