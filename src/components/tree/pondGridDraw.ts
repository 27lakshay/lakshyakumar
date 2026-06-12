import {
  CELL_SIZE,
  SQUARE_SIZE,
  type TreeAnchor,
} from "@/components/tree/treeConstants";

export const BG_SHIMMER_RADIUS = 200;
export const BG_SHIMMER_BOOST = 12;
export const BG_SHIMMER_SPEED = 0.0038;
export const BG_GREY_DARK = { base: 18, span: 14 };
export const BG_GREY_LIGHT = { base: 214, span: 14 };
export const RIPPLE_DURATION_MS = 30000;
export const RIPPLE_AMP = 15;
export const RIPPLE_BAND_WIDTH = CELL_SIZE * 2.2;
export const RIPPLE_LIFT_HOLD = 0.45;
export const RIPPLE_INITIAL_BOOST = 0.3;
export const MAX_RIPPLES = 24;
export const RIPPLE_MAX_DISPLACEMENT = 22;

export type BackgroundSquare = {
  col: number;
  row: number;
  greyVariant: number;
  phase: number;
  dist: number;
};

export type BackgroundRipple = {
  x: number;
  y: number;
  start: number;
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoothstep(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

function easeOutPow(t: number, power: number): number {
  return 1 - Math.pow(1 - t, power);
}

function rippleExpand(t: number): number {
  return easeOutPow(t, 6);
}

function rippleImpactBoost(t: number): number {
  return 1 + RIPPLE_INITIAL_BOOST * Math.pow(1 - t, 1.35);
}

function rippleLiftFade(t: number): number {
  if (t <= RIPPLE_LIFT_HOLD) return 1;
  return 1 - easeOutPow((t - RIPPLE_LIFT_HOLD) / (1 - RIPPLE_LIFT_HOLD), 5);
}

function rippleRingDisplacement(
  cx: number,
  cy: number,
  ripple: BackgroundRipple,
  now: number,
  maxRadius: number,
): number {
  const age = now - ripple.start;
  if (age <= 0 || age > RIPPLE_DURATION_MS) return 0;

  const t = age / RIPPLE_DURATION_MS;
  const radius = rippleExpand(t) * maxRadius;
  const dx = cx - ripple.x;
  const dy = cy - ripple.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return 0;

  const edgeDist = Math.abs(dist - radius);
  const edge = 1 - smoothstep(edgeDist / RIPPLE_BAND_WIDTH);
  if (edge <= 0) return 0;

  const liftFade = rippleLiftFade(t);
  const impact = rippleImpactBoost(t);
  const punch = 1 + 0.16 * edge * edge;
  const lift = Math.pow(edge, 0.52) * liftFade * punch * impact;
  const ny = dy / dist;

  return lift * RIPPLE_AMP * ny;
}

function greyFromVariant(variant: number, isDark: boolean): number {
  const palette = isDark ? BG_GREY_DARK : BG_GREY_LIGHT;
  return palette.base + variant;
}

export function buildBackgroundSquares(
  width: number,
  height: number,
  seed: number,
  anchor: TreeAnchor,
): BackgroundSquare[] {
  const rng = mulberry32(seed + 0x9e3779b9);
  const cols = Math.ceil(width / CELL_SIZE);
  const rows = Math.ceil(height / CELL_SIZE);
  const originCol = anchor === "bottom-right" ? cols : cols / 2;
  const originRow = anchor === "bottom-right" ? rows : rows / 2;

  const squares: BackgroundSquare[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      squares.push({
        col,
        row,
        greyVariant: Math.floor(rng() * BG_GREY_DARK.span),
        phase: rng() * Math.PI * 2,
        dist: Math.round(Math.hypot(col - originCol, row - originRow)),
      });
    }
  }

  return squares;
}

export function drawBackgroundSquares(
  ctx: CanvasRenderingContext2D,
  squares: BackgroundSquare[],
  now: number,
  reducedMotion: boolean,
  bgRevealRadius: number,
  isDark: boolean,
  mouseX: number,
  mouseY: number,
  strength: number,
  ripples: BackgroundRipple[],
  width: number,
  height: number,
) {
  const offset = (CELL_SIZE - SQUARE_SIZE) / 2;
  const maxRadius = Math.hypot(width, height);

  for (const square of squares) {
    if (!reducedMotion && square.dist > bgRevealRadius) continue;

    const cx = square.col * CELL_SIZE + CELL_SIZE / 2;
    const cy = square.row * CELL_SIZE + CELL_SIZE / 2;
    let g = greyFromVariant(square.greyVariant, isDark);
    let rippleDy = 0;

    if (!reducedMotion && strength > 0.001) {
      const d = Math.hypot(cx - mouseX, cy - mouseY);
      const proximity = smoothstep(1 - d / BG_SHIMMER_RADIUS) * strength;
      const pulse = 0.55 + 0.45 * Math.sin(now * BG_SHIMMER_SPEED + square.phase);
      const shimmerBoost = isDark ? BG_SHIMMER_BOOST : -BG_SHIMMER_BOOST;
      g += proximity * shimmerBoost * pulse;
    }

    if (!reducedMotion) {
      for (const ripple of ripples) {
        rippleDy += rippleRingDisplacement(cx, cy, ripple, now, maxRadius);
      }
      rippleDy = Math.max(
        -RIPPLE_MAX_DISPLACEMENT,
        Math.min(RIPPLE_MAX_DISPLACEMENT, rippleDy),
      );
    }

    g = Math.max(0, Math.min(255, Math.round(g)));
    ctx.fillStyle = `rgb(${g},${g},${g})`;
    ctx.fillRect(
      square.col * CELL_SIZE + offset,
      square.row * CELL_SIZE + offset + rippleDy,
      SQUARE_SIZE,
      SQUARE_SIZE,
    );
  }
}

export function addRipple(
  ripples: BackgroundRipple[],
  x: number,
  y: number,
  now: number,
) {
  ripples.push({ x, y, start: now });
  if (ripples.length > MAX_RIPPLES) {
    ripples.splice(0, ripples.length - MAX_RIPPLES);
  }
}

export function pruneRipples(ripples: BackgroundRipple[], now: number) {
  for (let i = ripples.length - 1; i >= 0; i--) {
    if (now - ripples[i].start > RIPPLE_DURATION_MS) {
      ripples.splice(i, 1);
    }
  }
}
