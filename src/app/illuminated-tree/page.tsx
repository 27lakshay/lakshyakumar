// Full-bleed canvas — Main exception (see AGENTS.md).
import type { Metadata } from "next";

import { IlluminatedTree } from "@/components/tree";

export const metadata: Metadata = {
  title: "Illuminated Tree",
  description:
    "Full-screen illuminated tree canvas — cursor-following cell highlights on a procedural silhouette.",
};

export default function IlluminatedTreePage() {
  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <IlluminatedTree anchor="center" fillFactor={0.94} transparent={false} />
    </div>
  );
}
