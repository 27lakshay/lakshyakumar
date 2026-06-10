export const GEIST_PIXEL_FONTS = [
  {
    id: "square",
    variable: "--font-geist-pixel-square",
    label: "Geist Pixel Square",
    className: "font-pixel-square",
  },
  {
    id: "grid",
    variable: "--font-geist-pixel-grid",
    label: "Geist Pixel Grid",
    className: "font-pixel-grid",
  },
  {
    id: "circle",
    variable: "--font-geist-pixel-circle",
    label: "Geist Pixel Circle",
    className: "font-pixel-circle",
  },
  {
    id: "triangle",
    variable: "--font-geist-pixel-triangle",
    label: "Geist Pixel Triangle",
    className: "font-pixel-triangle",
  },
  {
    id: "line",
    variable: "--font-geist-pixel-line",
    label: "Geist Pixel Line",
    className: "font-pixel-line",
  },
] as const;

export const GEIST_PIXEL_FONT_VARIABLES = GEIST_PIXEL_FONTS.map(
  (font) => font.variable,
);

export type GeistPixelFontId = (typeof GEIST_PIXEL_FONTS)[number]["id"];

export function getGeistPixelFamily(variable: string) {
  if (typeof document === "undefined") return "monospace";
  const family = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();
  return family ? `${family}, monospace` : "monospace";
}

export function getGeistPixelFont(id: GeistPixelFontId) {
  const font = GEIST_PIXEL_FONTS.find((entry) => entry.id === id);
  if (!font) throw new Error(`Unknown Geist Pixel font: ${id}`);
  return font;
}
