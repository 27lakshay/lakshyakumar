"use client";

import HeatmapTree from "@/components/tree/HeatmapTree";
import type { TreeAnchor } from "@/components/tree/HeatmapTree";

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
  fillFactor = 1.18,
  illumBoost = 0.7,
  illumDim = 0.2,
  ariaLabel = "Illuminated tree",
}: IlluminatedTreeProps) {
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
