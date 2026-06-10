"use client";

import { useEffect, useRef } from "react";

import { prefersReducedMotion } from "@/lib/motion-preference";
import { cn } from "@/lib/utils";

const CELL_SIZE = 8;
const SQUARE_SIZE = 6;
const GROWTH_MS = 2200;
const SPARKLE_INTERVAL_MS = 90;
const SPARKLE_DURATION_MS = 450;
const GRID_SPACING = 64;

const SILHOUETTE_SRC = "/tree-silhouette.png";
const ALPHA_THRESHOLD = 60;
const FILL_FACTOR = 0.94;
const EDGE_RADIUS = 5;

type TreeAnchor = "center" | "bottom-right";

type TreePlacement = {
  anchor?: TreeAnchor;
  fillFactor?: number;
};

// fluttering leaves: extra sparks that live in the empty cells just beyond the
// branch tips. Each leaf hops between a few neighbouring cells over time so the
// tips feel like they're shifting in the wind, while the solid tree stays put.
const LEAF_TIP_DIST = 0.42; // only branch cells past this distance grow leaves
const LEAF_CHANCE = 0.24; // fraction of eligible tip cells that spawn a leaf
const LEAF_RADIUS = 2; // how far (cells) a leaf can drift from its anchor
const LEAF_MAX_CANDIDATES = 5;
const LEAF_SWITCH_MIN_MS = 240;
const LEAF_SWITCH_MAX_MS = 620;
const LEAF_IDLE_OPACITY = 0.18; // opacity of the non-active cells in a cluster

// branch extension: lengthen the outermost tips by a few cells so the tree
// reaches a little further before the leaves take over.
const EXT_TIP_FRAC = 0.78; // raw-distance fraction past which tips extend
const EXT_CHANCE = 0.55;
const EXT_LEN = 4; // max cells added per extended tip

// branch sway: the tree leans toward the cursor. Anchored at the trunk
// (dist ~0), strongest at the tips (dist ~1), snapped to whole cells with an
// eased opacity crossfade when a cell switches (same trick as the leaves).
const SWAY_EASE = 0.08; // how quickly the lean follows the cursor

// per-mode tuning
const GLIDE_CELLS = 3.5; // tip lean distance (cells)
const GLIDE_BASE = 0.55; // trunk lean as a fraction of the tip lean
const ILLUM_RADIUS = 240; // px spotlight radius
const ILLUM_BOOST = 1.6; // extra brightness at the cursor
const ILLUM_DIM = 0.45; // how much the rest dims while hovering
const MAGNET_RADIUS = 170; // px radius of local pull
const MAGNET_PULL_CELLS = 3; // max local pull (cells)
const BEND_CELLS = 6; // tip arc distance (cells)
const SHIMMER_RADIUS = 150; // px radius of jitter
const SHIMMER_AMP = 5; // px jitter amplitude
const YAW_MAX = 0.48; // max Y-axis rotation (radians), driven by cursor X

// sunlight from top-right
const LIGHT_X = 0.55;
const LIGHT_Y = -0.83;
const LIGHT_STRENGTH = 0.4;
// global gradient: brighter toward top-right, darker toward bottom-left
const WORLD_LIGHT_UP = 1.0;
const WORLD_LIGHT_DOWN = 1.5;
// <1 lifts mid/bright tones for more pop
const LIGHT_GAMMA = 0.82;

const PALETTE: [number, number, number][] = [
  [4, 8, 24],
  [6, 14, 40],
  [8, 22, 60],
  [10, 32, 84],
  [12, 44, 110],
  [16, 58, 138],
  [20, 74, 166],
  [26, 92, 194],
  [34, 112, 216],
  [48, 134, 232],
  [68, 156, 242],
  [96, 178, 248],
  [128, 198, 251],
  [162, 216, 253],
  [196, 232, 254],
  [222, 244, 255],
  [240, 250, 255],
  [255, 255, 255],
];

type TreeCell = {
  col: number;
  row: number;
  intensity: number;
  dist: number;
  bornAt: number;
  sparkleAt: number;
  phase: number;
  speed: number;
};

type LeafCandidate = {
  col: number;
  row: number;
  intensity: number;
  alpha: number;
};

type LeafGroup = {
  // a leaf lights exactly one of these neighbouring cells at a time
  candidates: LeafCandidate[];
  order: number[]; // shuffled visiting order -> pseudo-random hopping
  interval: number;
  offset: number; // time offset so leaves don't switch in unison
  dist: number; // normalized distance, gates appearance during growth
  phase: number;
  speed: number;
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

function lerpColor(intensity: number): string {
  const t = Math.min(Math.max(intensity, 0), 1) * (PALETTE.length - 1);
  const i = Math.floor(t);
  const f = t - i;
  const a = PALETTE[i];
  const b = PALETTE[Math.min(i + 1, PALETTE.length - 1)];
  const r = Math.round(a[0] + (b[0] - a[0]) * f);
  const g = Math.round(a[1] + (b[1] - a[1]) * f);
  const bl = Math.round(a[2] + (b[2] - a[2]) * f);
  return `rgb(${r},${g},${bl})`;
}

function smoothstep(x: number): number {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

type SwayMode = "glide" | "illumination" | "magnet" | "bend" | "shimmer" | "yaw";

type Sway = {
  mode: SwayMode;
  dirX: number; // eased unit direction, tree centroid -> cursor
  dirY: number;
  strength: number; // eased 0..1 hover presence
  mouseX: number;
  mouseY: number;
  baseY: number; // pivot (bottom of the tree) for bend
  topY: number; // top of the tree for bend normalization
  pivotX: number; // tree centroid X for 3D yaw
  pivotY: number; // tree centroid Y for 3D yaw
  treeHalfWidth: number; // horizontal extent for depth normalization
  yaw: number; // eased Y-axis rotation (radians), from cursor X
  now: number;
  illumBoost: number;
  illumDim: number;
};

// returns [dx, dy, intensityMultiplier] for a cell at pixel (cx, cy)
function swayTransform(
  cx: number,
  cy: number,
  dist: number,
  phase: number,
  s: Sway,
): [number, number, number] {
  switch (s.mode) {
    case "glide": {
      const reach =
        (GLIDE_BASE + (1 - GLIDE_BASE) * dist) * GLIDE_CELLS * CELL_SIZE * s.strength;
      return [s.dirX * reach, s.dirY * reach, 1];
    }
    case "illumination": {
      const d = Math.hypot(cx - s.mouseX, cy - s.mouseY);
      const f = smoothstep(1 - d / ILLUM_RADIUS);
      const im =
        1 - s.illumDim * s.strength + s.illumBoost * f * s.strength;
      return [0, 0, im];
    }
    case "magnet": {
      const dx = s.mouseX - cx;
      const dy = s.mouseY - cy;
      const d = Math.hypot(dx, dy) || 1;
      const f = smoothstep(1 - d / MAGNET_RADIUS);
      const pull = MAGNET_PULL_CELLS * CELL_SIZE * f * s.strength;
      return [(dx / d) * pull, (dy / d) * pull, 1 + 0.5 * f * s.strength];
    }
    case "bend": {
      const span = Math.max(1, s.baseY - s.topY);
      const h = Math.max(0, Math.min(1, (s.baseY - cy) / span));
      const arc = h * h * BEND_CELLS * CELL_SIZE * s.strength;
      return [s.dirX * arc, s.dirY * arc * 0.35, 1];
    }
    case "shimmer": {
      const d = Math.hypot(cx - s.mouseX, cy - s.mouseY);
      const f = smoothstep(1 - d / SHIMMER_RADIUS);
      const amp = SHIMMER_AMP * f * s.strength;
      const dx = Math.sin(s.now * 0.018 + phase * 7) * amp;
      const dy = Math.cos(s.now * 0.021 + phase * 5) * amp;
      const im = 1 + 0.7 * f * s.strength * (0.5 + 0.5 * Math.sin(s.now * 0.03 + phase * 9));
      return [dx, dy, im];
    }
    case "yaw": {
      const xLocal = cx - s.pivotX;
      // pseudo-depth: horizontal offset + branch distance gives volume for the turn
      const zLocal =
        xLocal * 0.9 + (s.pivotY - cy) * 0.12 * dist + dist * s.treeHalfWidth * 0.22;
      const cosY = Math.cos(s.yaw);
      const sinY = Math.sin(s.yaw);
      const xRot = xLocal * cosY + zLocal * sinY;
      const zRot = -xLocal * sinY + zLocal * cosY;
      const dx = (xRot - xLocal) * s.strength;
      // slight vertical shear so far side feels recessed
      const dy = sinY * xLocal * 0.06 * dist * s.strength;
      const depth = s.treeHalfWidth * 0.4 + 1;
      const facing = 0.5 + 0.5 * Math.tanh(zRot / depth);
      const im = 1 + s.strength * (-0.32 + 0.32 * facing);
      return [dx, dy, im];
    }
  }
}

// Sample the silhouette PNG into a grid of heatmap cells.
// Core (thick) cells are bright; thin twigs and edges fade to red.
// A top-right light boosts cells whose outward normal faces the light.
function buildTreeFromImage(
  image: HTMLImageElement,
  width: number,
  height: number,
  seed: number,
  placement: TreePlacement = {},
): { cells: TreeCell[]; leaves: LeafGroup[] } {
  const anchor = placement.anchor ?? "center";
  const fillFactor = placement.fillFactor ?? FILL_FACTOR;
  const rng = mulberry32(seed);
  const cols = Math.ceil(width / CELL_SIZE);
  const rows = Math.ceil(height / CELL_SIZE);
  if (cols <= 0 || rows <= 0) return { cells: [], leaves: [] };

  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  const octx = off.getContext("2d", { willReadFrequently: true });
  if (!octx) return { cells: [], leaves: [] };

  const iw = image.naturalWidth || image.width;
  const ih = image.naturalHeight || image.height;
  if (!iw || !ih) return { cells: [], leaves: [] };

  // fit the silhouette; bottom-right anchor grows the tree up from the corner
  const scale =
    anchor === "bottom-right"
      ? Math.min((height / ih) * fillFactor, (width / iw) * fillFactor)
      : Math.min(width / iw, height / ih) * fillFactor;
  const destW = (iw * scale) / CELL_SIZE;
  const destH = (ih * scale) / CELL_SIZE;
  const destX = anchor === "bottom-right" ? cols - destW : (cols - destW) / 2;
  const destY = anchor === "bottom-right" ? rows - destH : (rows - destH) / 2;

  octx.clearRect(0, 0, cols, rows);
  octx.drawImage(image, destX, destY, destW, destH);

  const data = octx.getImageData(0, 0, cols, rows).data;
  const alphaAt = (c: number, r: number) => {
    if (c < 0 || c >= cols || r < 0 || r >= rows) return 0;
    return data[(r * cols + c) * 4 + 3];
  };
  const solid = (c: number, r: number) => alphaAt(c, r) >= ALPHA_THRESHOLD;

  // root = bottom-right of the silhouette box (for growth ordering)
  const rootC = destX + destW;
  const rootR = destY + destH;
  let maxDist = 1;

  const cells: TreeCell[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!solid(c, r)) continue;

      // distance to nearest empty cell -> interior thickness
      let edgeDist = EDGE_RADIUS;
      let nx = 0;
      let ny = 0;
      let found = false;
      for (let ring = 1; ring <= EDGE_RADIUS && !found; ring++) {
        for (let dy = -ring; dy <= ring; dy++) {
          for (let dx = -ring; dx <= ring; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== ring) continue;
            if (!solid(c + dx, r + dy)) {
              if (!found) {
                edgeDist = ring;
                found = true;
              }
              // accumulate outward normal toward empty space
              const len = Math.hypot(dx, dy) || 1;
              nx += dx / len;
              ny += dy / len;
            }
          }
        }
      }

      const thickness = edgeDist / EDGE_RADIUS;
      let intensity = 0.34 + thickness * 0.62;

      // global gradient: project position onto the light direction so the
      // whole tree is lighter toward the top-right, darker toward bottom-left.
      // brighten the lit side harder than we darken the shaded side.
      const px = c / cols - 0.5;
      const py = r / rows - 0.5;
      const worldLit = px * LIGHT_X + py * LIGHT_Y; // ~[-0.7, 0.7]
      const worldStrength = worldLit >= 0 ? WORLD_LIGHT_UP : WORLD_LIGHT_DOWN;
      intensity *= 1 + worldStrength * worldLit;

      // local directional light: lit when outward normal faces top-right
      const nlen = Math.hypot(nx, ny);
      if (nlen > 0.001) {
        const lit = (nx / nlen) * LIGHT_X + (ny / nlen) * LIGHT_Y;
        intensity *= 1 + LIGHT_STRENGTH * lit;
      }

      intensity = Math.max(0.04, intensity + (rng() - 0.5) * 0.07);
      // gamma lift so the lit tones reach pale yellow / white
      intensity = Math.min(1, Math.pow(intensity, LIGHT_GAMMA));

      const dist = Math.hypot(c - rootC, r - rootR);
      if (dist > maxDist) maxDist = dist;

      cells.push({
        col: c,
        row: r,
        intensity,
        dist,
        bornAt: -1,
        sparkleAt: -1,
        phase: rng() * Math.PI * 2,
        speed: 0.6 + rng() * 0.9,
      });
    }
  }

  // --- extend the outermost tips outward (away from the root) ---
  const extKeys = new Set<string>();
  const tipThreshold = maxDist * EXT_TIP_FRAC;
  const baseCount = cells.length;
  for (let i = 0; i < baseCount; i++) {
    const cell = cells[i];
    if (cell.dist < tipThreshold) continue; // dist is still raw here

    const c = cell.col;
    const r = cell.row;
    const onEdge =
      !solid(c + 1, r) || !solid(c - 1, r) || !solid(c, r + 1) || !solid(c, r - 1);
    if (!onEdge) continue;
    if (rng() > EXT_CHANCE) continue;

    const len = Math.hypot(c - rootC, r - rootR) || 1;
    const dirx = (c - rootC) / len;
    const diry = (r - rootR) / len;
    const steps = 2 + Math.floor(rng() * (EXT_LEN - 1));
    for (let k = 1; k <= steps; k++) {
      const nc = Math.round(c + dirx * k);
      const nr = Math.round(r + diry * k);
      if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) break;
      const key = `${nc},${nr}`;
      if (solid(nc, nr) || extKeys.has(key)) continue;
      extKeys.add(key);

      const taper = 1 - k / (steps + 1);
      const dist = Math.hypot(nc - rootC, nr - rootR);
      if (dist > maxDist) maxDist = dist;
      cells.push({
        col: nc,
        row: nr,
        intensity: Math.min(1, Math.max(0.08, cell.intensity * (0.55 + 0.45 * taper))),
        dist,
        bornAt: -1,
        sparkleAt: -1,
        phase: rng() * Math.PI * 2,
        speed: 0.6 + rng() * 0.9,
      });
    }
  }

  for (const cell of cells) {
    cell.dist /= maxDist;
  }

  // --- leaves: sparks in the empty cells just beyond the branch tips ---
  const leaves: LeafGroup[] = [];
  for (const cell of cells) {
    if (cell.dist < LEAF_TIP_DIST) continue;

    const { col: c, row: r } = cell;
    // must be on the silhouette edge (has an empty orthogonal neighbour)
    const onEdge =
      !solid(c + 1, r) || !solid(c - 1, r) || !solid(c, r + 1) || !solid(c, r - 1);
    if (!onEdge) continue;
    if (rng() > LEAF_CHANCE) continue;

    const anchorDist = Math.hypot(c - rootC, r - rootR);
    const candidates: LeafCandidate[] = [];
    for (let dy = -LEAF_RADIUS; dy <= LEAF_RADIUS; dy++) {
      for (let dx = -LEAF_RADIUS; dx <= LEAF_RADIUS; dx++) {
        if (dx === 0 && dy === 0) continue;
        const cc = c + dx;
        const rr = r + dy;
        if (cc < 0 || cc >= cols || rr < 0 || rr >= rows) continue;
        if (solid(cc, rr) || extKeys.has(`${cc},${rr}`)) continue; // empty space only
        // bias outward: only cells farther from the root than the anchor
        if (Math.hypot(cc - rootC, rr - rootR) < anchorDist - 0.5) continue;
        candidates.push({
          col: cc,
          row: rr,
          intensity: 0.4 + rng() * 0.55,
          alpha: 0.3 + rng() * 0.7,
        });
      }
    }
    if (candidates.length < 2) continue;

    // keep a small, close cluster
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }
    const picked = candidates.slice(0, LEAF_MAX_CANDIDATES);

    const order = picked.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    leaves.push({
      candidates: picked,
      order,
      interval: LEAF_SWITCH_MIN_MS + rng() * (LEAF_SWITCH_MAX_MS - LEAF_SWITCH_MIN_MS),
      offset: rng() * 2000,
      dist: cell.dist,
      phase: rng() * Math.PI * 2,
      speed: 0.6 + rng() * 0.9,
    });
  }

  return { cells, leaves };
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= width; x += GRID_SPACING) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }
}

function drawCells(
  ctx: CanvasRenderingContext2D,
  cells: TreeCell[],
  progress: number,
  now: number,
  reducedMotion: boolean,
  sway: Sway,
) {
  const offset = (CELL_SIZE - SQUARE_SIZE) / 2;

  for (const cell of cells) {
    if (!reducedMotion && cell.dist > progress) continue;

    const cx = cell.col * CELL_SIZE;
    const cy = cell.row * CELL_SIZE;
    const [dx, dy, im] = swayTransform(cx, cy, cell.dist, cell.phase, sway);

    let intensity = cell.intensity;

    if (!reducedMotion) {
      const breathe =
        0.84 + 0.16 * Math.sin(now * 0.0016 * cell.speed + cell.phase);
      intensity *= breathe;

      if (cell.sparkleAt > 0) {
        const t = (now - cell.sparkleAt) / SPARKLE_DURATION_MS;
        if (t < 1) {
          intensity = Math.min(1, intensity + (1 - t) * 0.45);
        }
      }

      if (cell.bornAt > 0 && now - cell.bornAt < 200) {
        const pop = 1 - (now - cell.bornAt) / 200;
        intensity = Math.min(1, intensity + pop * 0.35);
      }
    }

    intensity = Math.max(0.04, Math.min(1, intensity * im));

    ctx.fillStyle = lerpColor(intensity);
    ctx.fillRect(cx + dx + offset, cy + dy + offset, SQUARE_SIZE, SQUARE_SIZE);
  }
}

function drawLeaves(
  ctx: CanvasRenderingContext2D,
  leaves: LeafGroup[],
  progress: number,
  now: number,
  reducedMotion: boolean,
  sway: Sway,
) {
  const offset = (CELL_SIZE - SQUARE_SIZE) / 2;

  for (const leaf of leaves) {
    if (!reducedMotion && leaf.dist > progress) continue;

    // the "bright spot" hops around the cluster over time
    let active = leaf.order[0];
    if (!reducedMotion) {
      const step = Math.floor((now + leaf.offset) / leaf.interval);
      active =
        leaf.order[((step % leaf.order.length) + leaf.order.length) % leaf.order.length];
    }

    for (let i = 0; i < leaf.candidates.length; i++) {
      const cand = leaf.candidates[i];
      const isActive = i === active;

      let intensity = cand.intensity;
      let alpha = cand.alpha;
      if (!reducedMotion) {
        const flicker =
          0.72 + 0.28 * Math.sin(now * 0.004 * leaf.speed + leaf.phase + i);
        intensity *= flicker;
        alpha *= flicker;
      }
      if (!isActive) {
        intensity *= 0.6;
        alpha *= LEAF_IDLE_OPACITY;
      }

      const cx = cand.col * CELL_SIZE;
      const cy = cand.row * CELL_SIZE;
      const [dx, dy, im] = swayTransform(cx, cy, leaf.dist, leaf.phase + i, sway);

      intensity = Math.max(0.05, Math.min(1, intensity * im));
      alpha = Math.max(0.05, Math.min(1, alpha));

      ctx.globalAlpha = alpha;
      ctx.fillStyle = lerpColor(intensity);
      ctx.fillRect(cx + dx + offset, cy + dy + offset, SQUARE_SIZE, SQUARE_SIZE);
    }
  }

  ctx.globalAlpha = 1;
}

type HeatmapTreeProps = {
  className?: string;
  mode?: SwayMode;
  showGrid?: boolean;
  /** Clear the canvas each frame instead of painting black (for overlays). */
  transparent?: boolean;
  /** Where the tree silhouette is anchored in the canvas. */
  anchor?: TreeAnchor;
  /** Scale multiplier for the silhouette (default 0.94). */
  fillFactor?: number;
  /** Brightness added at the cursor in illumination mode. */
  illumBoost?: number;
  /** Background dim amount while hovering in illumination mode. */
  illumDim?: number;
  ariaLabel?: string;
};

export default function HeatmapTree({
  className,
  mode = "glide",
  showGrid = true,
  transparent = false,
  anchor = "center",
  fillFactor = FILL_FACTOR,
  illumBoost = ILLUM_BOOST,
  illumDim = ILLUM_DIM,
  ariaLabel = "Heatmap tree visualization",
}: HeatmapTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<SwayMode>(mode);
  const illumBoostRef = useRef(illumBoost);
  const illumDimRef = useRef(illumDim);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    illumBoostRef.current = illumBoost;
    illumDimRef.current = illumDim;
  }, [illumBoost, illumDim]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = prefersReducedMotion();
    let cells: TreeCell[] = [];
    let leaves: LeafGroup[] = [];
    let width = 0;
    let height = 0;
    let startTime = performance.now();
    let lastSparkle = 0;
    let raf = 0;
    let progress = reducedMotion ? 1 : 0;
    let image: HTMLImageElement | null = null;

    // cursor lean state
    const mouse = { x: 0, y: 0, active: false };
    let centroidX = 0;
    let centroidY = 0;
    let baseY = 0;
    let topY = 0;
    let swayX = 0;
    let swayY = 0;
    let strength = 0;
    let yaw = 0;
    let treeHalfWidth = 1;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onPointerLeave = () => {
      mouse.active = false;
    };

    const rebuild = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!image) return;
      const seed = Math.floor(width * 1000 + height);
      ({ cells, leaves } = buildTreeFromImage(image, width, height, seed, {
        anchor,
        fillFactor,
      }));
      startTime = performance.now();
      progress = reducedMotion ? 1 : 0;
      lastSparkle = 0;

      let sx = 0;
      let sy = 0;
      let minRow = Infinity;
      let maxRow = -Infinity;
      let minCol = Infinity;
      let maxCol = -Infinity;
      for (const cell of cells) {
        sx += cell.col * CELL_SIZE;
        sy += cell.row * CELL_SIZE;
        if (cell.row < minRow) minRow = cell.row;
        if (cell.row > maxRow) maxRow = cell.row;
        if (cell.col < minCol) minCol = cell.col;
        if (cell.col > maxCol) maxCol = cell.col;
      }
      centroidX = cells.length ? sx / cells.length : width / 2;
      centroidY = cells.length ? sy / cells.length : height / 2;
      topY = cells.length ? minRow * CELL_SIZE : 0;
      baseY = cells.length ? maxRow * CELL_SIZE : height;
      treeHalfWidth = cells.length
        ? Math.max(CELL_SIZE, ((maxCol - minCol) * CELL_SIZE) / 2)
        : width * 0.25;

      if (reducedMotion && image) {
        tick(performance.now());
      }
    };

    const tick = (now: number) => {
      if (!reducedMotion) {
        const elapsed = now - startTime;
        const nextProgress = Math.min(1, elapsed / GROWTH_MS);
        if (nextProgress > progress) {
          for (const cell of cells) {
            if (cell.bornAt < 0 && cell.dist <= nextProgress) {
              cell.bornAt = now;
            }
          }
          progress = nextProgress;
        }

        if (now - lastSparkle > SPARKLE_INTERVAL_MS && cells.length > 0) {
          lastSparkle = now;
          const count = Math.max(2, Math.floor(cells.length * 0.025));
          for (let i = 0; i < count; i++) {
            const cell = cells[Math.floor(Math.random() * cells.length)];
            cell.sparkleAt = now;
          }
        }
      }

      // lean toward the cursor: unit direction from the tree centroid, eased
      let targetX = 0;
      let targetY = 0;
      if (mouse.active && !reducedMotion) {
        const dx = mouse.x - centroidX;
        const dy = mouse.y - centroidY;
        const len = Math.hypot(dx, dy);
        if (len > 1) {
          targetX = dx / len;
          targetY = dy / len;
        }
      }
      swayX += (targetX - swayX) * SWAY_EASE;
      swayY += (targetY - swayY) * SWAY_EASE;
      const targetStrength = mouse.active && !reducedMotion ? 1 : 0;
      strength += (targetStrength - strength) * SWAY_EASE;

      const targetYaw =
        mouse.active && !reducedMotion
          ? Math.max(
              -YAW_MAX,
              Math.min(YAW_MAX, ((mouse.x - centroidX) / (width * 0.38)) * YAW_MAX),
            )
          : 0;
      yaw += (targetYaw - yaw) * SWAY_EASE;

      const sway: Sway = {
        mode: modeRef.current,
        dirX: swayX,
        dirY: swayY,
        strength,
        mouseX: mouse.x,
        mouseY: mouse.y,
        baseY,
        topY,
        pivotX: centroidX,
        pivotY: centroidY,
        treeHalfWidth,
        yaw,
        now,
        illumBoost: illumBoostRef.current,
        illumDim: illumDimRef.current,
      };

      if (transparent) {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
      }
      if (showGrid) drawGrid(ctx, width, height);
      drawCells(ctx, cells, progress, now, reducedMotion, sway);
      drawLeaves(ctx, leaves, progress, now, reducedMotion, sway);

      if (!reducedMotion) {
        raf = requestAnimationFrame(tick);
      }
    };

    const img = new Image();
    img.src = SILHOUETTE_SRC;
    img.onload = () => {
      image = img;
      rebuild();
    };

    rebuild();
    if (!reducedMotion) {
      raf = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(rebuild);
    observer.observe(canvas);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      img.onload = null;
    };
  }, [showGrid, transparent, anchor, fillFactor, illumBoost, illumDim]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "block h-full w-full",
        transparent ? "bg-transparent" : "bg-black",
        className,
      )}
      aria-label={ariaLabel}
    />
  );
}

export type { SwayMode, TreeAnchor };
