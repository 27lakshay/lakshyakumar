/** Resolved Inter family from `--font-inter` (set by next/font on `<html>`). */
export function getInterFontFamily() {
  if (typeof document === "undefined") return "Inter, sans-serif";
  const family = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-inter")
    .trim();
  return family ? `${family}, sans-serif` : "Inter, sans-serif";
}
