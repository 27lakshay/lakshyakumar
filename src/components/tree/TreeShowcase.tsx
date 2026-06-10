"use client";

import { useState } from "react";

import HeatmapTree from "@/components/tree/HeatmapTree";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "yaw", label: "3D yaw", hint: "tree turns on Y-axis as cursor moves left/right" },
  { id: "glide", label: "Smooth glide", hint: "continuous lean, no snapping" },
  { id: "illumination", label: "Illumination", hint: "light follows cursor, no movement" },
  { id: "magnet", label: "Local magnet", hint: "nearby cells pull to cursor" },
  { id: "bend", label: "Bend", hint: "tree arcs toward cursor" },
  { id: "shimmer", label: "Shimmer", hint: "jitter near the cursor" },
] as const;

type Mode = (typeof MODES)[number]["id"];

export default function TreeShowcase() {
  const [mode, setMode] = useState<Mode>("yaw");
  const active = MODES.find((m) => m.id === mode);

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <HeatmapTree mode={mode} />

      <div className="pointer-events-none absolute inset-x-0 top-16 z-60 flex flex-col items-center gap-2 px-4">
        <div className="pointer-events-auto flex flex-wrap justify-center gap-1.5 rounded-full border border-white/10 bg-black/60 p-1.5 shadow-lg backdrop-blur-md">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                mode === m.id
                  ? "bg-white text-black"
                  : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        {active ? (
          <p className="text-[11px] text-white/40">{active.hint}</p>
        ) : null}
      </div>
    </div>
  );
}
