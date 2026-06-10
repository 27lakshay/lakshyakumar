import { track } from "@vercel/analytics";

type EventProps = Record<string, string | number | boolean>;

export function trackEvent(name: string, props?: EventProps) {
  if (process.env.NODE_ENV !== "production") return;
  track(name, props);
}
