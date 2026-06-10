import clsx from "clsx";
import type { ComponentPropsWithoutRef, ElementType } from "react";

import { headingStyles } from "@/lib/typography";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span";

type HeadingProps<T extends HeadingTag = "h2"> = {
  as?: T;
  size?: keyof typeof headingStyles;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export default function Heading<T extends HeadingTag = "h2">({
  as,
  size = "md",
  className,
  ...props
}: HeadingProps<T>) {
  const Component = (as ?? "h2") as ElementType;

  return (
    <Component className={clsx(headingStyles[size], className)} {...props} />
  );
}
