import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type MainProps = {
  children: ReactNode;
  className?: string;
};

export default function Main({ children, className }: MainProps) {
  return (
    <main
      className={cn(
        "relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 pt-24 md:px-4",
        className,
      )}
    >
      {children}
    </main>
  );
}
