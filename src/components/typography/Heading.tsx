import clsx from "clsx";
import { createElement } from "react";
import type { ComponentPropsWithoutRef } from "react";

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
  return createElement(as ?? "h2", {
    className: clsx(headingStyles[size], className),
    ...props,
  });
}
