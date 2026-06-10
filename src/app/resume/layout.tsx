import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Résumé",
  robots: { index: false, follow: false },
};

export default function ResumeLayout({ children }: { children: ReactNode }) {
  return children;
}
