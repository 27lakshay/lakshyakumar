import clsx from "clsx";
import type { ComponentPropsWithoutRef } from "react";

import { labelStyles } from "@/lib/typography";

type LabelProps = ComponentPropsWithoutRef<"span">;

export default function Label({ className, ...props }: LabelProps) {
  return <span className={clsx(labelStyles, className)} {...props} />;
}
