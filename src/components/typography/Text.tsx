import clsx from "clsx";
import { createElement } from "react";
import type { ComponentPropsWithoutRef } from "react";

import { textStyles } from "@/lib/typography";

type TextTag = "p" | "span";

type TextProps<T extends TextTag = "p"> = {
  as?: T;
  variant?: keyof typeof textStyles;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

export default function Text<T extends TextTag = "p">({
  as,
  variant = "mono",
  className,
  ...props
}: TextProps<T>) {
  return createElement(as ?? "p", {
    className: clsx(textStyles[variant], className),
    ...props,
  });
}
