"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type RefObject,
} from "react";

import { prefersReducedMotion } from "@/lib/motion-preference";
import { cn } from "@/lib/utils";

import "./LightBar.css";

// --- types ---

export type LightBarDirection = "ltr" | "rtl";

export type LightBarGlowSettings = {
  /** 0–100 — bleed strength and color lift on neighbor dots */
  diffuse: number;
  /** 1–3 — square rings around a lit dot that can glow */
  spread: number;
};

export type LightBarGlassSettings = {
  /** 0–100 — frosted lens opacity */
  frost: number;
  /** 0–100 — top specular arc strength */
  topGlare: number;
  /** 0–100 — bottom specular arc strength */
  bottomGlare: number;
};

export type LightBarAppearance = {
  paletteId: string;
  /** 0–100 — lit glyph body level (maps to 0.55–0.95 mix) */
  characterBrightness: number;
  /** 3–6 — LED cell diameter in CSS px */
  cellSize: number;
  glow: LightBarGlowSettings;
  glass: LightBarGlassSettings;
};

export type LightBarProps = {
  messages: string[];
  direction?: LightBarDirection;
  speed?: number;
  appearance?: Partial<LightBarAppearance>;
  cycleColorOnClick?: boolean;
  className?: string;
  separator?: string;
};

// --- defaults ---

export const DEFAULT_LIGHT_BAR_APPEARANCE: LightBarAppearance = {
  paletteId: "amber",
  characterBrightness: 80,
  cellSize: 4,
  glow: { diffuse: 90, spread: 3 },
  glass: { frost: 22, topGlare: 26, bottomGlare: 20 },
};

// --- palettes ---

type LightBarPalette = {
  id: string;
  label: string;
  offFill: string;
  onBody: string;
  onCore: string;
};

const LIGHT_BAR_PALETTES: readonly LightBarPalette[] = [
  {
    id: "amber",
    label: "Amber",
    offFill: "#2e2824",
    onBody: "#f0a018",
    onCore: "#ffc830",
  },
  {
    id: "teal",
    label: "Teal",
    offFill: "#1c2a28",
    onBody: "#20c4b0",
    onCore: "#5eead4",
  },
  {
    id: "violet",
    label: "Violet",
    offFill: "#222030",
    onBody: "#6878f0",
    onCore: "#98b0ff",
  },
  {
    id: "red",
    label: "Ticker red",
    offFill: "#2a201c",
    onBody: "#e84838",
    onCore: "#ff6858",
  },
] as const;

function getPaletteById(id: string): LightBarPalette {
  return LIGHT_BAR_PALETTES.find((p) => p.id === id) ?? LIGHT_BAR_PALETTES[0]!;
}

function nextLightBarPalette(current: LightBarPalette): LightBarPalette {
  const index = LIGHT_BAR_PALETTES.findIndex((p) => p.id === current.id);
  const next = index < 0 ? 0 : (index + 1) % LIGHT_BAR_PALETTES.length;
  return LIGHT_BAR_PALETTES[next]!;
}

function nextPaletteId(currentId: string): string {
  return nextLightBarPalette(getPaletteById(currentId)).id;
}

// --- font ---

const FONT5X7_WIDTH = 5;
const FONT5X7_HEIGHT = 7;

/** Character order matching fontData (5 bytes per entry). */
const FONT5X7_LOOKUP =
  " !\"#$%&'()*+,-./0123456789:;<=>?@" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ[\\]^_`" +
  "abcdefghijklmnopqrstuvwxyzäöü{|}€†‡°";

const FONT5X7_DATA: readonly number[] = [
0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x5f, 0x00, 0x00, 0x00, 0x07,
  0x00, 0x07, 0x00, 0x14, 0x7f, 0x14, 0x7f, 0x14, 0x24, 0x2a, 0x7f, 0x2a,
  0x12, 0x23, 0x13, 0x08, 0x64, 0x62, 0x36, 0x49, 0x55, 0x22, 0x50, 0x00,
  0x05, 0x03, 0x00, 0x00, 0x00, 0x1c, 0x22, 0x41, 0x00, 0x00, 0x41, 0x22,
  0x1c, 0x00, 0x08, 0x2a, 0x1c, 0x2a, 0x08, 0x08, 0x08, 0x3e, 0x08, 0x08,
  0x00, 0x50, 0x30, 0x00, 0x00, 0x08, 0x08, 0x08, 0x08, 0x08, 0x00, 0x60,
  0x60, 0x00, 0x00, 0x20, 0x10, 0x08, 0x04, 0x02, 0x3e, 0x51, 0x49, 0x45,
  0x3e, 0x00, 0x42, 0x7f, 0x40, 0x00, 0x42, 0x61, 0x51, 0x49, 0x46, 0x21,
  0x41, 0x45, 0x4b, 0x31, 0x18, 0x14, 0x12, 0x7f, 0x10, 0x27, 0x45, 0x45,
  0x45, 0x39, 0x3c, 0x4a, 0x49, 0x49, 0x30, 0x01, 0x71, 0x09, 0x05, 0x03,
  0x36, 0x49, 0x49, 0x49, 0x36, 0x06, 0x49, 0x49, 0x29, 0x1e, 0x00, 0x36,
  0x36, 0x00, 0x00, 0x00, 0x56, 0x36, 0x00, 0x00, 0x00, 0x08, 0x14, 0x22,
  0x41, 0x14, 0x14, 0x14, 0x14, 0x14, 0x41, 0x22, 0x14, 0x08, 0x00, 0x02,
  0x01, 0x51, 0x09, 0x06, 0x32, 0x49, 0x79, 0x41, 0x3e, 0x7e, 0x11, 0x11,
  0x11, 0x7e, 0x7f, 0x49, 0x49, 0x49, 0x36, 0x3e, 0x41, 0x41, 0x41, 0x22,
  0x7f, 0x41, 0x41, 0x22, 0x1c, 0x7f, 0x49, 0x49, 0x49, 0x41, 0x7f, 0x09,
  0x09, 0x09, 0x01, 0x3e, 0x41, 0x41, 0x51, 0x32, 0x7f, 0x08, 0x08, 0x08,
  0x7f, 0x00, 0x41, 0x7f, 0x41, 0x00, 0x20, 0x40, 0x41, 0x3f, 0x01, 0x7f,
  0x08, 0x14, 0x22, 0x41, 0x7f, 0x40, 0x40, 0x40, 0x40, 0x7f, 0x02, 0x04,
  0x02, 0x7f, 0x7f, 0x04, 0x08, 0x10, 0x7f, 0x3e, 0x41, 0x41, 0x41, 0x3e,
  0x7f, 0x09, 0x09, 0x09, 0x06, 0x3e, 0x41, 0x51, 0x21, 0x5e, 0x7f, 0x09,
  0x19, 0x29, 0x46, 0x46, 0x49, 0x49, 0x49, 0x31, 0x01, 0x01, 0x7f, 0x01,
  0x01, 0x3f, 0x40, 0x40, 0x40, 0x3f, 0x1f, 0x20, 0x40, 0x20, 0x1f, 0x3f,
  0x40, 0x30, 0x40, 0x3f, 0x63, 0x14, 0x08, 0x14, 0x63, 0x03, 0x04, 0x78,
  0x04, 0x03, 0x61, 0x51, 0x49, 0x45, 0x43, 0x7d, 0x12, 0x12, 0x7d, 0x00,
  0x3d, 0x42, 0x42, 0x42, 0x3d, 0x3d, 0x40, 0x40, 0x40, 0x3d, 0x00, 0x00,
  0x7f, 0x41, 0x41, 0x02, 0x04, 0x08, 0x10, 0x20, 0x41, 0x41, 0x7f, 0x00,
  0x04, 0x02, 0x01, 0x02, 0x04, 0x40, 0x40, 0x40, 0x40, 0x40, 0x00, 0x01,
  0x02, 0x04, 0x00, 0x20, 0x54, 0x54, 0x54, 0x78, 0x7f, 0x48, 0x44, 0x44,
  0x38, 0x38, 0x44, 0x44, 0x44, 0x20, 0x38, 0x44, 0x44, 0x48, 0x7f, 0x38,
  0x54, 0x54, 0x54, 0x18, 0x08, 0x7e, 0x09, 0x01, 0x02, 0x08, 0x14, 0x54,
  0x54, 0x3c, 0x7f, 0x08, 0x04, 0x04, 0x78, 0x00, 0x44, 0x7d, 0x40, 0x00,
  0x20, 0x40, 0x44, 0x3d, 0x00, 0x00, 0x7f, 0x10, 0x28, 0x44, 0x00, 0x41,
  0x7f, 0x40, 0x00, 0x7c, 0x04, 0x18, 0x04, 0x78, 0x7c, 0x08, 0x04, 0x04,
  0x78, 0x38, 0x44, 0x44, 0x44, 0x38, 0x7c, 0x14, 0x14, 0x14, 0x08, 0x08,
  0x14, 0x14, 0x18, 0x7c, 0x7c, 0x08, 0x04, 0x04, 0x08, 0x48, 0x54, 0x54,
  0x54, 0x20, 0x04, 0x3f, 0x44, 0x40, 0x20, 0x3c, 0x40, 0x40, 0x20, 0x7c,
  0x1c, 0x20, 0x40, 0x20, 0x1c, 0x3c, 0x40, 0x30, 0x40, 0x3c, 0x44, 0x28,
  0x10, 0x28, 0x44, 0x0c, 0x50, 0x50, 0x50, 0x3c, 0x44, 0x64, 0x54, 0x4c,
  0x44, 0x20, 0x55, 0x54, 0x55, 0x78, 0x3a, 0x44, 0x44, 0x3a, 0x00, 0x3a,
  0x40, 0x40, 0x3a, 0x00, 0x00, 0x08, 0x36, 0x41, 0x00, 0x00, 0x00, 0x7f,
  0x00, 0x00, 0x00, 0x41, 0x36, 0x08, 0x00, 0x14, 0x3e, 0x55, 0x41, 0x22,
  0x08, 0x08, 0x2a, 0x1c, 0x08, 0x08, 0x1c, 0x2a, 0x08, 0x08, 0x00, 0x00,
  0x07, 0x05, 0x07,
];

type Font5x7Glyph = readonly (readonly (0 | 1)[])[];

type Glyph = Font5x7Glyph;

type DotMatrixStrip = {
  bitmap: boolean[][];
  cols: number;
  rows: number;
};

type ScrollStrip = DotMatrixStrip;

/** Column span of one word in the scroll strip (first loop half). */
type StripSegment = {
  startCol: number;
  endCol: number;
};

type FlickerStep = { atMs: number; on: boolean };

type FlickerBurst = {
  segment: StripSegment;
  startedAt: number;
  steps: FlickerStep[];
};

const GLYPH_WIDTH = FONT5X7_WIDTH;
const GLYPH_HEIGHT = FONT5X7_HEIGHT;
const GLYPH_GAP = 1;
const SPACE_WIDTH = 2;
const STRIP_PAD_COLS = 2;

function decodeFont5x7Bytes(
  c0: number,
  c1: number,
  c2: number,
  c3: number,
  c4: number,
): Font5x7Glyph {
  const glyph: (0 | 1)[][] = Array.from({ length: FONT5X7_HEIGHT }, () =>
    Array(FONT5X7_WIDTH).fill(0),
  );
  const columns = [c0, c1, c2, c3, c4];

  for (let x = 0; x < FONT5X7_WIDTH; x++) {
    let column = columns[x]!;
    for (let y = 0; y < FONT5X7_HEIGHT; y++) {
      glyph[y]![x] = (column & 1) === 1 ? 1 : 0;
      column >>= 1;
    }
  }

  return glyph;
}

let font5x7GlyphMap: Record<string, Font5x7Glyph> | null = null;

function buildFont5x7GlyphMap(): Record<string, Font5x7Glyph> {
  const glyphs: Record<string, Font5x7Glyph> = {};
  const charCount = Math.floor(FONT5X7_DATA.length / FONT5X7_WIDTH);

  for (let i = 0; i < charCount; i++) {
    const char = FONT5X7_LOOKUP[i];
    if (!char) continue;

    const base = i * FONT5X7_WIDTH;
    glyphs[char] = decodeFont5x7Bytes(
      FONT5X7_DATA[base]!,
      FONT5X7_DATA[base + 1]!,
      FONT5X7_DATA[base + 2]!,
      FONT5X7_DATA[base + 3]!,
      FONT5X7_DATA[base + 4]!,
    );
  }

  return glyphs;
}

function getFont5x7GlyphMap(): Record<string, Font5x7Glyph> {
  if (!font5x7GlyphMap) {
    font5x7GlyphMap = buildFont5x7GlyphMap();
  }
  return font5x7GlyphMap;
}

function G(...rows: string[]): Glyph {
  if (rows.length !== GLYPH_HEIGHT) {
    throw new Error(`Glyph must have ${GLYPH_HEIGHT} rows`);
  }
  return rows.map((row) =>
    row.split("").map((c) => (c === "#" ? 1 : 0) as 0 | 1),
  );
}

/** Ticker-only symbols not in the standard 5×7 ASCII set. */
const CUSTOM_GLYPHS: Record<string, Glyph> = {
  "◆": G(".....", "..#..", ".#.#.", "#...#", ".#.#.", "..#..", "....."),
  "•": G(".....", ".....", "..#..", ".....", ".....", ".....", "....."),
  "₹": G(".###.", ".#.#.", ".###.", ".#.#.", ".#...", ".#...", ".#..."),
};

const BASELINE_CHARS = new Set([".", ",", ";", "!", "'", '"', "_", "g", "p", "q", "y"]);
const CENTERED_CHARS = new Set([
  "-",
  "+",
  "=",
  "*",
  ":",
  "◆",
  "•",
  "~",
  "^",
  "%",
  "&",
  "#",
  "$",
  "@",
  "/",
  "\\",
  "<",
  ">",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "|",
  "`",
  "°",
  "€",
  "†",
  "‡",
]);

function getGlyphs(): Record<string, Glyph> {
  return { ...getFont5x7GlyphMap(), ...CUSTOM_GLYPHS };
}

function getFallbackGlyph(): Glyph {
  const map = getFont5x7GlyphMap();
  return map["?"] ?? CUSTOM_GLYPHS["◆"]!;
}

function getTextBandTop(barRows: number) {
  return Math.floor((barRows - GLYPH_HEIGHT) / 2);
}

function charWidth(char: string): number {
  return char === " " ? SPACE_WIDTH : GLYPH_WIDTH;
}

function getGlyph(char: string): Glyph {
  const glyphs = getGlyphs();
  if (glyphs[char]) return glyphs[char]!;
  const upper = char.toUpperCase();
  if (glyphs[upper]) return glyphs[upper]!;
  return getFallbackGlyph();
}

type InkBounds = { minY: number; maxY: number };

function getInkBounds(glyph: Glyph, width: number): InkBounds | null {
  let minY = GLYPH_HEIGHT;
  let maxY = -1;

  for (let y = 0; y < GLYPH_HEIGHT; y++) {
    for (let x = 0; x < width; x++) {
      if (glyph[y]![x]) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxY < 0) return null;
  return { minY, maxY };
}

function glyphYOffset(char: string, glyph: Glyph, width: number): number {
  if (/^[A-Z0-9]$/.test(char)) return 0;

  const bounds = getInkBounds(glyph, width);
  if (!bounds) return 0;

  const { minY, maxY } = bounds;
  const inkHeight = maxY - minY + 1;

  if (BASELINE_CHARS.has(char)) {
    return GLYPH_HEIGHT - 1 - maxY;
  }

  if (CENTERED_CHARS.has(char)) {
    return Math.floor((GLYPH_HEIGHT - inkHeight) / 2) - minY;
  }

  return 0;
}

function normalizeTickerText(text: string): string {
  return [...text]
    .map((char) => {
      if (char >= "a" && char <= "z") return char.toUpperCase();
      return char;
    })
    .join("");
}

function measureTickerCols(text: string): number {
  const normalized = normalizeTickerText(text);
  if (!normalized.trim()) return 0;

  let cols = STRIP_PAD_COLS * 2;
  for (let i = 0; i < normalized.length; i++) {
    cols += charWidth(normalized[i]!);
    if (i < normalized.length - 1) cols += GLYPH_GAP;
  }
  return cols;
}

function composeDotMatrixStrip(
  text: string,
  barRows: number,
): {
  strip: DotMatrixStrip;
  normalizedText: string;
  textBandTop: number;
  segments: StripSegment[];
} {
  const normalizedText = normalizeTickerText(text);
  const cols = measureTickerCols(normalizedText);
  const textBandTop = getTextBandTop(barRows);

  const bitmap: boolean[][] = Array.from({ length: barRows }, () =>
    Array(Math.max(cols, 0)).fill(false),
  );

  if (cols === 0) {
    return {
      strip: { bitmap, cols: 0, rows: barRows },
      normalizedText,
      textBandTop,
      segments: [],
    };
  }

  const segments: StripSegment[] = [];
  let wordStart = -1;
  let col = STRIP_PAD_COLS;

  for (const char of normalizedText) {
    if (char === " ") {
      if (wordStart >= 0) {
        segments.push({ startCol: wordStart, endCol: col });
        wordStart = -1;
      }
      col += charWidth(char) + GLYPH_GAP;
      continue;
    }

    if (wordStart < 0) wordStart = col;

    const glyph = getGlyph(char);
    const width = charWidth(char);
    const yOff = glyphYOffset(char, glyph, width);

    for (let gy = 0; gy < GLYPH_HEIGHT; gy++) {
      const row = textBandTop + gy + yOff;
      if (row < 0 || row >= barRows) continue;

      for (let gx = 0; gx < width; gx++) {
        if (glyph[gy]![gx]) {
          bitmap[row]![col + gx] = true;
        }
      }
    }
    col += width + GLYPH_GAP;
  }

  if (wordStart >= 0) {
    segments.push({ startCol: wordStart, endCol: col - GLYPH_GAP });
  }

  return {
    strip: { bitmap, cols, rows: barRows },
    normalizedText,
    textBandTop,
    segments,
  };
}

function duplicateStrip(strip: ScrollStrip): ScrollStrip {
  if (strip.cols === 0) return strip;

  const bitmap = strip.bitmap.map((row) => [...row, ...row]);
  return { bitmap, cols: strip.cols * 2, rows: strip.rows };
}

function buildScrollStripPipeline(
  text: string,
  rows: number,
  cellSize: number,
): {
  loopStrip: ScrollStrip;
  loopWidthPx: number;
  segments: StripSegment[];
} | null {
  if (!text.trim()) return null;

  const { strip, segments } = composeDotMatrixStrip(text, rows);
  const loopStrip = duplicateStrip(strip);

  return {
    loopStrip,
    loopWidthPx: strip.cols * cellSize,
    segments,
  };
}

// --- draw ---

const BAR_ROWS = 18;
const CELL_GAP = 0.75;
const BG_TOP = "#1c1a18";
const BG_BOTTOM = "#0e0d0c";

type MatrixLayout = {
  cellSize: number;
  barRows: number;
  cellGap: number;
  barHeight: number;
};

function createMatrixLayout(cellSize: number): MatrixLayout {
  return {
    cellSize,
    barRows: BAR_ROWS,
    cellGap: CELL_GAP,
    barHeight: BAR_ROWS * cellSize,
  };
}

const RING_OFFSETS = new Map<number, readonly [number, number][]>();

let bleedBuffer: Float32Array | null = null;
let bleedBufferLength = 0;

type BleedConfig = {
  cap: number;
  mixStrength: number;
  orthoBase: number;
  diagRatio: number;
  ringFalloff: number;
  maxRing: number;
};

function parseHex(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function mixHex(from: string, to: string, t: number) {
  const a = parseHex(from);
  const b = parseHex(to);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}

function resolveLitLevels(characterBrightness: number) {
  const t = Math.min(100, Math.max(0, characterBrightness)) / 100;
  const body = 0.55 + t * 0.4;
  return { body, core: body - 0.04 };
}

function resolveBleedConfig(settings: LightBarGlowSettings): BleedConfig {
  const d = Math.min(100, Math.max(0, settings.diffuse)) / 100;
  return {
    cap: 0.5,
    mixStrength: 0.1 + d * 0.42,
    orthoBase: 0.12 + d * 0.38,
    diagRatio: 0.72,
    ringFalloff: 0.25,
    maxRing: Math.round(Math.min(3, Math.max(1, settings.spread))),
  };
}

function getRingOffsets(ring: number): readonly [number, number][] {
  let cached = RING_OFFSETS.get(ring);
  if (cached) return cached;

  const offsets: [number, number][] = [];
  for (let dx = -ring; dx <= ring; dx++) {
    for (let dy = -ring; dy <= ring; dy++) {
      if (dx === 0 && dy === 0) continue;
      if (Math.max(Math.abs(dx), Math.abs(dy)) === ring) {
        offsets.push([dx, dy]);
      }
    }
  }

  cached = offsets;
  RING_OFFSETS.set(ring, cached);
  return cached;
}

function getBleedBuffer(length: number) {
  if (!bleedBuffer || bleedBufferLength < length) {
    bleedBuffer = new Float32Array(length);
    bleedBufferLength = length;
  } else {
    bleedBuffer.fill(0, 0, length);
  }
  return bleedBuffer;
}

function bleedFill(
  intensity: number,
  config: BleedConfig,
  palette: LightBarPalette,
) {
  const t = Math.min(1, intensity / config.cap);
  return mixHex(palette.offFill, palette.onBody, t * config.mixStrength);
}

function dotRadiusFor(layout: MatrixLayout) {
  return (layout.cellSize - layout.cellGap * 2) / 2;
}

function drawDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  layout: MatrixLayout,
  color: string,
) {
  const radius = dotRadiusFor(layout);
  const cx = x + layout.cellSize / 2;
  const cy = y + layout.cellSize / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawOffGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  layout: MatrixLayout,
  palette: LightBarPalette,
) {
  const { cellSize, barRows, barHeight } = layout;
  const cols = Math.floor(width / cellSize);

  const bg = ctx.createLinearGradient(0, 0, 0, barHeight);
  bg.addColorStop(0, BG_TOP);
  bg.addColorStop(1, BG_BOTTOM);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, barHeight);

  for (let row = 0; row < barRows; row++) {
    const y = row * cellSize;
    for (let col = 0; col < cols; col++) {
      drawDot(ctx, col * cellSize, y, layout, palette.offFill);
    }
  }
}

function drawBleedCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  layout: MatrixLayout,
  intensity: number,
  config: BleedConfig,
  palette: LightBarPalette,
) {
  drawDot(ctx, x, y, layout, bleedFill(intensity, config, palette));
}

function drawLitCore(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  layout: MatrixLayout,
  palette: LightBarPalette,
  characterBrightness: number,
) {
  const { body, core } = resolveLitLevels(characterBrightness);
  const bodyColor = mixHex(palette.offFill, palette.onBody, body);
  const coreColor = mixHex(palette.offFill, palette.onCore, core);
  drawDot(ctx, x, y, layout, bodyColor);

  const radius = dotRadiusFor(layout);
  const cx = x + layout.cellSize / 2;
  const cy = y + layout.cellSize / 2;
  const coreR = radius * 0.62;
  ctx.fillStyle = coreColor;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();
}

type LitLayerContext = {
  viewportCols: number;
  periodCols: number;
  scrollCol: number;
  strip: ScrollStrip;
  barRows: number;
};

function isLitInStrip(ctx: LitLayerContext, col: number, row: number) {
  if (row < 0 || row >= ctx.barRows || col < 0 || col >= ctx.viewportCols) {
    return false;
  }

  let stripCol = col + ctx.scrollCol;
  stripCol =
    ((stripCol % ctx.periodCols) + ctx.periodCols) % ctx.periodCols;
  return ctx.strip.bitmap[row]?.[stripCol] ?? false;
}

function forEachLitViewportCell(
  width: number,
  layout: MatrixLayout,
  strip: ScrollStrip,
  scrollOffsetPx: number,
  loopWidthPx: number,
  visit: (col: number, row: number) => void,
) {
  const { cellSize, barRows } = layout;
  const viewportCols = Math.floor(width / cellSize);
  const periodCols = Math.floor(loopWidthPx / cellSize);

  for (let row = 0; row < strip.rows && row < barRows; row++) {
    const rowBitmap = strip.bitmap[row];
    if (!rowBitmap) continue;

    for (let stripCol = 0; stripCol < periodCols; stripCol++) {
      if (!rowBitmap[stripCol]) continue;

      let col = stripCol - Math.floor(scrollOffsetPx / cellSize);
      col %= periodCols;
      if (col < 0) col += periodCols;

      while (col < viewportCols) {
        visit(col, row);
        col += periodCols;
      }
    }
  }
}

function stampBleed(
  bleed: Float32Array,
  ctx: LitLayerContext,
  litCol: number,
  litRow: number,
  config: BleedConfig,
) {
  const { viewportCols, barRows } = ctx;

  const setBleed = (col: number, row: number, amount: number) => {
    if (col < 0 || col >= viewportCols || row < 0 || row >= barRows) return;
    if (isLitInStrip(ctx, col, row)) return;
    const i = row * viewportCols + col;
    if (bleed[i]! < amount) bleed[i] = amount;
  };

  for (let ring = 1; ring <= config.maxRing; ring++) {
    const ringAmount = config.orthoBase * config.ringFalloff ** (ring - 1);

    for (const [dx, dy] of getRingOffsets(ring)) {
      const isDiag = dx !== 0 && dy !== 0;
      const amount =
        ring === 1 && isDiag ? ringAmount * config.diagRatio : ringAmount;
      setBleed(litCol + dx, litRow + dy, amount);
    }
  }
}

function stripColForViewport(ctx: LitLayerContext, col: number) {
  let stripCol = col + ctx.scrollCol;
  stripCol = ((stripCol % ctx.periodCols) + ctx.periodCols) % ctx.periodCols;
  return stripCol;
}

function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
}

/** Whole-word on/off schedule with irregular gaps between toggles. */
function buildWordFlickerSchedule(seed: number): FlickerStep[] {
  const steps: FlickerStep[] = [{ atMs: 0, on: true }];
  let t = 0;
  let on = true;
  const toggles = 7 + Math.floor(pseudoRandom(seed) * 4);

  for (let i = 0; i < toggles; i++) {
    const r = pseudoRandom(seed + i * 2.17 + 0.31);
    const r2 = pseudoRandom(seed + i * 3.91 + 0.07);
    let interval: number;

    if (!on) {
      // Off period — usually quick, sometimes a longer wait before relight
      interval =
        r2 > 0.68 ? 105 + r * 75 : 28 + r * r * 67;
    } else {
      interval = 28 + r * r * 67;
    }

    t += interval;
    on = !on;
    steps.push({ atMs: t, on });
  }

  if (!on) {
    const r = pseudoRandom(seed + 99);
    t += r > 0.55 ? 85 + r * 70 : 22 + r * 38;
    steps.push({ atMs: t, on: true });
  }

  return steps;
}

function isWordFlickerLit(
  stripCol: number,
  flicker: FlickerBurst | null,
  now: number,
): boolean {
  if (!flicker) return true;

  const { segment, startedAt, steps } = flicker;
  if (stripCol < segment.startCol || stripCol >= segment.endCol) return true;

  const elapsed = now - startedAt;
  const endAt = steps[steps.length - 1]!.atMs;
  if (elapsed > endAt + 90) return true;

  for (let i = steps.length - 1; i >= 0; i--) {
    const step = steps[i]!;
    if (step.atMs <= elapsed) return step.on;
  }

  return true;
}

function pickFlickerWord(segments: StripSegment[]): StripSegment | null {
  const candidates = segments.filter(
    (segment) => segment.endCol - segment.startCol >= GLYPH_WIDTH,
  );
  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)]!;
}

function drawLitLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  layout: MatrixLayout,
  strip: ScrollStrip,
  scrollOffsetPx: number,
  loopWidthPx: number,
  glow: LightBarGlowSettings,
  palette: LightBarPalette,
  characterBrightness: number,
  flicker: FlickerBurst | null,
  now: number,
) {
  if (loopWidthPx <= 0 || strip.cols === 0) return;

  const { cellSize, barRows } = layout;
  const config = resolveBleedConfig(glow);
  const viewportCols = Math.floor(width / cellSize);
  const periodCols = Math.floor(loopWidthPx / cellSize);
  const layerCtx: LitLayerContext = {
    viewportCols,
    periodCols,
    scrollCol: Math.floor(scrollOffsetPx / cellSize),
    strip,
    barRows,
  };

  const bleed = getBleedBuffer(viewportCols * barRows);

  forEachLitViewportCell(
    width,
    layout,
    strip,
    scrollOffsetPx,
    loopWidthPx,
    (col, row) => {
      const stripCol = stripColForViewport(layerCtx, col);
      if (!isWordFlickerLit(stripCol, flicker, now)) return;
      stampBleed(bleed, layerCtx, col, row, config);
    },
  );

  for (let row = 0; row < barRows; row++) {
    const y = row * cellSize;
    for (let col = 0; col < viewportCols; col++) {
      const amount = bleed[row * viewportCols + col]!;
      if (amount > 0) {
        drawBleedCell(ctx, col * cellSize, y, layout, amount, config, palette);
      }
    }
  }

  forEachLitViewportCell(
    width,
    layout,
    strip,
    scrollOffsetPx,
    loopWidthPx,
    (col, row) => {
      const stripCol = stripColForViewport(layerCtx, col);
      if (!isWordFlickerLit(stripCol, flicker, now)) return;
      drawLitCore(
        ctx,
        col * cellSize,
        row * cellSize,
        layout,
        palette,
        characterBrightness,
      );
    },
  );
}

function centerScrollOffset(
  viewportCols: number,
  loopWidthPx: number,
  layout: MatrixLayout,
): number {
  if (loopWidthPx === 0) return 0;
  const viewportWidthPx = viewportCols * layout.cellSize;
  return Math.max(0, (loopWidthPx - viewportWidthPx) / 2);
}

// --- engine ---

const MAX_DPR = 1;
const DEFAULT_SPEED = 40;
const CELL_SIZE_DEBOUNCE_MS = 150;

type StripData = {
  strip: ScrollStrip;
  loopWidthPx: number;
  segments: StripSegment[];
};

function mergeAppearance(partial?: Partial<LightBarAppearance>): LightBarAppearance {
  return {
    ...DEFAULT_LIGHT_BAR_APPEARANCE,
    ...partial,
    glow: { ...DEFAULT_LIGHT_BAR_APPEARANCE.glow, ...partial?.glow },
    glass: { ...DEFAULT_LIGHT_BAR_APPEARANCE.glass, ...partial?.glass },
  };
}

function buildStripFromMessages(
  messages: string[],
  separator: string,
  cellSize: number,
): StripData | null {
  const text = messages.join(separator);
  const build = buildScrollStripPipeline(text, BAR_ROWS, cellSize);
  if (!build) return null;
  return {
    strip: build.loopStrip,
    loopWidthPx: build.loopWidthPx,
    segments: build.segments,
  };
}

function useLightBarEngine(
  messages: string[],
  separator: string,
  direction: LightBarDirection,
  speed: number,
  appearance: LightBarAppearance,
): {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  triggerFlicker: () => void;
} {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appearanceRef = useRef(appearance);

  const stripRef = useRef<StripData | null>(null);
  const segmentsRef = useRef<StripSegment[]>([]);
  const flickerRef = useRef<FlickerBurst | null>(null);
  const scrollRef = useRef(0);
  const widthRef = useRef(0);
  const dprRef = useRef(1);
  const offGridRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const readyRef = useRef(false);

  const [debouncedCellSize, setDebouncedCellSize] = useState(appearance.cellSize);

  useEffect(() => {
    if (appearance.cellSize === debouncedCellSize) return;
    const timer = window.setTimeout(
      () => setDebouncedCellSize(appearance.cellSize),
      CELL_SIZE_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [appearance.cellSize, debouncedCellSize]);

  const paintRef = useRef<() => void>(() => {});
  const rebuildOffGridRef = useRef<(width: number) => void>(() => {});

  useEffect(() => {
    appearanceRef.current = appearance;
  }, [appearance]);

  useLayoutEffect(() => {
    paintRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas || !readyRef.current) return;

      const width = widthRef.current;
      const dpr = dprRef.current;
      const app = appearanceRef.current;
      const layout = createMatrixLayout(debouncedCellSize);
      const palette = getPaletteById(app.paletteId);
      const stripData = stripRef.current;
      const offGrid = offGridRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx || !stripData || !offGrid) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.drawImage(offGrid, 0, 0, width, layout.barHeight);

      const now = performance.now();
      const flicker = flickerRef.current;
      if (flicker) {
        const endAt = flicker.steps[flicker.steps.length - 1]!.atMs;
        if (now - flicker.startedAt > endAt + 100) {
          flickerRef.current = null;
        }
      }

      drawLitLayer(
        ctx,
        width,
        layout,
        stripData.strip,
        scrollRef.current,
        stripData.loopWidthPx,
        app.glow,
        palette,
        app.characterBrightness,
        flickerRef.current,
        now,
      );
    };

    rebuildOffGridRef.current = (width: number) => {
      const dpr = dprRef.current;
      const app = appearanceRef.current;
      const layout = createMatrixLayout(debouncedCellSize);
      const palette = getPaletteById(app.paletteId);

      const buf = document.createElement("canvas");
      buf.width = Math.floor(width * dpr);
      buf.height = Math.floor(layout.barHeight * dpr);
      const ctx = buf.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawOffGrid(ctx, width, layout, palette);
      offGridRef.current = buf;
    };
  }, [debouncedCellSize]);

  useEffect(() => {
    reducedMotionRef.current = prefersReducedMotion();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const width = Math.floor(parent.clientWidth);
      widthRef.current = width;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      dprRef.current = dpr;

      const layout = createMatrixLayout(debouncedCellSize);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(layout.barHeight * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${layout.barHeight}px`;

      rebuildOffGridRef.current(width);

      if (readyRef.current && stripRef.current) {
        if (reducedMotionRef.current) {
          scrollRef.current = centerScrollOffset(
            Math.floor(width / debouncedCellSize),
            stripRef.current.loopWidthPx,
            layout,
          );
        }
        paintRef.current();
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement ?? canvas);

    return () => observer.disconnect();
  }, [debouncedCellSize]);

  useEffect(() => {
    stripRef.current = buildStripFromMessages(
      messages,
      separator,
      debouncedCellSize,
    );
    segmentsRef.current = stripRef.current?.segments ?? [];
    flickerRef.current = null;
    readyRef.current = stripRef.current !== null;

    const width = widthRef.current;
    if (width > 0 && readyRef.current && reducedMotionRef.current) {
      const layout = createMatrixLayout(debouncedCellSize);
      scrollRef.current = centerScrollOffset(
        Math.floor(width / debouncedCellSize),
        stripRef.current!.loopWidthPx,
        layout,
      );
    }

    paintRef.current();
  }, [messages, separator, debouncedCellSize]);

  useEffect(() => {
    const width = widthRef.current;
    if (width <= 0) return;
    rebuildOffGridRef.current(width);
    paintRef.current();
  }, [
    appearance.paletteId,
    appearance.glow.diffuse,
    appearance.glow.spread,
    appearance.characterBrightness,
    debouncedCellSize,
  ]);

  useEffect(() => {
    if (reducedMotionRef.current) return;

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const stripData = stripRef.current;
      if (!stripData || stripData.loopWidthPx === 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const delta = speed * dt * (direction === "ltr" ? 1 : -1);
      scrollRef.current =
        (((scrollRef.current + delta) % stripData.loopWidthPx) +
          stripData.loopWidthPx) %
        stripData.loopWidthPx;

      paintRef.current();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [direction, speed]);

  const triggerFlicker = useCallback(() => {
    if (reducedMotionRef.current) return;

    const segments = segmentsRef.current;
    if (segments.length === 0) return;

    const word = pickFlickerWord(segments);
    if (!word) return;

    const seed = Math.random() * 10_000;
    flickerRef.current = {
      segment: word,
      startedAt: performance.now(),
      steps: buildWordFlickerSchedule(seed),
    };
    paintRef.current();
  }, []);

  return { canvasRef, triggerFlicker };
}

const GLASS_TAP_SOUND = "/sounds/glass-tap.wav";

let glassTapAudio: HTMLAudioElement | null = null;

function playGlassTapSound() {
  if (typeof window === "undefined" || prefersReducedMotion()) return;

  glassTapAudio ??= new Audio(GLASS_TAP_SOUND);
  glassTapAudio.currentTime = 0;
  void glassTapAudio.play().catch(() => {});
}

// --- glass cracks ---

const MAX_GLASS_CRACKS = 12;

type GlassCrack = {
  xPct: number;
  yPct: number;
  seed: number;
};

function crackRandom(seed: number, n: number) {
  const x = Math.sin(n * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function traceSegment(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  color: string,
  offsetX = 0,
  offsetY = 0,
) {
  ctx.beginPath();
  ctx.moveTo(x0 + offsetX, y0 + offsetY);
  ctx.lineTo(x1 + offsetX, y1 + offsetY);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "butt";
  ctx.lineJoin = "miter";
  ctx.miterLimit = 2.5;
  ctx.stroke();
}

function drawHairlineCrack(
  ctx: CanvasRenderingContext2D,
  points: readonly [number, number][],
  maxWidth: number,
  minWidth: number,
) {
  if (points.length < 2) return;

  for (let i = 0; i < points.length - 1; i++) {
    const t = i / Math.max(1, points.length - 2);
    const w = maxWidth + (minWidth - maxWidth) * t;
    const [x0, y0] = points[i]!;
    const [x1, y1] = points[i + 1]!;

    traceSegment(ctx, x0, y0, x1, y1, w + 0.3, "rgba(0, 0, 0, 0.14)", 0.15, 0.2);
    traceSegment(ctx, x0, y0, x1, y1, w, "rgba(255, 255, 255, 0.32)");
    traceSegment(
      ctx,
      x0,
      y0,
      x1,
      y1,
      Math.max(0.18, w * 0.35),
      "rgba(255, 255, 255, 0.12)",
    );
  }
}

const SHARP_TURNS = [
  -1.05, -0.72, -0.42, -0.22, 0.22, 0.42, 0.72, 1.05,
] as const;

function pickSharpTurn(seed: number, n: number) {
  const index = Math.floor(crackRandom(seed, n) * SHARP_TURNS.length);
  return SHARP_TURNS[Math.min(index, SHARP_TURNS.length - 1)]!;
}

function buildAngularRay(
  x: number,
  y: number,
  angle: number,
  length: number,
  seed: number,
): [number, number][] {
  const points: [number, number][] = [[x, y]];
  let px = x;
  let py = y;
  let dir = angle;
  let remaining = length;
  const bends = 2 + Math.floor(crackRandom(seed, 3) * 2);

  for (let b = 0; b < bends && remaining > 1.5; b++) {
    if (b > 0) dir += pickSharpTurn(seed, 5 + b);

    const runShare = 0.42 + crackRandom(seed, 10 + b) * 0.38;
    const segLen = Math.min(remaining, remaining * runShare);
    px += Math.cos(dir) * segLen;
    py += Math.sin(dir) * segLen;
    points.push([px, py]);
    remaining -= segLen;
  }

  return points;
}

function segmentAngleAt(
  points: readonly [number, number][],
  index: number,
): number {
  const [x0, y0] = points[index - 1]!;
  const [x1, y1] = points[index]!;
  return Math.atan2(y1 - y0, x1 - x0);
}

function drawImpactCore(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
) {
  const r = 2.1 * scale;
  const crush = ctx.createRadialGradient(x, y, 0, x, y, r * 1.8);
  crush.addColorStop(0, "rgba(255, 255, 255, 0.32)");
  crush.addColorStop(0.45, "rgba(255, 255, 255, 0.12)");
  crush.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = crush;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawGlassCrack(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  seed: number,
  scale: number,
  width: number,
  height: number,
) {
  drawImpactCore(ctx, x, y, scale);

  const reach =
    width * (0.2 + crackRandom(seed, 7) * 0.18) +
    height * (0.35 + crackRandom(seed, 9) * 0.25);
  const spiderCount = 2 + Math.floor(crackRandom(seed, 8) * 2);

  for (let i = 0; i < spiderCount; i++) {
    const angle =
      crackRandom(seed, 10 + i) * Math.PI * 2 +
      (i / spiderCount) * Math.PI * 0.15;
    const length = (10 + crackRandom(seed, 30 + i) * 16) * scale;
    const points = buildAngularRay(x, y, angle, length, seed + i * 13.1);
    drawHairlineCrack(ctx, points, 0.75 * scale, 0.12 * scale);
  }

  const rayCount = 2 + Math.floor(crackRandom(seed, 1) * 2);

  for (let r = 0; r < rayCount; r++) {
    const raySeed = seed + r * 23.7;
    const angle = crackRandom(raySeed, 2) * Math.PI * 2;
    const length = reach * (0.88 + crackRandom(raySeed, 4) * 0.12);
    const points = buildAngularRay(x, y, angle, length, raySeed);
    drawHairlineCrack(ctx, points, 0.95 * scale, 0.14 * scale);

    if (crackRandom(raySeed, 90) > 0.72) continue;

    const forkIndex = 1 + Math.floor(
      crackRandom(raySeed, 100) * (points.length - 1),
    );
    const [fx, fy] = points[forkIndex]!;
    const forkBase =
      forkIndex > 0 ? segmentAngleAt(points, forkIndex) : angle;
    const forkAngle = forkBase + pickSharpTurn(raySeed, 110);
    const forkLength = length * (0.18 + crackRandom(raySeed, 120) * 0.16);
    const forkPoints = buildAngularRay(
      fx,
      fy,
      forkAngle,
      forkLength,
      raySeed + 7.3,
    );
    drawHairlineCrack(ctx, forkPoints, 0.62 * scale, 0.1 * scale);
  }
}

// --- component ---

/**
 * Dot-matrix LED ticker with diffused glow under a frosted glass lens.
 *
 * For embeds, lazy-load to avoid SSR canvas work:
 * ```tsx
 * const LightBar = dynamic(() => import("@/components/light-bar/LightBar"), {
 *   ssr: false,
 * });
 * ```
 */
export default function LightBar({
  messages,
  direction = "rtl",
  speed = DEFAULT_SPEED,
  appearance: appearanceProp,
  cycleColorOnClick = true,
  className,
  separator = "   ◆   ",
}: LightBarProps) {
  const [appearance, setAppearance] = useState(() =>
    mergeAppearance(appearanceProp),
  );
  const recessRef = useRef<HTMLDivElement>(null);
  const cracksCanvasRef = useRef<HTMLCanvasElement>(null);
  const cracksRef = useRef<GlassCrack[]>([]);

  const syncCracksCanvas = useCallback(() => {
    const recess = recessRef.current;
    const canvas = cracksCanvasRef.current;
    if (!recess || !canvas) return null;

    const width = recess.clientWidth;
    const height = recess.clientHeight;
    if (width <= 0 || height <= 0) return null;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }, []);

  const paintCracks = useCallback(() => {
    const sized = syncCracksCanvas();
    if (!sized) return;

    const { ctx, width, height } = sized;
    ctx.clearRect(0, 0, width, height);

    const scale = Math.max(0.9, width / 360);

    for (const crack of cracksRef.current) {
      drawGlassCrack(
        ctx,
        (crack.xPct / 100) * width,
        (crack.yPct / 100) * height,
        crack.seed,
        scale,
        width,
        height,
      );
    }
  }, [syncCracksCanvas]);

  useEffect(() => {
    const recess = recessRef.current;
    if (!recess) return;

    paintCracks();
    const observer = new ResizeObserver(() => paintCracks());
    observer.observe(recess);
    return () => observer.disconnect();
  }, [paintCracks]);

  const { canvasRef, triggerFlicker } = useLightBarEngine(
    messages,
    separator,
    direction,
    speed,
    appearance,
  );

  const palette = getPaletteById(appearance.paletteId);
  const label = messages.join(separator);
  const ariaLabel = cycleColorOnClick
    ? `${label}. LED color: ${palette.label}. Click to change color, flicker a word, and crack the glass.`
    : label;

  const cyclePalette = useCallback(() => {
    setAppearance((current) => ({
      ...current,
      paletteId: nextPaletteId(current.paletteId),
    }));
  }, []);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      playGlassTapSound();
      triggerFlicker();
      cyclePalette();

      const recess = recessRef.current;
      if (!recess) return;

      const rect = recess.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const xPct = ((event.clientX - rect.left) / rect.width) * 100;
      const yPct = ((event.clientY - rect.top) / rect.height) * 100;

      cracksRef.current = [
        ...cracksRef.current.slice(-(MAX_GLASS_CRACKS - 1)),
        { xPct, yPct, seed: Math.random() * 10_000 },
      ];
      paintCracks();
    },
    [triggerFlicker, cyclePalette, paintCracks],
  );

  const glassStyle = {
    "--lb-frost": String(appearance.glass.frost / 100),
    "--lb-top-glare": String(appearance.glass.topGlare / 100),
    "--lb-bottom-glare": String(appearance.glass.bottomGlare / 100),
  } as CSSProperties;

  const recess = (
    <div ref={recessRef} className="light-bar__recess" style={glassStyle}>
      <canvas ref={canvasRef} className="light-bar__canvas" aria-hidden />
      <div className="light-bar__lens" aria-hidden />
      <div className="light-bar__glass" aria-hidden />
      <canvas
        ref={cracksCanvasRef}
        className="light-bar__cracks"
        aria-hidden
      />
    </div>
  );

  if (cycleColorOnClick) {
    return (
      <button
        type="button"
        className={cn("light-bar", className)}
        onClick={handleClick}
        aria-label={ariaLabel}
      >
        {recess}
      </button>
    );
  }

  return (
    <div
      className={cn("light-bar", "light-bar--static", className)}
      aria-label={ariaLabel}
    >
      {recess}
    </div>
  );
}
