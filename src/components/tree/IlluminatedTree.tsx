"use client";

import { useRef, useState } from "react";

import HeatmapTree from "@/components/tree/HeatmapTree";
import PondGrid, { type PondGridHandle } from "@/components/tree/PondGrid";
import type { PondMouse } from "@/components/tree/PondGrid";
import type { TreeAnchor } from "@/components/tree/treeConstants";
import { prefersReducedMotion } from "@/lib/motion-preference";
import { cn } from "@/lib/utils";

type IlluminatedTreeProps = {
  className?: string;
  /** Show the faint background grid (off by default for embedding). */
  showGrid?: boolean;
  /** Transparent canvas so a background can show through (default on). */
  transparent?: boolean;
  /** Where the tree is anchored (default bottom-right for footer-style embeds). */
  anchor?: TreeAnchor;
  /** Scale multiplier for the silhouette. */
  fillFactor?: number;
  /** Static grey squares filling the canvas behind the tree. */
  backgroundSquares?: boolean;
  illumBoost?: number;
  illumDim?: number;
  ariaLabel?: string;
};

/**
 * Heatmap tree with cursor-following illumination only — cells brighten near
 * the pointer while the rest dims slightly. Drop into any sized container.
 *
 * @example
 * <div className="h-80 w-full">
 *   <IlluminatedTree />
 * </div>
 */
export default function IlluminatedTree({
  className,
  showGrid = false,
  transparent = true,
  anchor = "bottom-right",
  fillFactor = 0.96,
  backgroundSquares = true,
  illumBoost = 0.7,
  illumDim = 0.2,
  ariaLabel = "Illuminated tree",
}: IlluminatedTreeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pondRef = useRef<PondGridHandle>(null);
  const [mouse, setMouse] = useState<PondMouse>({ x: 0, y: 0, active: false });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  };

  const handlePointerLeave = () => {
    setMouse((prev) => ({ ...prev, active: false }));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!backgroundSquares || prefersReducedMotion()) return;
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    pondRef.current?.addRipple(e.clientX - rect.left, e.clientY - rect.top);
  };

  if (backgroundSquares) {
    return (
      <div
        ref={wrapperRef}
        className={cn("relative h-full w-full", className)}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
      >
        <PondGrid
          ref={pondRef}
          className="absolute inset-0 z-0"
          anchor={anchor}
          mouse={mouse}
        />
        <HeatmapTree
          mode="illumination"
          showGrid={showGrid}
          transparent
          anchor={anchor}
          fillFactor={fillFactor}
          illumBoost={illumBoost}
          illumDim={illumDim}
          composed
          externalMouse={mouse}
          ariaLabel={ariaLabel}
          className="pointer-events-none absolute inset-0 z-10"
        />
      </div>
    );
  }

  return (
    <HeatmapTree
      mode="illumination"
      showGrid={showGrid}
      transparent={transparent}
      anchor={anchor}
      fillFactor={fillFactor}
      illumBoost={illumBoost}
      illumDim={illumDim}
      ariaLabel={ariaLabel}
      className={className}
    />
  );
}
