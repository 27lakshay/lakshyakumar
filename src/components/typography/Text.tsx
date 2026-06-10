import clsx from "clsx";
import type { ComponentPropsWithoutRef, ElementType } from "react";

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
  const Component = (as ?? "p") as ElementType;

  return (
    <Component className={clsx(textStyles[variant], className)} {...props} />
  );
}
