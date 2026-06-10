"use client";

import { useEffect, useRef } from "react";

import {
  buildLayoutMask,
  buildTextMask,
  type TextMask,
} from "@/components/ascii/build-mask";
import type { PortfolioLayoutRenderer } from "@/components/ascii/portfolio-layouts";
import {
  GEIST_PIXEL_FONT_VARIABLES,
  getGeistPixelFamily,
} from "@/lib/geist-pixel-fonts";
import { cn } from "@/lib/utils";

const BG_CHARS = ["0", "1", "+", "-", ":", ".", "*"] as const;

type Cell = {
  char: string;
  opacity: number;
  reveal: number;
  shape: 0 | 1 | 2;
  revealOrder: number;
  isMask: boolean;
};

type Phase = "idle" | "forming" | "hold" | "dissolve";

type AsciiCharacterEffectProps = {
  text?: string;
  slideId?: string;
  renderLayout?: PortfolioLayoutRenderer;
  fontVariable?: string;
  className?: string;
  loop?: boolean;
  transparent?: boolean;
};

const CELL_SIZE = 8;
const FONT_SIZE = 7;
const FORM_DURATION = 3200;
const HOLD_DURATION = 3200;
const DISSOLVE_DURATION = 1800;
const IDLE_DURATION = 700;

function randomChar() {
  return BG_CHARS[Math.floor(Math.random() * BG_CHARS.length)];
}

function getMonoFont() {
  const mono = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-departure-mono")
    .trim();
  return mono ? `${mono}, monospace` : "monospace";
}

function getSansFont() {
  const sans = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-sans")
    .trim();
  return sans || "sans-serif";
}

function createCells(cols: number, rows: number, mask: TextMask): Cell[] {
  const cells: Cell[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const isMask = mask.bitmap[row][col];
      const dx = col - mask.centerCol;
      const dy = row - mask.centerRow;

      cells.push({
        char: randomChar(),
        opacity: 0.1 + Math.random() * 0.2,
        reveal: 0,
        shape: (Math.floor(Math.random() * 3) as 0 | 1 | 2),
        revealOrder: Math.hypot(dx, dy) + Math.random() * 3,
        isMask,
      });
    }
  }

  return cells;
}

function drawShape(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: 0 | 1 | 2,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#ffffff";

  const pad = size * 0.08;
  const inner = size - pad * 2;
  const cx = x + size / 2;
  const cy = y + size / 2;

  if (shape === 0) {
    ctx.fillRect(x + pad, y + pad, inner, inner);
  } else if (shape === 1) {
    ctx.beginPath();
    ctx.moveTo(cx, y + pad);
    ctx.lineTo(x + size - pad, y + size - pad);
    ctx.lineTo(x + pad, y + size - pad);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, inner / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
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

export default function AsciiCharacterEffect({
  text = "Lakshya Kumar",
  slideId,
  renderLayout,
  fontVariable,
  className,
  loop: shouldLoop = true,
  transparent = false,
}: AsciiCharacterEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const slideKeyRef = useRef(slideId ?? text);
  const textRef = useRef(text);
  const pendingSlideKeyRef = useRef<string | null>(null);
  const onSlideChangeRef = useRef<((next: string) => void) | null>(null);
  const renderLayoutRef = useRef(renderLayout);
  const fontVariableRef = useRef(fontVariable);

  useEffect(() => {
    renderLayoutRef.current = renderLayout;
  }, [renderLayout]);

  useEffect(() => {
    fontVariableRef.current = fontVariable;
  }, [fontVariable]);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  const activeSlideKey = slideId ?? `${text}:${fontVariable ?? "default"}`;

  useEffect(() => {
    onSlideChangeRef.current?.(activeSlideKey);
  }, [activeSlideKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    slideKeyRef.current = activeSlideKey;
    const formDuration = shouldLoop ? FORM_DURATION : 2600;
    const dissolveDuration = shouldLoop ? DISSOLVE_DURATION : 1400;
    const idleDuration = shouldLoop ? IDLE_DURATION : 400;

    let cols = 0;
    let rows = 0;
    let cells: Cell[] = [];
    let ready = false;

    let phase: Phase = "idle";
    let phaseStart = performance.now();
    let lastTick = 0;

    const getMaskFont = () => {
      if (fontVariableRef.current) {
        return getGeistPixelFamily(fontVariableRef.current);
      }
      return getMonoFont();
    };

    const buildMask = () => {
      const fonts = { mono: getMaskFont(), sans: getSansFont() };
      if (renderLayoutRef.current) {
        return buildLayoutMask(
          renderLayoutRef.current,
          cols,
          rows,
          CELL_SIZE,
          fonts,
        );
      }
      return buildTextMask(
        textRef.current,
        cols,
        rows,
        CELL_SIZE,
        fonts.mono,
      );
    };

    const rebuild = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(width / CELL_SIZE);
      rows = Math.ceil(height / CELL_SIZE);
      cells = createCells(cols, rows, buildMask());
      phase = "idle";
      phaseStart = performance.now();
    };

    const applyPendingSlide = () => {
      if (pendingSlideKeyRef.current === null) return;
      slideKeyRef.current = pendingSlideKeyRef.current;
      pendingSlideKeyRef.current = null;
      rebuild();
    };

    const hasVisibleText = () =>
      cells.some((cell) => cell.isMask && cell.reveal > 0.05);

    onSlideChangeRef.current = (next: string) => {
      if (!ready || next === slideKeyRef.current) return;

      pendingSlideKeyRef.current = next;

      if (phase === "hold" || phase === "forming" || hasVisibleText()) {
        phase = "dissolve";
        phaseStart = performance.now();
        return;
      }

      if (phase === "dissolve") return;

      applyPendingSlide();
    };

    const startPhase = (next: Phase, now: number) => {
      phase = next;
      phaseStart = now;

      if (next === "idle" || next === "dissolve") {
        for (const cell of cells) {
          cell.reveal = 0;
        }
      }
    };

    const maxRevealOrder = () =>
      Math.max(...cells.filter((c) => c.isMask).map((c) => c.revealOrder), 1);

    const draw = (now: number) => {
      if (!ready) return;

      const { width, height } = canvas.getBoundingClientRect();
      if (transparent) {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);
      }

      const elapsed = now - phaseStart;
      const maxOrder = maxRevealOrder();

      if (phase === "idle" && elapsed > idleDuration) {
        startPhase("forming", now);
      } else if (phase === "forming" && elapsed > formDuration) {
        startPhase("hold", now);
      } else if (shouldLoop && phase === "hold" && elapsed > HOLD_DURATION) {
        startPhase("dissolve", now);
      } else if (phase === "dissolve" && elapsed > dissolveDuration) {
        if (pendingSlideKeyRef.current !== null) {
          applyPendingSlide();
        } else {
          startPhase("idle", now);
        }
      }

      if (now - lastTick > 80) {
        lastTick = now;
        for (const cell of cells) {
          if (!cell.isMask || cell.reveal < 0.05) {
            if (Math.random() < 0.05) cell.char = randomChar();
            if (Math.random() < 0.04) {
              cell.opacity = 0.08 + Math.random() * 0.22;
            }
          }
        }
      }

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const cell = cells[idx];
          const x = col * CELL_SIZE;
          const y = row * CELL_SIZE;

          if (cell.isMask) {
            let progress = 0;

            if (phase === "forming") {
              const t = Math.min(elapsed / formDuration, 1);
              const threshold = (cell.revealOrder / maxOrder) * 0.82;
              progress = Math.max(0, Math.min(1, (t - threshold) / 0.18));
              cell.reveal = progress;
            } else if (phase === "hold") {
              progress = 1;
              cell.reveal = 1;
            } else if (phase === "dissolve") {
              const t = Math.min(elapsed / dissolveDuration, 1);
              const threshold = (cell.revealOrder / maxOrder) * 0.68;
              progress = Math.max(0, 1 - Math.max(0, (t - threshold) / 0.18));
              cell.reveal = progress;
            } else {
              progress = 0;
              cell.reveal = 0;
            }

            if (progress <= 0) {
              drawBgChar(ctx, x, y, cell.char, cell.opacity);
              continue;
            }

            if (progress < 0.6) {
              drawShape(ctx, x, y, CELL_SIZE, cell.shape, 0.4 + progress * 1.1);
              drawBgChar(ctx, x, y, cell.char, (1 - progress) * cell.opacity);
            } else {
              const solidAlpha = Math.min(1, (progress - 0.5) / 0.5);
              ctx.save();
              ctx.globalAlpha = solidAlpha;
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
              ctx.restore();
            }
          } else {
            drawBgChar(ctx, x, y, cell.char, cell.opacity);
          }
        }
      }
    };

    const tick = (now: number) => {
      draw(now);
      rafRef.current = requestAnimationFrame(tick);
    };

    const init = async () => {
      const maskFont = getMaskFont();
      const sans = getSansFont();
      const loads = [
        document.fonts.load(`16px ${maskFont}`),
        document.fonts.load(`16px ${sans}`),
      ];

      for (const font of GEIST_PIXEL_FONT_VARIABLES) {
        loads.push(
          document.fonts.load(`16px ${getGeistPixelFamily(font)}`),
        );
      }

      await Promise.all(loads);
      await document.fonts.ready;
      ready = true;
      rebuild();
      phaseStart = performance.now();
    };

    void init();
    rafRef.current = requestAnimationFrame(tick);

    const observer = new ResizeObserver(() => {
      if (ready) rebuild();
    });
    observer.observe(canvas);

    return () => {
      onSlideChangeRef.current = null;
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [shouldLoop, transparent]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("h-full w-full", !transparent && "bg-black", className)}
      aria-label={text}
    />
  );
}
