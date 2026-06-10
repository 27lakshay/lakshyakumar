// Full-bleed canvas — Main exception (see AGENTS.md).
import type { Metadata } from "next";

import TreeShowcase from "@/components/tree/TreeShowcase";

export const metadata: Metadata = {
  title: "Tree",
  description:
    "Interactive canvas tree — six animation modes built with a custom heatmap renderer.",
};

export default function TreePage() {
  return <TreeShowcase />;
}
