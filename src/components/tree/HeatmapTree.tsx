"use client";

import { useEffect, useRef } from "react";

import {
  buildTreeCells,
  SILHOUETTE_SRC,
  type LeafGroupBase,
} from "@/components/tree/treeCells";
import {
  CELL_SIZE,
  GROWTH_MS,
  SQUARE_SIZE,
  SWAY_EASE,
  type TreeAnchor,
} from "@/components/tree/treeConstants";
import { prefersReducedMotion } from "@/lib/motion-preference";
import { cn } from "@/lib/utils";

const SPARKLE_INTERVAL_MS = 90;
const SPARKLE_DURATION_MS = 450;
const GRID_SPACING = 64;

const FILL_FACTOR = 0.94;
const LEAF_IDLE_OPACITY = 0.18;

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

type LeafGroup = LeafGroupBase;

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

export type ExternalMouse = {
  x: number;
  y: number;
  active: boolean;
};

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
  /** When true, pointer events are disabled and mouse comes from externalMouse. */
  composed?: boolean;
  /** Shared mouse state when composed with PondGrid. */
  externalMouse?: ExternalMouse;
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
  composed = false,
  externalMouse,
  ariaLabel = "Heatmap tree visualization",
}: HeatmapTreeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<SwayMode>(mode);
  const illumBoostRef = useRef(illumBoost);
  const illumDimRef = useRef(illumDim);
  const externalMouseRef = useRef(externalMouse);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    illumBoostRef.current = illumBoost;
    illumDimRef.current = illumDim;
  }, [illumBoost, illumDim]);

  useEffect(() => {
    externalMouseRef.current = externalMouse;
  }, [externalMouse]);

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

    const syncMouse = () => {
      if (composed && externalMouseRef.current) {
        mouse.x = externalMouseRef.current.x;
        mouse.y = externalMouseRef.current.y;
        mouse.active = externalMouseRef.current.active;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (composed) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const onPointerLeave = () => {
      if (composed) return;
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
      const built = buildTreeCells(image, width, height, seed, {
        anchor,
        fillFactor,
      });
      cells = built.cells.map((cell) => ({
        ...cell,
        bornAt: -1,
        sparkleAt: -1,
      }));
      leaves = built.leaves;
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

      syncMouse();

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
    if (!composed) {
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerleave", onPointerLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      if (!composed) {
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
      }
      img.onload = null;
    };
  }, [showGrid, transparent, anchor, fillFactor, illumBoost, illumDim, composed]);

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

export type { SwayMode };
export type { TreeAnchor } from "@/components/tree/treeConstants";
