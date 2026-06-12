"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { useTheme } from "next-themes";

import {
  addRipple,
  buildBackgroundSquares,
  drawBackgroundSquares,
  pruneRipples,
  type BackgroundRipple,
  type BackgroundSquare,
} from "@/components/tree/pondGridDraw";
import {
  GROWTH_MS,
  SWAY_EASE,
  type TreeAnchor,
} from "@/components/tree/treeConstants";
import { prefersReducedMotion } from "@/lib/motion-preference";
import { cn } from "@/lib/utils";

export type PondMouse = {
  x: number;
  y: number;
  active: boolean;
};

export type PondGridHandle = {
  addRipple: (x: number, y: number) => void;
};

type PondGridProps = {
  className?: string;
  anchor?: TreeAnchor;
  mouse: PondMouse;
  ariaHidden?: boolean;
};

const PondGrid = forwardRef<PondGridHandle, PondGridProps>(function PondGrid(
  { className, anchor = "bottom-right", mouse, ariaHidden = true },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const isDarkRef = useRef(resolvedTheme !== "light");
  const mouseRef = useRef(mouse);
  const pondDirtyRef = useRef(true);
  const addRippleRef = useRef<(x: number, y: number) => void>(() => {});

  useImperativeHandle(ref, () => ({
    addRipple: (x: number, y: number) => {
      addRippleRef.current(x, y);
    },
  }));

  useEffect(() => {
    isDarkRef.current = resolvedTheme !== "light";
    pondDirtyRef.current = true;
  }, [resolvedTheme]);

  useEffect(() => {
    mouseRef.current = mouse;
  }, [mouse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = prefersReducedMotion();
    let squares: BackgroundSquare[] = [];
    let width = 0;
    let height = 0;
    let startTime = performance.now();
    let raf = 0;
    let bgRevealRadius = reducedMotion ? Number.MAX_SAFE_INTEGER : 0;
    let bgMaxDist = 0;
    let strength = 0;
    let lastDrawStrength = -1;
    const ripples: BackgroundRipple[] = [];

    addRippleRef.current = (x: number, y: number) => {
      if (reducedMotion) return;
      addRipple(ripples, x, y, performance.now());
      pondDirtyRef.current = true;
    };

    const rebuild = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const seed = Math.floor(width * 1000 + height);
      squares = buildBackgroundSquares(width, height, seed, anchor);
      bgMaxDist = 0;
      for (const square of squares) {
        if (square.dist > bgMaxDist) bgMaxDist = square.dist;
      }
      startTime = performance.now();
      bgRevealRadius = reducedMotion ? bgMaxDist : 0;
      pondDirtyRef.current = true;

      if (reducedMotion) {
        tick(performance.now());
      }
    };

    const needsRedraw = (): boolean => {
      if (pondDirtyRef.current) return true;
      if (reducedMotion) return false;
      if (bgRevealRadius < bgMaxDist) return true;
      if (ripples.length > 0) return true;
      if (strength > 0.001) return true;
      if (Math.abs(strength - lastDrawStrength) > 0.001) return true;
      return false;
    };

    const tick = (now: number) => {
      if (!reducedMotion) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / GROWTH_MS);
        const nextBgRing = Math.min(bgMaxDist, Math.floor(progress * bgMaxDist));
        if (nextBgRing > bgRevealRadius) {
          bgRevealRadius = nextBgRing;
        }

        pruneRipples(ripples, now);
      }

      const mouseState = mouseRef.current;
      const targetStrength = mouseState.active && !reducedMotion ? 1 : 0;
      strength += (targetStrength - strength) * SWAY_EASE;

      if (needsRedraw()) {
        ctx.clearRect(0, 0, width, height);
        drawBackgroundSquares(
          ctx,
          squares,
          now,
          reducedMotion,
          bgRevealRadius,
          isDarkRef.current,
          mouseState.x,
          mouseState.y,
          strength,
          ripples,
          width,
          height,
        );

        lastDrawStrength = strength;
        pondDirtyRef.current = false;
      }

      if (!reducedMotion) {
        raf = requestAnimationFrame(tick);
      }
    };

    rebuild();
    if (!reducedMotion) {
      raf = requestAnimationFrame(tick);
    }

    const observer = new ResizeObserver(rebuild);
    observer.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [anchor]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("block h-full w-full bg-transparent", className)}
      aria-hidden={ariaHidden}
    />
  );
});

export default PondGrid;
