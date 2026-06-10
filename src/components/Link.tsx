import NextLink from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export type LinkProps = ComponentProps<typeof NextLink> & {
  external?: boolean;
  underline?: boolean;
};

export default function Link({
  external,
  underline,
  className,
  target,
  rel,
  ...props
}: LinkProps) {
  return (
    <NextLink
      {...props}
      target={external ? (target ?? "_blank") : target}
      rel={external ? (rel ?? "noopener noreferrer") : rel}
      className={cn(
        "cursor-default",
        underline &&
          "relative inline-block after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-200 hover:after:scale-x-100",
        className,
      )}
    />
  );
}
