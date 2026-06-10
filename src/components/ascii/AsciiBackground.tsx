"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const BG_CHARS = ["0", "1", "+", "-", ":", ".", "*"] as const;
const CELL_SIZE = 8;
const FONT_SIZE = 7;

type Cell = {
  char: string;
  opacity: number;
};

function randomChar() {
  return BG_CHARS[Math.floor(Math.random() * BG_CHARS.length)];
}

function createCells(cols: number, rows: number): Cell[] {
  const cells: Cell[] = [];
  for (let i = 0; i < cols * rows; i++) {
    cells.push({
      char: randomChar(),
      opacity: 0.1 + Math.random() * 0.2,
    });
  }
  return cells;
}

function drawBgChar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  char: string,
  opacity: number,
) {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = "#8e8e93";
  ctx.font = `${FONT_SIZE}px var(--font-departure-mono), monospace`;
  ctx.textBaseline = "top";
  ctx.fillText(char, x, y);
  ctx.restore();
}

type AsciiBackgroundProps = {
  className?: string;
  transparent?: boolean;
};

export default function AsciiBackground({
  className,
  transparent = false,
}: AsciiBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rebuild = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(width / CELL_SIZE);
      const rows = Math.ceil(height / CELL_SIZE);
      const cells = createCells(cols, rows);

      if (transparent) {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
      }

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cell = cells[row * cols + col];
          drawBgChar(
            ctx,
            col * CELL_SIZE,
            row * CELL_SIZE,
            cell.char,
            cell.opacity,
          );
        }
      }
    };

    rebuild();

    const observer = new ResizeObserver(rebuild);
    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, [transparent]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-full w-full", !transparent && "bg-black", className)}
      aria-hidden
    />
  );
}
