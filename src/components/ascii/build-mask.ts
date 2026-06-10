import type { LayoutFonts, PortfolioLayoutRenderer } from "@/components/ascii/portfolio-layouts";

export type TextMask = {
  bitmap: boolean[][];
  centerCol: number;
  centerRow: number;
};

function sampleBitmap(
  pixels: Uint8ClampedArray,
  pixelWidth: number,
  pixelHeight: number,
  cols: number,
  rows: number,
  cellSize: number,
  offsetCol: number,
  offsetRow: number,
): TextMask {
  const bitmap: boolean[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(false),
  );

  let sumCol = 0;
  let sumRow = 0;
  let maskCount = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const localCol = col - offsetCol;
      const localRow = row - offsetRow;
      if (
        localCol < 0 ||
        localRow < 0 ||
        localCol * cellSize >= pixelWidth ||
        localRow * cellSize >= pixelHeight
      ) {
        continue;
      }

      const px = localCol * cellSize;
      const py = localRow * cellSize;
      let filled = 0;
      let total = 0;

      for (let dy = 0; dy < cellSize; dy++) {
        for (let dx = 0; dx < cellSize; dx++) {
          const x = px + dx;
          const y = py + dy;
          if (x >= pixelWidth || y >= pixelHeight) continue;
          total++;
          const i = (y * pixelWidth + x) * 4;
          if (pixels[i] > 140) filled++;
        }
      }

      const isMask = total > 0 && filled / total > 0.28;
      bitmap[row][col] = isMask;

      if (isMask) {
        sumCol += col;
        sumRow += row;
        maskCount++;
      }
    }
  }

  return {
    bitmap,
    centerCol: maskCount > 0 ? sumCol / maskCount : cols / 2,
    centerRow: maskCount > 0 ? sumRow / maskCount : rows / 2,
  };
}

export function buildLayoutMask(
  render: PortfolioLayoutRenderer,
  cols: number,
  rows: number,
  cellSize: number,
  fonts: LayoutFonts,
): TextMask {
  const pixelWidth = cols * cellSize;
  const pixelHeight = rows * cellSize;

  const offscreen = document.createElement("canvas");
  const octx = offscreen.getContext("2d");
  if (!octx) {
    return {
      bitmap: Array.from({ length: rows }, () => Array(cols).fill(false)),
      centerCol: cols / 2,
      centerRow: rows / 2,
    };
  }

  offscreen.width = pixelWidth;
  offscreen.height = pixelHeight;

  octx.fillStyle = "#000000";
  octx.fillRect(0, 0, pixelWidth, pixelHeight);
  octx.fillStyle = "#ffffff";
  octx.strokeStyle = "#ffffff";
  octx.textBaseline = "top";
  octx.imageSmoothingEnabled = false;

  render(octx, pixelWidth, pixelHeight, fonts);

  const pixels = octx.getImageData(0, 0, pixelWidth, pixelHeight).data;
  return sampleBitmap(pixels, pixelWidth, pixelHeight, cols, rows, cellSize, 0, 0);
}

export function findFontSize(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontFamily: string,
  maxWidth: number,
  maxHeight: number,
) {
  let fontSize = 12;

  for (let size = 12; size <= 400; size += 2) {
    ctx.font = `${size}px ${fontFamily}`;
    const { width } = ctx.measureText(text);
    if (width > maxWidth || size * 1.15 > maxHeight) break;
    fontSize = size;
  }

  return fontSize;
}

export function buildTextMask(
  text: string,
  cols: number,
  rows: number,
  cellSize: number,
  fontFamily: string,
): TextMask {
  if (!text.trim()) {
    return {
      bitmap: Array.from({ length: rows }, () => Array(cols).fill(false)),
      centerCol: cols / 2,
      centerRow: rows / 2,
    };
  }

  const offscreen = document.createElement("canvas");
  const octx = offscreen.getContext("2d");
  if (!octx) {
    return {
      bitmap: Array.from({ length: rows }, () => Array(cols).fill(false)),
      centerCol: cols / 2,
      centerRow: rows / 2,
    };
  }

  const maxWidth = cols * cellSize * 0.9;
  const maxHeight = rows * cellSize * 0.38;
  const fontSize = findFontSize(octx, text, fontFamily, maxWidth, maxHeight);

  octx.font = `${fontSize}px ${fontFamily}`;
  const { width: textWidth } = octx.measureText(text);
  const textHeight = fontSize * 1.1;
  const pad = cellSize;

  offscreen.width = Math.ceil(textWidth + pad * 2);
  offscreen.height = Math.ceil(textHeight + pad * 2);

  octx.font = `${fontSize}px ${fontFamily}`;
  octx.fillStyle = "#ffffff";
  octx.strokeStyle = "#ffffff";
  octx.lineWidth = Math.max(2, fontSize * 0.05);
  octx.textBaseline = "top";
  octx.imageSmoothingEnabled = false;
  octx.strokeText(text, pad, pad);
  octx.fillText(text, pad, pad);

  const pixels = octx.getImageData(0, 0, offscreen.width, offscreen.height).data;
  const maskCols = Math.ceil(offscreen.width / cellSize);
  const maskRows = Math.ceil(offscreen.height / cellSize);
  const offsetCol = Math.floor((cols - maskCols) / 2);
  const offsetRow = Math.floor((rows - maskRows) / 2);

  return sampleBitmap(
    pixels,
    offscreen.width,
    offscreen.height,
    cols,
    rows,
    cellSize,
    offsetCol,
    offsetRow,
  );
}
