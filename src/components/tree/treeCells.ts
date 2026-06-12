import { CELL_SIZE, type TreeAnchor } from "@/components/tree/treeConstants";

export const SILHOUETTE_SRC = "/tree-silhouette.png";
export const TREE_FILL_FACTOR = 0.94;
export const ALPHA_THRESHOLD = 60;
export const EDGE_RADIUS = 5;

const LEAF_TIP_DIST = 0.42;
const LEAF_CHANCE = 0.24;
const LEAF_RADIUS = 2;
const LEAF_MAX_CANDIDATES = 5;
const LEAF_SWITCH_MIN_MS = 240;
const LEAF_SWITCH_MAX_MS = 620;

const EXT_TIP_FRAC = 0.78;
const EXT_CHANCE = 0.55;
const EXT_LEN = 4;

const LIGHT_X = 0.55;
const LIGHT_Y = -0.83;
const LIGHT_STRENGTH = 0.4;
const WORLD_LIGHT_UP = 1.0;
const WORLD_LIGHT_DOWN = 1.5;
const LIGHT_GAMMA = 0.82;

export type TreePlacement = {
  anchor?: TreeAnchor;
  fillFactor?: number;
};

export type TreeCellBase = {
  col: number;
  row: number;
  intensity: number;
  dist: number;
  phase: number;
  speed: number;
};

export type LeafCandidateBase = {
  col: number;
  row: number;
  intensity: number;
  alpha: number;
};

export type LeafGroupBase = {
  candidates: LeafCandidateBase[];
  order: number[];
  interval: number;
  offset: number;
  dist: number;
  phase: number;
  speed: number;
};

export type TreePlacementBox = {
  cols: number;
  rows: number;
  destX: number;
  destY: number;
  destW: number;
  destH: number;
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

export function computeTreePlacement(
  width: number,
  height: number,
  imageWidth: number,
  imageHeight: number,
  placement: TreePlacement = {},
): TreePlacementBox {
  const anchor = placement.anchor ?? "center";
  const fillFactor = placement.fillFactor ?? TREE_FILL_FACTOR;
  const cols = Math.ceil(width / CELL_SIZE);
  const rows = Math.ceil(height / CELL_SIZE);
  const iw = imageWidth;
  const ih = imageHeight;

  const fitScaleH = height / ih;
  const fitScaleW = width / iw;
  const fitScale = Math.min(fitScaleH, fitScaleW);
  const scale = Math.min(fitScale * fillFactor, fitScale);
  const destW = (iw * scale) / CELL_SIZE;
  const destH = (ih * scale) / CELL_SIZE;
  const destX = anchor === "bottom-right" ? cols - destW : (cols - destW) / 2;
  const destY = anchor === "bottom-right" ? rows - destH : (rows - destH) / 2;

  return { cols, rows, destX, destY, destW, destH };
}

export function buildTreeCells(
  image: HTMLImageElement,
  width: number,
  height: number,
  seed: number,
  placement: TreePlacement = {},
): { cells: TreeCellBase[]; leaves: LeafGroupBase[]; placement: TreePlacementBox } {
  const anchor = placement.anchor ?? "center";
  const fillFactor = placement.fillFactor ?? TREE_FILL_FACTOR;
  const rng = mulberry32(seed);
  const box = computeTreePlacement(
    width,
    height,
    image.naturalWidth || image.width,
    image.naturalHeight || image.height,
    { anchor, fillFactor },
  );
  const { cols, rows, destX, destY, destW, destH } = box;

  if (cols <= 0 || rows <= 0) {
    return { cells: [], leaves: [], placement: box };
  }

  const off = document.createElement("canvas");
  off.width = cols;
  off.height = rows;
  const octx = off.getContext("2d", { willReadFrequently: true });
  if (!octx) return { cells: [], leaves: [], placement: box };

  octx.clearRect(0, 0, cols, rows);
  octx.drawImage(image, destX, destY, destW, destH);

  const data = octx.getImageData(0, 0, cols, rows).data;
  const alphaAt = (c: number, r: number) => {
    if (c < 0 || c >= cols || r < 0 || r >= rows) return 0;
    return data[(r * cols + c) * 4 + 3];
  };
  const solid = (c: number, r: number) => alphaAt(c, r) >= ALPHA_THRESHOLD;

  const rootC = destX + destW;
  const rootR = destY + destH;
  let maxDist = 1;

  const cells: TreeCellBase[] = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!solid(c, r)) continue;

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
              const len = Math.hypot(dx, dy) || 1;
              nx += dx / len;
              ny += dy / len;
            }
          }
        }
      }

      const thickness = edgeDist / EDGE_RADIUS;
      let intensity = 0.34 + thickness * 0.62;

      const px = c / cols - 0.5;
      const py = r / rows - 0.5;
      const worldLit = px * LIGHT_X + py * LIGHT_Y;
      const worldStrength = worldLit >= 0 ? WORLD_LIGHT_UP : WORLD_LIGHT_DOWN;
      intensity *= 1 + worldStrength * worldLit;

      const nlen = Math.hypot(nx, ny);
      if (nlen > 0.001) {
        const lit = (nx / nlen) * LIGHT_X + (ny / nlen) * LIGHT_Y;
        intensity *= 1 + LIGHT_STRENGTH * lit;
      }

      intensity = Math.max(0.04, intensity + (rng() - 0.5) * 0.07);
      intensity = Math.min(1, Math.pow(intensity, LIGHT_GAMMA));

      const dist = Math.hypot(c - rootC, r - rootR);
      if (dist > maxDist) maxDist = dist;

      cells.push({
        col: c,
        row: r,
        intensity,
        dist,
        phase: rng() * Math.PI * 2,
        speed: 0.6 + rng() * 0.9,
      });
    }
  }

  const extKeys = new Set<string>();
  const tipThreshold = maxDist * EXT_TIP_FRAC;
  const baseCount = cells.length;
  for (let i = 0; i < baseCount; i++) {
    const cell = cells[i];
    if (cell.dist < tipThreshold) continue;

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
        phase: rng() * Math.PI * 2,
        speed: 0.6 + rng() * 0.9,
      });
    }
  }

  for (const cell of cells) {
    cell.dist /= maxDist;
  }

  const leaves: LeafGroupBase[] = [];
  for (const cell of cells) {
    if (cell.dist < LEAF_TIP_DIST) continue;

    const c = cell.col;
    const r = cell.row;
    const onEdge =
      !solid(c + 1, r) || !solid(c - 1, r) || !solid(c, r + 1) || !solid(c, r - 1);
    if (!onEdge) continue;
    if (rng() > LEAF_CHANCE) continue;

    const anchorDist = Math.hypot(c - rootC, r - rootR);
    const candidates: LeafCandidateBase[] = [];
    for (let dy = -LEAF_RADIUS; dy <= LEAF_RADIUS; dy++) {
      for (let dx = -LEAF_RADIUS; dx <= LEAF_RADIUS; dx++) {
        if (dx === 0 && dy === 0) continue;
        const cc = c + dx;
        const rr = r + dy;
        if (cc < 0 || cc >= cols || rr < 0 || rr >= rows) continue;
        if (solid(cc, rr) || extKeys.has(`${cc},${rr}`)) continue;
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

  return { cells, leaves, placement: box };
}
